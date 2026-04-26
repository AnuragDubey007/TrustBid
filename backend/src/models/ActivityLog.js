const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    auctionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auction",
    },

    type: {
      type: String,
      enum: ["BID", "EXTENSION"],
    },

    message: String,

    metadata: Object, // optional extra info

  },
  { timestamps: true }
);

module.exports = mongoose.model("ActivityLog", activityLogSchema);