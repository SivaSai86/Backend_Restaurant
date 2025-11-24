const vendorController = require("../controllers/VendorController");
const express = require("express");

const router = express.Router();

// Vendor Register
router.post("/register", vendorController.vendorRegister);

// Vendor Login
router.post("/login", vendorController.vendorLogin);

// Get all vendors
router.get("/all-vendors", vendorController.getAllVendors);

// Get single vendor by ID
router.get("/single-vendor/:id", vendorController.getVendorById);

module.exports = router;
