const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http'); // 🚨 REQUIRED: Wrap express inside standard HTTP layer
const { Server } = require('socket.io'); // 🚨 REQUIRED: Realtime communication socket
require('dotenv').config();

const app = express();
const server = http.createServer(app); // Bind Express onto Server instantiation instance

// Initialize Socket.io context on server grid
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // Frontend Dev server loop path
        methods: ["GET", "POST", "PUT"]
    }
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database handling linkage mapping
const db = require('./config/db');

// ================= REAL-TIME WEBSOCKETS COMMUNICATIONS INDEX =================
io.on('connection', (socket) => {
    console.log(`User connected to live chat pipeline node: ${socket.id}`);

    socket.on('join_room', (data) => {
        socket.join(data.room_id);
        console.log(`User assigned inside secure room channel vector: ${data.room_id}`);
    });

    socket.on('send_message', (data) => {
        const { room_id, sender_id, message_text } = data;
        
        const sql = "INSERT INTO messages (room_id, sender_id, message_text) VALUES (?, ?, ?)";
        db.query(sql, [room_id, sender_id, message_text], (err, result) => {
            if (!err) {
                // Instantly emit newly aggregated message array block to current channels
                io.to(room_id).emit('receive_message', {
                    id: result.insertId,
                    room_id,
                    sender_id,
                    message_text,
                    created_at: new Date()
                });
            } else {
                console.error("Message injection error:", err.message);
            }
        });
    });

    socket.on('disconnect', () => {
        console.log('User logged out from synchronization negotiation pipeline');
    });
});

// Routes Wiring
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/chat', require('./routes/chatRoutes')); // 🚨 ADDED: Registers secure dynamic chat desks controllers endpoints

app.get('/', (req, res) => {
    res.send('API Running smoothly with WebSockets.');
});

const PORT = process.env.PORT || 5000;
// 🚨 SYSTEM OVERRIDE: Bound listener sequence to http 'server' directly instead of 'app'
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});