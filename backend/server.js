const dotenv = require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const userRoute = require("./routes/userRoute");
const productRoute = require("./routes/productRoute")
const errorHandler = require("./middleware/errorMiddleware");
const cookieParser = require('cookie-parser');
const categoryRoute = require('./routes/categoryRoute')
const storeListRoute = require('./routes/storelistRoute')
const invRoute = require("./routes/invRoute")
const priceRoute = require("./routes/priceRoute")
const serveRoute = require("./routes/serveListRoute")
const reportRoute = require("./routes/reportRoute");
const analyzeRoute = require("./routes/analyzeRoute")

const app = express();

// Middlewares

app.use(express.json());
app.use(cookieParser())
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors({
  origin: ["http://localhost:3000","http://192.168.50.167:8081" ,"https://inv-app-beyene"],
  credentials: true
}));

// Route Middleware

app.use("/api/users", userRoute);
app.use("/api/products", productRoute);
app.use("/api/category", categoryRoute)
app.use("/api/storelist", storeListRoute)
app.use("/api/inv", invRoute)
app.use("/api/price", priceRoute)
app.use("/api/serve", serveRoute)
app.use("/api/report", reportRoute)
app.use("/api/analyze", analyzeRoute)

// Routes
app.get("/", (req, res) => {
  res.send("Home Page");
});

// Error middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect to DB and start server

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server runnning on port ${PORT}`);
    });
  })
  .catch((err) => console.log(err));
