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

const addProduct = async (req, res) => {
  const { productName, price, category, bestSeller, description } = req.body; // <-- destination remove, description add
  const image = req.file ? req.file.filename : null;
  const firmId = req.params.firmId;

  const productQuery = `
    INSERT INTO products(productName, price, category, bestSeller, description, image, firm_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(productQuery, [productName, price, category, bestSeller, description, image, firmId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "DB insert error", error: err });
    }
    res.status(200).json({
      message: "Product added successfully",
      data: results,
    });
  });
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
