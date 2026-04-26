const express = require("express");
const router = express.Router();

const { placeBid } = require("../controllers/bidController");
const { protect, authorizeRoles } = require("../middlewares/authMiddleware");

// only supplier can bid
router.post("/", protect, authorizeRoles("supplier"), placeBid);

module.exports = router;