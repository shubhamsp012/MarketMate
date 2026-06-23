const db = require('../config/db');

// ==========================================
// 1. CONTROLLER: BUYER DASHBOARD DISPLAY DATA
// ==========================================
exports.getAllProducts = (req, res) => {
    const sql = `
        SELECT p.*, u.name AS seller_name
        FROM products p
        JOIN users u
        ON p.seller_id = u.id
        ORDER BY p.created_at DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                message: 'Server Error loading global marketplace dataset'
            });
        }
        res.status(200).json(results);
    });
};

// ==========================================
// 2. CONTROLLER: SELLER DASHBOARD DISPLAY DATA
// ==========================================
exports.getMyProducts = (req, res) => {
    const sql = `
        SELECT *
        FROM products
        WHERE seller_id = ?
        ORDER BY created_at DESC
    `;

    db.query(
        sql,
        [req.user.id],
        (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    message: 'Server Error parsing account inventory logs'
                });
            }
            res.status(200).json(results);
        }
    );
};

// ==========================================
// 3. CONTROLLER: ADD PRODUCT WITH PHOTO ENVELOPE
// ==========================================
exports.addProduct = (req, res) => {
    const { title, description, price, category } = req.body;
    const imagePath = req.file ? `/uploads/products/${req.file.filename}` : null;

    if (!title || !price) {
        return res.status(400).json({
            message: 'Title and Price parameters cannot be null.'
        });
    }

    const sql = `
        INSERT INTO products
        (title, description, price, category, image, seller_id)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [title, description, price, category, imagePath, req.user.id],
        (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    message: 'Unable to commit product listing node'
                });
            }
            res.status(201).json({
                message: 'Product Added Successfully with Image Payload',
                productId: result.insertId
            });
        }
    );
};

// ==========================================
// 4. CONTROLLER: GET SINGLE PRODUCT BY ID (For Pre-populating Edit Form)
// ==========================================
exports.getProductById = (req, res) => {
    const sql = `SELECT * FROM products WHERE id = ?`;

    db.query(sql, [req.params.id], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: 'Server error reading product data' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Product not found inside repository index' });
        }
        res.status(200).json(results[0]);
    });
};

// ==========================================
// 5. CONTROLLER: UPDATE EXISTING PRODUCT (With Optional Image Update)
// ==========================================
exports.updateProduct = (req, res) => {
    const { title, description, price, category } = req.body;
    const productId = req.params.id;
    const seller_id = req.user.id; // Tenant verification logic

    if (!title || !price) {
        return res.status(400).json({ message: 'Title and Price details are required.' });
    }

    let sql = `
        UPDATE products 
        SET title = ?, description = ?, price = ?, category = ?
    `;
    let queryParams = [title, description, price, category];

    // Check mapping parameter: Agar user ne nayi photo upload ki hai
    if (req.file) {
        const imagePath = `/uploads/products/${req.file.filename}`;
        sql += `, image = ?`;
        queryParams.push(imagePath);
    }

    // Security clause injection: Only the authorized seller can update this row
    sql += ` WHERE id = ? AND seller_id = ?`;
    queryParams.push(productId, seller_id);

    db.query(sql, queryParams, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: 'Database update orchestration failed' });
        }
        if (result.affectedRows === 0) {
            return res.status(403).json({ message: 'Unauthorized or resource missing.' });
        }
        res.status(200).json({ message: 'Product attributes modified successfully.' });
    });
};