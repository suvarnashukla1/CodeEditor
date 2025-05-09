const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

// ✅ ONLY allow localhost:5173
app.use(cors({
  origin: function (origin, callback) {
    // Allow localhost only
    if (origin === "http://localhost:5173") {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

// Create the HTTP server
const server = http.createServer(app);

// Initialize Socket.io with the server
const io = socketIo(server, {
  cors: {
    origin: function (origin, callback) {
      // Allow localhost only
      if (origin === "http://localhost:5173") {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const PORT = process.env.PORT || 3001;
const rooms = new Map();

app.use(express.json());

// Route to create a new room
app.get("/createroom", async (req, res) => {
  try {
    const roomId = Math.random().toString(36).substring(2, 8);
    rooms.set(roomId, {
      users: new Map(),
    });

    const userDir = path.join(__dirname, "User");
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir);
    }

    const filePath = path.join(userDir, `${roomId}.js`);
    const initialContent =
      "// Type your JavaScript code here\nfunction example() {\n  // Start typing here...\n}\n";

    await fs.promises.writeFile(filePath, initialContent);

    res.status(201).json({ roomId });
  } catch (error) {
    console.error("Error creating room:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Socket.io connection logic
io.on("connection", (socket) => {
  console.log("New client connected");

  // Handle joining a room
  socket.on("join-room", async ({ roomId, username }) => {
    socket.join(roomId);
    console.log(`User ${username} joined room: ${roomId}`);

    if (!rooms.has(roomId)) {
      rooms.set(roomId, { users: new Map() });
    }

    rooms.get(roomId).users.set(socket.id, username);

    const filePath = path.join(__dirname, "User", `${roomId}.js`);
    try {
      const data = await fs.promises.readFile(filePath, 'utf8');
      socket.emit("initial-code", data);
    } catch (err) {
      console.error("Error reading file:", err);
      socket.emit("initial-code", "// Error loading code");
    }

    io.to(roomId).emit("user-list", Array.from(rooms.get(roomId).users.values()));
  });

socket.on("code-change", async ({ roomId, newCode }) => {
  const filePath = path.join(__dirname, "User", `${roomId}.js`);
  try {
    await fs.promises.writeFile(filePath, newCode);
    io.to(roomId).emit("code-update", newCode);
  } catch (err) {
    console.error("Error writing file:", err);
  }
});


  // Handle disconnections
  socket.on("disconnect", () => {
    console.log("Client disconnected");
    rooms.forEach((room, roomId) => {
      if (room.users.has(socket.id)) {
        room.users.delete(socket.id);
        if (room.users.size === 0) {
          rooms.delete(roomId);
          const filePath = path.join(__dirname, "User", `${roomId}.js`);
          fs.unlink(filePath, (err) => {
            if (err) console.error("Error deleting file:", err);
          });
        } else {
          io.to(roomId).emit("user-list", Array.from(room.users.values()));
        }
      }
    });
  });
});

// Start the server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
