// const dotenv = require("dotenv");
// dotenv.config();

// const http = require("http");
// const app = require("./src/app");
// const connectDB = require("./src/config/db");

// const PORT = process.env.PORT || 5000;

// // DB connect
// connectDB();

// // HTTP server
// const server = http.createServer(app);

// server.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });


// const dotenv = require("dotenv");
// dotenv.config();

// const http = require("http");
// const app = require("./src/app");
// const connectDB = require("./src/config/db");
// const User = require("./src/models/User");
// const Message=require("./src/models/Message")
// const { Server } = require("socket.io");

// // DB connect
// connectDB();

// // HTTP server
// const server = http.createServer(app);

// // SOCKET.IO
// const io = new Server(server, {
//   pingTimeout: 60000,
//   cors: {
//     origin: "*",
//   },
// });

// io.on("connection", (socket) => {
//   console.log("🟢 New client connected:", socket.id);

//   // ===============================
//   // USER ONLINE
//   // ===============================
//   // socket.on("setup", async (userId) => {
//   //   socket.userId = userId; // 🔥 STORE USER ID
//   //   socket.join(userId);

//   //   try {
//   //     await User.findByIdAndUpdate(userId, { isOnline: true });
//   //     console.log("User online:", userId);
//   //   } catch (err) {
//   //     console.error("Online update error:", err.message);
//   //   }

//   //   socket.emit("connected");
//   // });
// socket.on("setup", async (userId) => {
//   socket.userId = userId;
//   socket.join(userId);

//   try {
//     await User.findByIdAndUpdate(userId, { isOnline: true });
//     console.log("User online:", userId);

//     // 🔥 ADD THIS: Broadcast to all clients that this user is online
//     socket.broadcast.emit("user online", userId);

//     // 🔥 ADD THIS: Send current online users to the new user
//     const onlineUsers = await User.find({ isOnline: true }).select("_id");
//     const onlineUserIds = onlineUsers.map((user) => user._id.toString());
//     socket.emit("online users", onlineUserIds);
//   } catch (err) {
//     console.error("Online update error:", err.message);
//   }

//   socket.emit("connected");
// });

//   // ===============================
//   // JOIN CHAT ROOM
//   // ===============================
//   socket.on("join chat", (chatId) => {
//     socket.join(chatId);
//     console.log("User joined chat:", chatId);
//   });

//   // ===============================
//   // TYPING INDICATOR
//   // ===============================
//   socket.on("typing", (chatId) => {
//     socket.to(chatId).emit("typing");
//   });

//   socket.on("stop typing", (chatId) => {
//     socket.to(chatId).emit("stop typing");
//   });

//   // ===============================
//   // NEW MESSAGE
//   // ===============================
//   // socket.on("new message", (newMessage) => {
//   //   const chat = newMessage.chat;
//   //   if (!chat || !chat.users) return;

//   //   chat.users.forEach((user) => {
//   //     if (user._id === newMessage.sender._id) return;
//   //     socket.to(user._id).emit("message received", newMessage);
//   //   });
//   // });
// socket.on("new message", (newMessage) => {
//   const chat = newMessage.chat;

//   if (!chat || !chat.users) return;

//   chat.users.forEach((userId) => {
//     if (userId.toString() === newMessage.sender._id.toString()) return;

//     // 🔥 REAL-TIME PUSH
//     socket.to(userId.toString()).emit("message received", newMessage);
//   });
// });

//   // ===============================
//   // USER OFFLINE
//   // ===============================
//   // socket.on("disconnect", async () => {
//   //   console.log("🔴 Client disconnected:", socket.id);

//   //   if (!socket.userId) return;

//   //   await User.findByIdAndUpdate(socket.userId, {
//   //     isOnline: false,
//   //     lastSeen: new Date(), // 🔥 last seen
//   //   });
//   // });
//   socket.on("disconnect", async () => {
//     console.log("🔴 Client disconnected:", socket.id);

//     if (!socket.userId) return;

//     await User.findByIdAndUpdate(socket.userId, {
//       isOnline: false,
//       lastSeen: new Date(),
//     });

//     // 🔥 ADD THIS: Broadcast to all clients that this user went offline
//     socket.broadcast.emit("user offline", socket.userId);
//   });

// socket.on("message seen", async ({ messageId, userId }) => {
//   await Message.findByIdAndUpdate(messageId, {
//     $addToSet: { seenBy: userId },
//   });

//   socket.broadcast.emit("message seen update", {
//     messageId,
//     userId,
//   });
// });

// });

// const PORT = process.env.PORT || 5000;

// server.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });



const dotenv = require("dotenv");
dotenv.config();

const http = require("http");
const app = require("./src/app");
const connectDB = require("./src/config/db");

connectDB();

const server = http.createServer(app);

// SOCKET.IO INIT
const { Server } = require("socket.io");
const io = new Server(server, {
  pingTimeout: 60000,
  cors: { origin: "*" },
});

// 🔥 SOCKET HANDLER
require("./src/socket/socket")(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
