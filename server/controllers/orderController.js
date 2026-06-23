const db = require('../config/db');

exports.addToCart = (req, res) => {
    const { product_id, quantity } = req.body;
    const user_id = req.user.id;

    const checkSql = `SELECT * FROM cart WHERE user_id = ? AND product_id = ?`;
    db.query(checkSql, [user_id, product_id], (err, results) => {
        if (err) return res.status(500).json({ message: "DB Check failed." });
        
        if (results && results.length > 0) {
            const updateSql = `UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?`;
            db.query(updateSql, [quantity || 1, user_id, product_id], (uErr) => {
                if (uErr) return res.status(500).json({ message: "Update failed." });
                return res.status(200).json({ message: "Quantity incremented." });
            });
        } else {
            const insertSql = `INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)`;
            db.query(insertSql, [user_id, product_id, quantity || 1], (iErr) => {
                if (iErr) return res.status(500).json({ message: "Insertion failed." });
                return res.status(201).json({ message: "Item committed to cart." });
            });
        }
    });
};

exports.getCart = (req, res) => {
    const sql = `
        SELECT c.id, c.product_id, c.quantity, p.title, p.price, p.image, p.seller_id 
        FROM cart c 
        INNER JOIN products p ON c.product_id = p.id 
        WHERE c.user_id = ?
    `;
    db.query(sql, [req.user.id], (err, results) => {
        if (err) return res.status(500).json({ message: "Fetch fail." });
        res.status(200).json(results || []);
    });
};

exports.placeOrder = (req, res) => {
    const buyer_id = req.user.id;
    const { items, payment_method } = req.body;

    if (!items || items.length === 0) return res.status(400).json({ message: "Empty parameters." });

    const payment_status = payment_method === 'ONLINE' ? 'COMPLETED' : 'PENDING';
    const sql = `INSERT INTO orders (buyer_id, seller_id, product_id, quantity, total_price, payment_method, payment_status) VALUES ?`;
    
    const values = items.map(item => [
        buyer_id, item.seller_id, item.product_id, item.quantity, item.total_price, payment_method, payment_status
    ]);

    db.query(sql, [values], (err) => {
        if (err) return res.status(500).json({ message: "Checkout collapsed." });
        db.query(`DELETE FROM cart WHERE user_id = ?`, [buyer_id], () => {
            res.status(201).json({ message: "Order placed successfully!" });
        });
    });
};

exports.getBuyerOrders = (req, res) => {
    const sql = `SELECT o.*, p.title, p.image FROM orders o JOIN products p ON o.product_id = p.id WHERE o.buyer_id = ? ORDER BY o.created_at DESC`;
    db.query(sql, [req.user.id], (err, results) => {
        if (err) return res.status(500).json({ message: "Error parsing user logs." });
        res.status(200).json(results);
    });
};

exports.getSellerSales = (req, res) => {
    const sql = `SELECT o.*, p.title, p.image FROM orders o JOIN products p ON o.product_id = p.id WHERE o.seller_id = ? ORDER BY o.created_at DESC`;
    db.query(sql, [req.user.id], (err, results) => {
        if (err) return res.status(500).json({ message: "Error parsing sales data logs." });
        res.status(200).json(results);
    });
};
// ==========================================
// REMOVE SINGLE ITEM FROM CART
// ==========================================
exports.removeFromCart = (req, res) => {
    const { id } = req.params; // Cart Row ID
    const user_id = req.user.id;

    const sql = `DELETE FROM cart WHERE id = ? AND user_id = ?`;
    db.query(sql, [id, user_id], (err, result) => {
        if (err) {
            console.error("❌ SQL Error inside Remove-From-Cart:", err.message);
            return res.status(500).json({ message: "Database deletion failed.", error: err.message });
        }
        return res.status(200).json({ message: "Product successfully removed from cart vector." });
    });
};
// ==========================================
// UPDATE ORDER STATUS (SELLER CONTROL)
// ==========================================
exports.updateOrderStatus = (req, res) => {
    const { id } = req.params; // Order ID
    const { order_status } = req.body; // PENDING, SHIPPED, DELIVERED
    const seller_id = req.user.id;

    if (!['PENDING', 'SHIPPED', 'DELIVERED'].includes(order_status)) {
        return res.status(400).json({ message: "Invalid status state value token." });
    }

    const sql = `UPDATE orders SET order_status = ? WHERE id = ? AND seller_id = ?`;
    db.query(sql, [order_status, id, seller_id], (err, result) => {
        if (err) {
            console.error("❌ SQL Error inside Update-Order-Status:", err.message);
            return res.status(500).json({ message: "Database update failed.", error: err.message });
        }
        return res.status(200).json({ message: "Order logistics transit status updated successfully!" });
    });
};