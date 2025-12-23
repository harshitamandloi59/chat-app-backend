// const User = require("../models/User");
// const Message = require("../models/Message");

// module.exports = (io) => {
//   io.on("connection", (socket) => {
//     console.log("🟢 New client connected:", socket.id);

//     // ===============================
//     // USER ONLINE
//     // ===============================
//     socket.on("setup", async (userId) => {
//       socket.userId = userId;
//       socket.join(userId);

//       await User.findByIdAndUpdate(userId, { isOnline: true });

//       // 🔥 notify others
//       socket.broadcast.emit("user online", userId);

//       // 🔥 send online users list
//       const onlineUsers = await User.find({ isOnline: true }).select("_id");
//       socket.emit(
//         "online users",
//         onlineUsers.map((u) => u._id.toString())
//       );

//       socket.emit("connected");
//     });

//     // ===============================
//     // JOIN CHAT
//     // ===============================
//     socket.on("join chat", (chatId) => {
//       socket.join(chatId);
//     });

//     // ===============================
//     // TYPING
//     // ===============================
//     socket.on("typing", (chatId) => {
//       socket.to(chatId).emit("typing");
//     });

//     socket.on("stop typing", (chatId) => {
//       socket.to(chatId).emit("stop typing");
//     });

//     // ===============================
//     // NEW MESSAGE
//     // ===============================
//     socket.on("new message", (newMessage) => {
//       const chat = newMessage.chat;
//       if (!chat?.users) return;

//       chat.users.forEach((userId) => {
//         if (userId.toString() === newMessage.sender._id.toString()) return;
//         socket.to(userId.toString()).emit("message received", newMessage);
//       });
//     });

//     // ===============================
//     // MESSAGE SEEN
//     // ===============================
//     socket.on("message seen", async ({ messageId, userId }) => {
//       await Message.findByIdAndUpdate(messageId, {
//         $addToSet: { seenBy: userId },
//       });

//       socket.broadcast.emit("message seen update", {
//         messageId,
//         userId,
//       });
//     });

//     // ===============================
//     // USER OFFLINE
//     // ===============================
//     socket.on("disconnect", async () => {
//       if (!socket.userId) return;

//       await User.findByIdAndUpdate(socket.userId, {
//         isOnline: false,
//         lastSeen: new Date(),
//       });

//       socket.broadcast.emit("user offline", socket.userId);
//       console.log("🔴 Client disconnected:", socket.id);
//     });
//   });
// };


const User = require("../models/User");
const Message = require("../models/Message");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("🟢 New client connected:", socket.id);

    // ===============================
    // USER ONLINE
    // ===============================
    socket.on("setup", async (userId) => {
      socket.userId = userId;

      // 🔥 personal room (1-to-1 base)
      socket.join(userId);

      await User.findByIdAndUpdate(userId, { isOnline: true });

      // 🔥 ONLY self confirmation
      socket.emit("connected");
    });

    // ===============================
    // JOIN CHAT ROOM
    // ===============================
    socket.on("join chat", (chatId) => {
      socket.join(chatId);
    });

    // ===============================
    // TYPING INDICATOR
    // ===============================
    socket.on("typing", ({ chatId, toUserId }) => {
      // 🔥 1-to-1 typing
      socket.to(toUserId).emit("typing", chatId);
    });

    socket.on("stop typing", ({ chatId, toUserId }) => {
      socket.to(toUserId).emit("stop typing", chatId);
    });

    // ===============================
    // NEW MESSAGE (1-to-1)
    // ===============================
    socket.on("new message", (newMessage) => {
      const chat = newMessage.chat;
      if (!chat?.users) return;

      chat.users.forEach((userId) => {
        if (userId.toString() === newMessage.sender._id.toString()) return;

        // 🔥 send message only to receiver
        io.to(userId.toString()).emit("message received", newMessage);
      });
    });

    // ===============================
    // MESSAGE SEEN (1-to-1)
    // ===============================
    socket.on("message seen", async ({ messageId, userId, senderId }) => {
      await Message.findByIdAndUpdate(messageId, {
        $addToSet: { seenBy: userId },
      });

      // 🔥 notify only sender
      io.to(senderId).emit("message seen update", {
        messageId,
        userId,
      });
    });

    // ===============================
    // USER OFFLINE
    // ===============================
    socket.on("disconnect", async () => {
      if (!socket.userId) return;

      await User.findByIdAndUpdate(socket.userId, {
        isOnline: false,
        lastSeen: new Date(),
      });

      console.log("🔴 Client disconnected:", socket.id);
    });
  });
};
