const db = require("../models/database");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage }).single("image");

const addFirm = async (req, res) => {
  const { firmName, area, category, region, offer, vendor_id } = req.body;
  const image = req.file ? req.file.filename : null;
  console.log(req.body); // firmName, area, category, region, offer, vendor_id
  console.log(req.file);

  const query = `INSERT INTO firms (firmName, area, category, region, offer, image, vendor_id)
  VALUES (?, ?, ?, ?, ?, ?, ?)`;

  db.query(query, [firmName, area, category, region, offer, image, vendor_id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "DB insert error", error: err });
    }
    res.status(200).json({ message: "Firm added successfully" });
  });
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
