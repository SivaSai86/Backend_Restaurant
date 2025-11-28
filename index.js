const db = require("./models/database");
const vendorRoutes = require("./routes/vendorRoutes");
const firmsRoutes = require("./routes/firmRoutes");
const productRoutes = require("./routes/productRoutes");
const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");

dotenv.config();
const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());

// DB Connection
db.connect((err) => {
  if (err) {
    console.log("Your Database Not Connected Please Check It.....!");
    return;
  }
  console.log("Your Database Successfully Connected....!");
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/vendor", vendorRoutes);
app.use("/firm", firmsRoutes);
app.use("/product", productRoutes);
app.use("/uploads", express.static("uploads"));

// 👇 DEFAULT ROUTE LAST LO Veyali
app.get("/", (req, res) => {
  res.send("<h1> My First Project....!</h1>");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    message: "Internal Server Error",
    error: err.message,
  });
});

app.listen(PORT, () => {
  console.log(`Your Server is Running on PORT ${PORT}....!`);
});
