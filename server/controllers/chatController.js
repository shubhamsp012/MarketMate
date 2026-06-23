const db = require('../config/db');

// ================= ACCESSIBILITY MATRIX: INITIALIZE ROOMS =================
exports.accessChatRoom = (req, res) => {
    const { product_id, seller_id } = req.body;
    const buyer_id = req.user.id; 

    if (Number(buyer_id) === Number(seller_id)) {
        return res.status(400).json({ message: "Self negotiation is disabled inside this node." });
    }

    const checkSql = "SELECT * FROM chat_rooms WHERE product_id = ? AND buyer_id = ? AND seller_id = ?";
    db.query(checkSql, [product_id, buyer_id, seller_id], (err, results) => {
        if (err) {
            console.error("🚨 ACCESS CHAT ROOM ERROR:", err.message);
            return res.status(500).json({ message: "Database read collapse vectors error.", error: err.message });
        }

        if (results.length > 0) {
            return res.status(200).json(results[0]); 
        }

        const insertSql = "INSERT INTO chat_rooms (product_id, buyer_id, seller_id) VALUES (?, ?, ?)";
        db.query(insertSql, [product_id, buyer_id, seller_id], (err, result) => {
            if (err) {
                console.error("🚨 INSERT CHAT ROOM ERROR:", err.message);
                return res.status(500).json({ message: "Room allocation sequence error.", error: err.message });
            }
            return res.status(201).json({ id: result.insertId, product_id, buyer_id, seller_id });
        });
    });
};

// ================= FETCH CONVERSATIONS CHANNELS (FIXED SUB-QUERY ARCHITECTURE) =================
exports.fetchActiveUserRooms = (req, res) => {
    const userId = req.user.id;
    
    // 🚨 SAFE ARCHITECTURE FALLBACK: Using standalone explicit sub-queries to prevent Join crashes if schemas slightly mismatch
    const sql = `
        SELECT 
            cr.id,
            cr.product_id,
            cr.buyer_id,
            cr.seller_id,
            cr.created_at,
            p.title AS product_title,
            (SELECT name FROM users WHERE id = cr.buyer_id) AS buyer_name,
            (SELECT name FROM users WHERE id = cr.seller_id) AS seller_name
        FROM chat_rooms cr
        JOIN products p ON cr.product_id = p.id
        WHERE cr.buyer_id = ? OR cr.seller_id = ?
        ORDER BY cr.created_at DESC`;

    db.query(sql, [userId, userId], (err, results) => {
        if (err) {
            console.error("🚨🚨 CRITICAL CHAT QUERY COLLAPSE:", err.message); // This will pinpoint the exact reason in your node console
            return res.status(500).json({ 
                message: "Active channels aggregation failure.",
                error: err.message 
            });
        }
        return res.status(200).json(results || []);
    });
};

// ================= FETCH ROOM THREAD MESSAGES HISTORIES =================
exports.fetchRoomMessages = (req, res) => {
    const roomId = req.params.roomId;
    const sql = "SELECT * FROM messages WHERE room_id = ? ORDER BY created_at ASC";
    db.query(sql, [roomId], (err, results) => {
        if (err) {
            console.error("🚨 FETCH MESSAGES ERROR:", err.message);
            return res.status(500).json({ message: "History pipeline fetch failure.", error: err.message });
        }
        return res.status(200).json(results || []);
    });
};