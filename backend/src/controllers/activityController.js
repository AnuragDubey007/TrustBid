const ActivityLog = require("../models/ActivityLog");

const getLogs = async (req, res) => {
  try {
    const { auctionId } = req.params;

    const logs = await ActivityLog.find({ auctionId })
      .sort({ createdAt: -1 });

    res.json(logs);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getLogs };