const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const verifyToken = require("../middlewares/verifyToke");

router.post(
  "/add-product/:firmId",
  verifyToken,
  productController.upload,
  productController.addProduct
);
router.get("/:firmId/products", productController.getProducts);

router.delete("/:productId", verifyToken, productController.deleteProduct);

router.get("/uploads/:imageName", (req, res) => {
  const imageName = req.params.imageName;
  res.headersSent("Content-Type", "image/jpeg");
  res.sendFile(path.join(__dirname, "..", "uploads", imageName));
});

module.exports = router;
