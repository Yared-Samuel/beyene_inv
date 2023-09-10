const express = require("express");
const {createStoreCategory , getStoreCategory, createStore, getStores} = require("../controllers/storeListCatController");
const protect = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/", protect, createStoreCategory)
router.get("/", protect, getStoreCategory)
router.post("/store", protect, createStore)
router.get("/get", protect, getStores)

module.exports = router