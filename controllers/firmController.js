const db = require("../models/database");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage }).single("image");

const addFirm = async (req, res) => {
  try {
    const { firmName, area, category, region, offer, vendor_id } = req.body;
    const image = req.file ? req.file.filename : null;

    console.log("Request body:", req.body);
    console.log("Request file:", req.file);

    if (!firmName || !area || !category || !vendor_id || !image) {
      return res.status(400).json({
        message: "Missing required fields",
        received: { firmName, area, category, vendor_id, image },
      });
    }

    const query = `INSERT INTO firms (firmName, area, category, region, offer, image, vendor_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)`;

    db.query(
      query,
      [firmName, area, category, region, offer, image, vendor_id],
      (err, results) => {
        if (err) {
          console.error("Database error:", err);
          return res
            .status(500)
            .json({ message: "DB insert error", error: err.message });
        }
        res.status(200).json({
          message: "Firm added successfully",
          firmId: results.insertId,
        });
      }
    );
  } catch (error) {
    console.error("Catch error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteFirm = async (req, res) => {
  const firmId = req.params.firmId;

  const deleteQuery = `DELETE FROM firms WHERE id = ?`;

  db.query(deleteQuery, [firmId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "DB delete error", error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Firm not found" });
    }

    res.status(200).json({ message: "Firm deleted successfully" });
  });
};

module.exports = { addFirm, upload, deleteFirm };
