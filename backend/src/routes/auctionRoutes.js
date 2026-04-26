const express = require("express");
const router = express.Router();

const { createAuction, getAllAuctions, getAuctionDetails, deleteAuction } = require("../controllers/auctionController");
const { protect, authorizeRoles } = require("../middlewares/authMiddleware");

// only buyer can create
router.post("/", protect, authorizeRoles("buyer"), createAuction);
router.get("/", protect, getAllAuctions);
router.get("/:id", protect, getAuctionDetails);
router.delete("/:id", protect, authorizeRoles("buyer"), deleteAuction);

module.exports = router;