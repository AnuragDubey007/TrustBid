const mongoose = require("mongoose");

const bidSchema = new mongoose.Schema(
  {
    auctionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auction",
    },

    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    freightCharges: { type: Number, required: true },
    originCharges: { type: Number, required: true },
    destinationCharges: { type: Number, required: true },
    transitTime: { type: String },
    quoteValidity: { type: String },
    amount: {
      type: Number,
      required: true,
    },

    rank: {
      type: Number, // 1 = L1, 2 = L2
    },
  },
  { timestamps: true },
);

bidSchema.index({ auctionId: 1, amount: 1 });

module.exports = mongoose.model("Bid", bidSchema);
