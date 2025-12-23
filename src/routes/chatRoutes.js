const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const { createChat, getMyChats } = require("../controllers/chatController");

const router = express.Router();

router.post("/", protect, createChat);
router.get("/", protect, getMyChats);

module.exports = router;
