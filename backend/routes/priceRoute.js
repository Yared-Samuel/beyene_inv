const express = require("express")
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { createSprice, getSprice } = require("../controllers/priceController");

router.post("/", protect, createSprice)
router.get("/", protect, getSprice)

module.exports = router;