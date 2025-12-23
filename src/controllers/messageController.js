const Message = require("../models/Message");
const Chat = require("../models/Chat");

// exports.sendMessage = async (req, res) => {
//   const { content, chatId } = req.body;

//   if (!content || !chatId) {
//     return res.status(400).json({ message: "Invalid data" });
//   }

//   let message = await Message.create({
//     sender: req.user._id,
//     content,
//     chat: chatId,
//   });

//   message = await message.populate("sender", "name email");
//   message = await message.populate("chat");

//   await Chat.findByIdAndUpdate(chatId, {
//     latestMessage: message._id,
//   });

//   res.status(201).json(message);
// };
exports.sendMessage = async (req, res) => {
  const { chatId, content } = req.body;

  let messageData = {
    sender: req.user._id,
    chat: chatId,
    content,
  };

  if (req.file) {
    messageData.file = `/uploads/${req.file.filename}`;
    messageData.fileType = req.file.mimetype.startsWith("image")
      ? "image"
      : "file";
  }

  let message = await Message.create(messageData);

  message = await message.populate("sender", "name profilePic");
  message = await message.populate("chat");

  await Chat.findByIdAndUpdate(chatId, {
    latestMessage: message._id,
  });

  res.status(201).json(message);
};

exports.getMessages = async (req, res) => {
  const messages = await Message.find({ chat: req.params.chatId })
    .populate("sender", "name email")
    .populate("chat")
    .populate("seenBy", "_id");


  res.json(messages);
};
