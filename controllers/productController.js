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

const addProduct = async (req, res) => {
  try {
    const { productName, price, category, bestSeller, description } = req.body; // <-- destination remove, description add
    const image = req.file ? req.file.filename : null;
    const firmId = req.params.firmId;

    console.log("Request body:", req.body);
    console.log("Request file:", req.file);
    console.log("Firm ID:", firmId);

    if (!productName || !price || !firmId || !image) {
      return res.status(400).json({
        message: "Missing required fields",
        received: { productName, price, firmId, image },
      });
    }

    const productQuery = `
      INSERT INTO products(productName, price, category, bestSeller, description, image, firm_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      productQuery,
      [productName, price, category, bestSeller, description, image, firmId],
      (err, results) => {
        if (err) {
          console.error("Database error:", err);
          return res
            .status(500)
            .json({ message: "DB insert error", error: err.message });
        }
        res.status(200).json({
          message: "Product added successfully",
          productId: results.insertId,
          data: results,
        });
      }
    );
  } catch (error) {
    console.error("Catch error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getProducts = async (req, res) => {
  const firmId = req.params.firmId;

  const firmQuery = `SELECT firmName FROM firms WHERE id = ?`;
  db.query(firmQuery, [firmId], (err, firmResult) => {
    if (err) {
      return res.status(500).json({ message: "DB fetch error", error: err });
    }

    if (firmResult.length === 0) {
      return res.status(404).json({ message: "Firm not found" });
    }

    const firmName = firmResult[0].firmName;

    const productsQuery = `SELECT * FROM products WHERE firm_id = ?`;
    db.query(productsQuery, [firmId], (err, productResults) => {
      if (err) {
        return res.status(500).json({ message: "DB fetch error", error: err });
      }

      if (productResults.length === 0) {
        return res.status(200).json({
          message: "No products available for this firm",
          firmName: firmName,
          products: [],
        });
      }

      res.status(200).json({
        message: "Products fetched successfully",
        firmName: firmName,
        products: productResults,
      });
    });
  });
};

const deleteProduct = async (req, res) => {
  const productId = req.params.productId;

  const deleteQuery = `DELETE FROM products WHERE id = ?`;

  db.query(deleteQuery, [productId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "DB delete error", error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  });
};

module.exports = { upload, addProduct, getProducts, deleteProduct };
