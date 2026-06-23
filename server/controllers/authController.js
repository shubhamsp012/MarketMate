const db = require('../config/db');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');
const jwt = require('jsonwebtoken');

// ================= REGISTER =================
exports.register = async (req, res) => {
    try {
        // 🚨 UPDATED: Extracted address explicitly from req.body
        const { name, email, password, role, address } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Please fill all required fields"
            });
        }

        // Check if user already exists
        db.query(
            "SELECT * FROM users WHERE email = ?",
            [email],
            async (err, results) => {

                if (err) {
                    console.log("Database Error:", err);
                    return res.status(500).json({
                        message: "Database Error"
                    });
                }

                // Email already exists
                if (results.length > 0) {
                    return res.status(400).json({
                        message: "Email already exists"
                    });
                }

                // Hash Password
                const hashedPassword = await bcrypt.hash(password, 10);

                // 🚨 UPDATED: Insert query updated to include address mapping row parameter
                db.query(
                    "INSERT INTO users (name, email, password, role, address) VALUES (?, ?, ?, ?, ?)",
                    [
                        name,
                        email,
                        hashedPassword,
                        role || "buyer",
                        address || null // Safely allocate address string context or default null
                    ],
                    (err, result) => {

                        if (err) {
                            console.log("Insert Error:", err);

                            return res.status(500).json({
                                message: "Error creating user"
                            });
                        }

                        res.status(201).json({
                            message: "User registered successfully"
                        });
                    }
                );
            }
        );

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });
    }
};


// ================= LOGIN =================
exports.login = (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Please provide email and password"
        });
    }

    db.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        async (err, results) => {

            if (err) {
                console.log(err);

                return res.status(500).json({
                    message: "Database Error"
                });
            }

            if (results.length === 0) {
                return res.status(400).json({
                    message: "Invalid Email or Password"
                });
            }

            const user = results[0];

            // Compare password
            const isMatch = await bcrypt.compare(
                password,
                user.password
            );

            if (!isMatch) {
                return res.status(400).json({
                    message: "Invalid Email or Password"
                });
            }

            // Generate JWT Token
            const token = generateToken(
                user.id,
                user.role
            );

            res.status(200).json({
                message: "Login Successful",
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    address: user.address // 🚨 ADDED: Relays physical location data node to frontend client
                }
            });
        }
    );
};

// ================= PROTECT MIDDLEWARE =================
exports.protect = (req, res, next) => {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            message: 'Unauthorized'
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;

        next();

    } catch (error) {
        return res.status(401).json({
            message: 'Invalid token'
        });
    }
};
// 🚨 NEW ENDPOINT ADDITION: UPDATE USER PROFILE ATTRIBUTES
exports.updateProfile = (req, res) => {
    const { name, email, address } = req.body;
    const userId = req.user.id; // Extracted directly from protect middleware decoder

    if (!name || !email) {
        return res.status(400).json({ message: "Identity fields name and email cannot be blank." });
    }

    // SQL execution schema pipeline commit overrides
    const sql = `UPDATE users SET name = ?, email = ?, address = ? WHERE id = ?`;
    db.query(sql, [name, email, address || null, userId], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ message: "This email location node is already captured by another client." });
            }
            console.error("Profile SQL upgrade collapse:", err.message);
            return res.status(500).json({ message: "Failed updating database schema rows." });
        }
        return res.status(200).json({ message: "Matrix profiles successfully synchronized!" });
    });
};