const express = require("express");
const { getAllUsers } = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload");
const User=require('../models/User')
const router = express.Router();

router.get("/", protect, getAllUsers);
// router.post(
//   "/upload-profile",
//   protect,
//   upload.single("image"),
//   async (req, res) => {
//     const user = await User.findByIdAndUpdate(
//       req.user._id,
//       { profilePic: `/uploads/${req.file.filename}` },
//       { new: true }
//     );

//     res.json(user);
//   }
// );

router.post(
  "/upload-profile",
  protect,
  upload.single("image"),
  async (req, res) => {
    try {
      console.log("File received:", req.file);

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const user = await User.findByIdAndUpdate(
        req.user._id,
        { profilePic: `/uploads/${req.file.filename}` },
        { new: true }
      ).select("-password"); // Don't send password back

      console.log("User updated:", user);
      res.json(user);
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Upload failed", error: error.message });
    }
  }
);


module.exports = router;
