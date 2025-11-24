const db = require("../models/database");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const vendorRegister = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const vendorEmailCheckingQuery = `SELECT * FROM vendors WHERE email = '${email}'`;
    db.query(vendorEmailCheckingQuery, (err, results) => {
      if (err) {
        console.log("Your Query is Wrong...!", err);
        res.status(500).json({ message: "Database Error", error: err });
        return;
      }
      if (results.length > 0) {
        return res.status(400).json({ message: "Email already taken" });
      }
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    const vendorQuery = `INSERT INTO vendors (username, email, password) VALUES ('${username}', '${email}', '${hashedPassword}');`;
    db.query(vendorQuery, (err, results) => {
      if (err) {
        console.log("Vendor Query is Wrong...!", err);
        res.status(500).json({ message: "Error inserting user", error: err });
        return;
      }
      console.log("User successfully added....!");
      res.status(201).json({ message: "User Added Successfully" });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "internal server error" });
  }
};

const vendorLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const getVendor = `SELECT * FROM vendors WHERE email = '${email}'`;
    db.query(getVendor, async (err, results) => {
      if (err) {
        console.log("Vendor Login Query is Wrong...!", err);
        return res
          .status(500)
          .json({ message: "Vendor Login Query is Wrong...!", error: err });
      }
      if (results.length === 0) {
        return res.status(400).json({ message: "Invalid Email" });
      }

      const vendor = results[0];
      const secretKey = process.env.WhatIsYourName;
      const vendorToken = jwt.sign(
        {
          vendorId: vendor.id,
        },
        secretKey,
        { expiresIn: "1h" }
      );

      const isMatch = await bcrypt.compare(password, vendor.password);

      if (!isMatch || vendor.email !== email) {
        return res.status(401).json({ error: "Invalid Password and Email" });
      }
      res.status(200).json({
        success: "Password and Email is Matched so Vendor is Login Successful",
        vendorToken,
      });
      // console.log(email);
      // console.log(vendorToken);
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login Route internal server error" });
  }
};

const getAllVendors = async (req, res) => {
  try {
    const getVendorsQuery = `
      SELECT v.id, v.username, v.email, v.password, 
      f.firmName, f.area, f.category, f.region, f.offer, f.image, f.vendor_id
      FROM vendors v
      LEFT JOIN firms f ON f.vendor_id = v.id;
    `;
    db.query(getVendorsQuery, (err, results) => {
      if (err) {
        console.log("get Vendors Query is Wrong...!", err);
        res.status(404).json({ message: "Error get vendors", error: err });
        return;
      }
      res
        .status(200)
        .json({ message: "get vendors data Successfully", data: results });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "internal server error" });
  }
};

const getVendorById = async (req, res) => {
  const vendorId = req.params.id;

  try {
    const getVendorQuery = `SELECT * FROM vendors v JOIN firms f ON f.vendor_id = v.id WHERE v.id = ${vendorId};`;
    db.query(getVendorQuery, (err, results) => {
      if (err) {
        console.log("get Vendor Query is Wrong...!", err);
        res.status(404).json({ message: "vendor not found", error: err });
        return;
      }
      res
        .status(200)
        .json({ message: "get vendor data Successfully", data: results });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "internal server error" });
  }
};

module.exports = { vendorRegister, vendorLogin, getAllVendors, getVendorById };
