const mongoose = require("mongoose");
const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const Inventory = require("../models/inventoryModel");
const Store = require("../models/storeModel");

const purchase = asyncHandler(async (req, res) => {
  const { product, quatity, unit_price, tin,to_mainstore, date } = req.body;

  const type = "pp";
  const user = req.user.id;

  if (!type || !product || !quatity || !date || !user || !unit_price || !to_mainstore) {
    res.status(400);
    throw new Error("Some fields are mandatory!");
  }

  total_price = unit_price * quatity;

  const createPurchase = await Inventory.create({
    type,
    product,
    quatity,
    unit_price,
    total_price,
    tin,
    to_mainstore,
    date,
    user,
  });
  res.status(201).json(createPurchase);
});
// Get all purchase
const getAllPurchase = asyncHandler(async (req, res) => {
  const getPurchase = await Inventory.find({ type: "pp" })
    .populate("product", "name")
    .populate("to_mainstore", "name")
    .sort("-createdAt");
  res.send(getPurchase);
});

// Create Delivery

const delivery = asyncHandler(async (req, res) => {
  const deliveries = req.body; // An array of delivery objects

  const type = "pd";
  const user = req.user.id;

  const deliveryResults = [];

  for (const delivery of deliveries) {
    const { product, quatity, to_store, tin, date } = delivery;
    const date_now = new Date();
    if (!type || !product || !quatity || !date || !user || !to_store) {
      res.status(400);
      throw new Error("Some fields are mandatory");
    }

    const purchasedQuantity = [
      {
        $match: {
          type: "pp",
          product: new mongoose.Types.ObjectId(product),
        },
      },
      {
        $group: {
          _id: null,
          currentBalance: { $sum: "$quatity" },
        },
      },
    ];

    const deliveredQuantity = [
      {
        $match: {
          type: "pd",
          product: new mongoose.Types.ObjectId(product),
        },
      },
      {
        $group: {
          _id: null,
          deliverysum: { $sum: "$quatity" },
        },
      },
    ];

    // Checking if the product total purchse
    const totalPurchased = (await Inventory.aggregate(purchasedQuantity)) || 0;
    const totaldelivered = (await Inventory.aggregate(deliveredQuantity)) || 0;

    if (totalPurchased.length > 0) {
      if (totaldelivered[0] === undefined) {
        const delivered = 0;
        const purchased = totalPurchased[0].currentBalance;

        const availableQuantty = purchased - delivered;
        // Check if there is available balance
        if (availableQuantty >= quatity) {
          const deliver = await Inventory.create({
            type,
            product,
            quatity,
            date: date || date_now,
            to_store,
            tin,
            user,
          });
          const deliver_store = await Store.create({
            type,
            product,
            quatity,
            date: date || date_now,
            to_store,
            tin,
            user,
          });
          if (deliver && deliver_store) {
            deliveryResults.push({ deliver, deliver_store });
          }
        } else {
          res.status(400);
          throw new Error("Please check your balance");
        }
      } else {
        const delivered = totaldelivered[0].deliverysum;
        const purchased = totalPurchased[0].currentBalance;

        const availableQuantty = purchased - delivered;
        // Check if there is available balance
        if (availableQuantty >= quatity) {
          const deliver = await Inventory.create({
            type,
            product,
            quatity,
            date: date || date_now,
            to_store,
            tin,
            user,
          });
          const deliver_store = await Store.create({
            type,
            product,
            quatity,
            date: date || date_now,
            to_store,
            tin,
            user,
          });
          if (deliver && deliver_store) {
            deliveryResults.push({ deliver, deliver_store });
          }
        } else {
          res.status(400);
          throw new Error("Please check your balance");
        }
      }
   
    } else {
      res.status(404).json({ message: "This item is not purchased" });
    }
  }

  // Send back the results for all deliveries
  res.status(201).json(deliveryResults);
});

// Get all Delivery

const getAllDelivery = asyncHandler(async (req, res) => {
  const allDelivery = await Store.find({ type: "pd" })
    .populate("to_store", "name")
    .populate("product", "name");
  res.status(201).json(allDelivery);
});
// Get Delivery for Specific store
const getStoreDelivery = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const storeDelivery = await Store.find({
    to_store: new mongoose.Types.ObjectId(id),
  })
    .populate("to_store", "name")
    .populate("product", "name");
  res.status(201).json(storeDelivery);
});




module.exports = {
  purchase,
  delivery,  
  getAllPurchase,
  getAllDelivery,
  getStoreDelivery,
  };
