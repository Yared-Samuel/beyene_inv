const express = require("express");
const protect = require("../middleware/authMiddleware");
const { dailyPurchases, finishedDailySales, serviceSales, dailySaleForStore,  getStoreProductBalance, getMainStoreBalance } = require("../controllers/reportsController");
const { cashBalnces } = require("../controllers/analyzeController");
const router = express.Router();


router.get("/purchase-daily",  dailyPurchases)
router.get("/sale-daily",  finishedDailySales)
router.get("/serve-daily",  serviceSales)
router.get("/store-sale-daily",  dailySaleForStore)
router.get("/probalance",  getStoreProductBalance)
router.get("/mainStoreBalance",  getMainStoreBalance)
router.get("/cashBalance",  cashBalnces)


module.exports = router
