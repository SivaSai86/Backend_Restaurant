const db = require("../models/database");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// ---------------- REGISTER ------------------
const vendorRegister = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const vendorEmailCheckingQuery = `SELECT * FROM vendors WHERE email = '${email}'`;
    db.query(vendorEmailCheckingQuery, async (err, results) => {
      if (err)
        return res.status(500).json({ message: "Database Error", error: err });
      if (results.length > 0)
        return res.status(400).json({ message: "Email already taken" });

      const hashedPassword = await bcrypt.hash(password, 10);

      const vendorQuery = `INSERT INTO vendors (username, email, password)
        VALUES ('${username}', '${email}', '${hashedPassword}')`;

      db.query(vendorQuery, (err) => {
        if (err)
          return res
            .status(500)
            .json({ message: "Error inserting user", error: err });
        res.status(201).json({ message: "User Added Successfully" });
      });
    });
  } catch (error) {
    res.status(500).json({ message: "internal server error" });
  }
};

// ---------------- LOGIN ------------------
const vendorLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const vendorLoginQuery = `SELECT * FROM vendors WHERE email = '${email}'`;
    db.query(vendorLoginQuery, async (err, results) => {
      if (err)
        return res.status(500).json({ message: "Database Error", error: err });
      if (results.length === 0)
        return res.status(400).json({ message: "User not found" });

      const user = results[0];
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (!isPasswordMatch)
        return res.status(401).json({ message: "Password Incorrect" });

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      res.status(200).json({ message: "Login Success", token });
    });
  } catch (error) {
    res.status(500).json({ message: "internal server error" });
  }
};

// ---------------- GET ALL VENDORS ------------------
const getAllVendors = async (req, res) => {
  try {
    const getVendorsQuery = `
      SELECT v.id, v.username, v.email,
      f.firmName, f.area, f.category, f.region, f.offer, f.image, f.vendor_id
      FROM vendors v
      LEFT JOIN firms f ON f.vendor_id = v.id;
    `;

    db.query(getVendorsQuery, (err, results) => {
      if (err)
        return res
          .status(404)
          .json({ message: "Error get vendors", error: err });
      res
        .status(200)
        .json({ message: "get vendors data Successfully", data: results });
    });
  } catch (error) {
    res.status(500).json({ message: "internal server error" });
  }
};

// ---------------- GET SINGLE VENDOR BY ID ------------------
const getVendorById = async (req, res) => {
  const vendorId = req.params.id;

  try {
    const getVendorQuery = `
      SELECT v.id, v.username, v.email,
      f.firmName, f.area, f.category, f.region, f.offer, f.image, f.vendor_id
      FROM vendors v
      LEFT JOIN firms f ON f.vendor_id = v.id
      WHERE v.id = ${vendorId};
    `;

    db.query(getVendorQuery, (err, results) => {
      if (err)
        return res
          .status(404)
          .json({ message: "vendor not found", error: err });
      res
        .status(200)
        .json({ message: "get vendor data Successfully", data: results });
    });
  } catch (error) {
    res.status(500).json({ message: "internal server error" });
  }
};

module.exports = {
  vendorRegister,
  vendorLogin,
  getAllVendors,
  getVendorById,
};
