const express = require("express");
const router = express.Router();
const {createProduct, getProducts, updateProduct} = require("../controllers/productController")
const protect = require("../middleware/authMiddleware");

router.post("/", protect, createProduct)
router.get("/", protect, getProducts)
router.patch("/:id",protect, updateProduct)


module.exports = router