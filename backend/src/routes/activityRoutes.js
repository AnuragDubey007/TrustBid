const express = require("express");
const router = express.Router();

const { getLogs } = require("../controllers/activityController");
const { protect } = require("../middlewares/authMiddleware");

router.get("/:auctionId", protect, getLogs);

module.exports = router;