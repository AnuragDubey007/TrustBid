const Bid = require("../models/Bid");
const Auction = require("../models/Auction");
const ActivityLog = require("../models/ActivityLog");
const getAuctionStatus = require("../utils/getAuctionStatus");
const mongoose = require("mongoose");

// 🔹 Place Bid (ONLY SUPPLIER)
const placeBid = async (req, res) => {
  try {
    const { auctionId, freight, origin, dest, transitTime, quoteValidity } =
      req.body;

    const amount = freight + origin + dest;

    const auction = await Auction.findById(auctionId);

    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    const status = getAuctionStatus(auction);
    auction.status = status;

    // ❌ block if not active
    if (status !== "ACTIVE") {
      return res.status(400).json({
        message: `Auction is ${status}`,
      });
    }

    const now = new Date();

    // 🔥 STATUS UPDATE
    if (now < new Date(auction.bidStartTime)) {
      auction.status = "UPCOMING";
    } else if (
      now >= new Date(auction.bidStartTime) &&
      now <= new Date(auction.bidCloseTime)
    ) {
      auction.status = "ACTIVE";
    } else if (
      now > new Date(auction.bidCloseTime) &&
      now <= new Date(auction.forcedCloseTime)
    ) {
      auction.status = "CLOSED";
    } else if (now > new Date(auction.forcedCloseTime)) {
      auction.status = "FORCE_CLOSED";
    }

    // ❌ check auction started
    if (now < new Date(auction.bidStartTime)) {
      return res.status(400).json({ message: "Auction not started yet" });
    }
    if (new Date() > new Date(auction.forcedCloseTime)) {
      return res.status(400).json({
        message: "Auction force closed",
      });
    }

    // ❌ check auction ended
    if (now > new Date(auction.bidCloseTime)) {
      return res.status(400).json({ message: "Auction ended" });
    }

    const lastBid = await Bid.findOne({
      auctionId,
      supplierId: req.user.id,
    }).sort({ createdAt: -1 });

    if (lastBid && amount >= lastBid.amount) {
      return res.status(400).json({
        message: "New bid must be lower than your previous bid",
      });
    }

    const tieBid = await Bid.findOne({ auctionId, amount });

    if (tieBid) {
      return res.status(400).json({
        message: "A bid with this amount already exists. Please bid lower.",
      });
    }

    // 2. EXTENSION LOGIC (Check BEFORE creating the new bid
    const oldLowest = auction.currentLowestBid;

    const bidCloseTime = new Date(auction.bidCloseTime);

    const nowTime = new Date();

    const triggerStartTime = new Date(
      bidCloseTime.getTime() - auction.triggerWindow * 60 * 1000,
    );

    let shouldExtend = false;

    // ONLY check inside window
    if (nowTime >= triggerStartTime && nowTime <= bidCloseTime) {
      if (auction.triggerType === "ANY_BID") {
        shouldExtend = true;
      } else if (auction.triggerType === "L1_CHANGE") {
        if (oldLowest === null || amount < oldLowest) {
          shouldExtend = true;
        }
      } else if (auction.triggerType === "RANK_CHANGE") {
        const otherSuppliersBest = await Bid.aggregate([
          {
            $match: {
              auctionId: auction._id,
              supplierId: { $ne: req.user.id },
            },
          },
          {
            $group: {
              _id: "$supplierId",
              minAmount: { $min: "$amount" },
            },
          },
        ]);

        let didRankChange = false;

        for (let supplier of otherSuppliersBest) {
          if (amount < supplier.minAmount) {
            didRankChange = true;
            break;
          }
        }

        if (didRankChange) {
          shouldExtend = true;
        }
      }
    }

    // APPLY EXTENSION
    if (shouldExtend) {
      let newCloseTime = new Date(
        bidCloseTime.getTime() + auction.extensionDuration * 60 * 1000,
      );

      if (newCloseTime > new Date(auction.forcedCloseTime)) {
        newCloseTime = new Date(auction.forcedCloseTime);
      }

      auction.bidCloseTime = newCloseTime;

      let reason = auction.triggerType;

      await ActivityLog.create({
        auctionId,
        type: "EXTENSION",
        message: `Auction extended due to ${reason}`,
        metadata: {
          reason,
          newCloseTime: newCloseTime,
        },
      });

      console.log("Auction Extended to:", newCloseTime);
    }

    let bid;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 🔥 re-check inside transaction
      const lowestBid = await Bid.findOne({ auctionId })
        .sort({ amount: 1 })
        .session(session);

      if (lowestBid && amount >= lowestBid.amount) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          message: "Bid must be lower than current lowest bid",
        });
      }

      const created = await Bid.create(
        [
          {
            auctionId,
            supplierId: req.user.id,
            freightCharges: freight,
            originCharges: origin,
            destinationCharges: dest,
            transitTime,
            quoteValidity,
            amount,
          },
        ],
        { session },
      );
      bid = created[0];

      // 🔥 update lowest ONLY if valid
      if (
        auction.currentLowestBid === null ||
        amount < auction.currentLowestBid
      ) {
        auction.currentLowestBid = amount;
        await auction.save({ session });
      }

      await session.commitTransaction();
      session.endSession();

      // continue normal flow (logs, socket, ranking...)
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }

    const User = require("../models/User");
    const user = await User.findById(req.user.id);

    await ActivityLog.create({
      auctionId,
      type: "BID",
      message: `Supplier ${user.name} placed bid ₹${amount}`,
      metadata: {
        supplierId: req.user.id,
        amount,
      },
    });

    // 🔥 UPDATE RANKING (simple way)
    const allBids = await Bid.find({ auctionId }).sort({ amount: 1 });

    const bulkOps = allBids.map((b, i) => ({
      updateOne: {
        filter: { _id: b._id },
        update: { $set: { rank: i + 1 } },
      },
    }));

    if (bulkOps.length > 0) {
      await Bid.bulkWrite(bulkOps);
    }

    const io = req.app.get("io");

    io.to(auctionId).emit("newBid", {
      auctionId,
      amount,
      supplierId: req.user.id,
    });
    if (shouldExtend) {
      io.to(auctionId).emit("auctionExtended", {
        auctionId,
        newCloseTime: auction.bidCloseTime,
        message: "Auction time extended due to activity!",
      });
    }

    res.status(201).json({
      message: shouldExtend
        ? "Bid placed & Auction extended!"
        : "Bid placed successfully",
      bid,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { placeBid };
