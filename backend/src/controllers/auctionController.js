const Auction = require("../models/Auction");
const Bid = require("../models/Bid");
const ActivityLog = require("../models/ActivityLog");

// 🔹 Create Auction (ONLY BUYER)
const createAuction = async (req, res) => {
  try {
    const {
      name,
      bidStartTime,
      bidCloseTime,
      forcedCloseTime,
      triggerWindow,
      extensionDuration,
      triggerType,
    } = req.body;

    // ✅ validations
    if (!name || !bidStartTime || !bidCloseTime || !forcedCloseTime) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const now = new Date();

    const start = new Date(bidStartTime);
    const close = new Date(bidCloseTime);
    const forced = new Date(forcedCloseTime);

    //  start must be future
    if (start < now) {
    return res.status(400).json({
        message: "Bid start cannot be in the past",
    });
    }

    //  close must be after start
    if (close <= start) {
    return res.status(400).json({
        message: "Bid close must be after bid start",
    });
    }

    //  forced must be after close
    if (forced <= close) {
    return res.status(400).json({
        message: "Forced close must be after bid close",
    });
    }

    //  forced must be future
    if (forced <= now) {
    return res.status(400).json({
        message: "Forced close must be in the future",
    });
    }

    //  config validation
    if (triggerWindow <= 0 || extensionDuration <= 0) {
    return res.status(400).json({
        message: "Trigger window and extension must be positive",
    });
    }

    // if (extensionDuration > triggerWindow) {
    // return res.status(400).json({
    //     message: "Extension duration cannot exceed trigger window",
    // });
    // }

    const auction = await Auction.create({
      name,
      createdBy: req.user.id,
      bidStartTime,
      bidCloseTime,
      forcedCloseTime,
      triggerWindow,
      extensionDuration,
      triggerType,
    });

    res.status(201).json(auction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllAuctions = async (req, res) => {
  try {
    const auctions = await Auction.find().sort({ createdAt: -1 });

    const getAuctionStatus = require("../utils/getAuctionStatus");

    const updated = auctions.map((a) => {
      return {
        ...a.toObject(),
        status: getAuctionStatus(a),
      };
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAuctionDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const auction = await Auction.findById(id);

    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    const bids = await Bid.find({ auctionId: id })
    .populate("supplierId", "name email") 
    .sort({ amount: 1 });

    const logs = await ActivityLog.find({ auctionId: id })
      .sort({ createdAt: -1 });

    const getAuctionStatus = require("../utils/getAuctionStatus");

    res.json({
      auction: {
        ...auction.toObject(),
        status: getAuctionStatus(auction),
      },
      bids,
      logs,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    // 🔥 only creator can delete
    if (auction.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // 🔥 clean related data
    await Bid.deleteMany({ auctionId: req.params.id });
    await ActivityLog.deleteMany({ auctionId: req.params.id });

    await auction.deleteOne();

    res.json({ message: "Auction deleted" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createAuction, getAllAuctions, getAuctionDetails, deleteAuction };