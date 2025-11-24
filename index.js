const db = require("./models/database");
const vendorRoutes = require("./routes/vendorRoutes");
const firmsRoutes = require("./routes/firmRoutes");
const productRoutes = require("./routes/productRoutes");
const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const path = require("path");

dotenv.config();
const PORT = process.env.PORT || 5000;

const app = express();

// DB Connection
db.connect((err) => {
  if (err) {
    console.log("Your Database Not Connected Please Check It.....!");
    return;
  }
  console.log("Your Database Successfully Connected....!");
});

app.use(bodyParser.json());

// Routes
app.use("/", (req, res) => {
  res.send("<h1> My First Project....!</h1>");
});
app.use("/vendor", vendorRoutes);
app.use("/firm", firmsRoutes);
app.use("/product", productRoutes);
app.use("/uploads", express.static("uploads"));

app.listen(PORT, () => {
  console.log(`Your Server is Running on PORT ${PORT}....!`);
});
