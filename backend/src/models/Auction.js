const mongoose = require("mongoose");

const auctionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    bidStartTime: Date,
    bidCloseTime: Date,
    forcedCloseTime: Date,

    triggerWindow: Number, // X minutes
    extensionDuration: Number, // Y minutes

    triggerType: {
      type: String,
      enum: ["ANY_BID", "RANK_CHANGE", "L1_CHANGE"],
    },

    status: {
      type: String,
      enum: ["UPCOMING", "ACTIVE", "CLOSED", "FORCE_CLOSED"],
      default: "UPCOMING",
    },

    currentLowestBid: {
      type: Number,
      default: null,
    },
    pickupDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Auction", auctionSchema);