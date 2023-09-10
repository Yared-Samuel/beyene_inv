const express = require("express");
const protect = require("../middleware/authMiddleware");
const { purchase, delivery, sale, getAllPurchase, getTinPurchase, getAllDelivery, getStoreDelivery, getAllSales, getProductBalance } = require("../controllers/invController");
const find_price = require("../middleware/priceMiddleware");
const router = express.Router();

router.post("/purchase", protect, purchase)
router.get("/purchase", protect, getAllPurchase)
router.get("/purchase_tin", protect, getTinPurchase)
router.post("/delivery", protect, delivery)
router.get("/delivery", protect, getAllDelivery)
router.get("/delivery/:id", protect, getStoreDelivery)
router.post("/sale", protect,find_price, sale)
router.get("/sale", protect, getAllSales)
router.get("/sale/balance", protect, getProductBalance)

module.exports = router