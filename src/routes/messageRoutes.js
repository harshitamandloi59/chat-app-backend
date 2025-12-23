// const express = require("express");
// const { protect } = require("../middlewares/authMiddleware");
// const {
//   sendMessage,
//   getMessages,
// } = require("../controllers/messageController");

// const router = express.Router();

// router.post("/", protect, sendMessage);
// router.get("/:chatId", protect, getMessages);

// module.exports = router;


const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload");
const {
  sendMessage,
  getMessages,
} = require("../controllers/messageController");

const router = express.Router();

router.post("/", protect, upload.single("file"), sendMessage);
router.get("/:chatId", protect, getMessages);

module.exports = router;
