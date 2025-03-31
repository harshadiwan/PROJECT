const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ MySQL Connection
const db = mysql.createConnection({
    host: "sql12.freesqldatabase.com",
    user: "sql12770539",
    password: "IAXqGSUqLB", // Change this if needed
    database: "sql12770539"
});

db.connect(err => {
    if (err) {
        console.error("❌ Database connection failed:", err);
        process.exit(1);
    }
    console.log("✅ MySQL Connected...");
});

// ✅ Mark Attendance
app.post("/mark-attendance", (req, res) => {
    const { username } = req.body;
    if (!username) return res.status(400).json({ message: "Username is required" });

    const date = new Date().toISOString().split("T")[0]; // Get today's date (YYYY-MM-DD)

    const query = `INSERT INTO attendance (username, date, status) 
                   VALUES (?, ?, 'present') 
                   ON DUPLICATE KEY UPDATE status='present'`;

    db.query(query, [username, date], (err) => {
        if (err) {
            console.error("❌ Database error:", err);
            return res.status(500).json({ message: "❌ Database error", error: err });
        }
        res.json({ message: "✅ Attendance marked successfully!" });
    });
});

// ✅ Fetch Attendance for a Specific Month
app.get("/attendance", (req, res) => {
    let { username, month, year } = req.query;
    if (!username || !month || !year) return res.status(400).json({ message: "Missing parameters" });

    month = parseInt(month, 10);
    year = parseInt(year, 10);

    const query = `SELECT DATE_FORMAT(date, '%Y-%m-%d') AS date FROM attendance 
                   WHERE username = ? AND MONTH(date) = ? AND YEAR(date) = ?`;

    db.query(query, [username, month, year], (err, results) => {
        if (err) {
            console.error("❌ Database error:", err);
            return res.status(500).json({ message: "❌ Database error", error: err });
        }
        res.json(results);
    });
});

// ✅ Count Present Days in a Month
app.get("/attendance-count", (req, res) => {
    let { username, month, year } = req.query;
    if (!username || !month || !year) {
        return res.status(400).json({ message: "Missing parameters" });
    }

    month = parseInt(month, 10);
    year = parseInt(year, 10);

    const query = `SELECT COUNT(DISTINCT DATE(date)) AS total_present_days FROM attendance 
                   WHERE username = ? AND status = 'present' 
                   AND MONTH(date) = ? AND YEAR(date) = ?`;

    db.query(query, [username, month, year], (err, results) => {
        if (err) {
            console.error("❌ Database error:", err);
            return res.status(500).json({ message: "❌ Database error", error: err });
        }

        const totalPresentDays = results[0]?.total_present_days || 0;
        res.json({ count: totalPresentDays });
    });
});

// ✅ Start Server
const PORT = 2100;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
