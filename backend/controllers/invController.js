const mongoose = require("mongoose");
const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const Inventory = require("../models/inventoryModel");
const Store = require("../models/storeModel");

const purchase = asyncHandler(async (req, res) => {
  const { product, quatity, unit_price, tin } = req.body;

  const type = "pp";
  const user = req.user.id;
  const currentDate = new Date();
  const date = currentDate;

  if (!type || !product || !quatity || !date || !user || !unit_price) {
    res.status(400);
    throw new Error("Some fields are mandatory");
  }

  total_price = unit_price * quatity;

  const createPurchase = await Inventory.create({
    type,
    product,
    quatity,
    unit_price,
    total_price,
    tin,
    date,
    user,
  });
  res.status(201).json(createPurchase);
});
// Get all purchase
const getAllPurchase = asyncHandler(async (req, res) => {
  const getPurchase = await Inventory.find({ type: "pp" }).sort("-createdAt");
  res.send(getPurchase);
});
// Get purchase with TIN
const getTinPurchase = asyncHandler(async (req, res) => {
  const tinPurchase = await Inventory.find({ type: "pp", tin: { $ne: null } });
  res.status(200).json(tinPurchase);
});
// Create Delivery
const delivery = asyncHandler(async (req, res) => {
  const { product, quatity, to_store, tin } = req.body;

  const type = "pd";
  const user = req.user.id;
  const date = new Date();

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
      // Check if tere is available balance
      if (availableQuantty > quatity) {
        const deliver = await Inventory.create({
          type,
          product,
          quatity,
          date,
          to_store,
          tin,
          user,
        });
        const deliver_store = await Store.create({
          type,
          product,
          quatity,
          date,
          to_store,
          tin,
          user,
        });
        if (deliver && deliver_store) {
          res.status(201).json({deliver, deliver_store});
        }
      } else {
        res.status(400);
        throw new Error("Please check your balance");
      }
    } else {
      
      const delivered = totaldelivered[0].deliverysum;
      const purchased = totalPurchased[0].currentBalance;

      const availableQuantty = purchased - delivered;
      // Check if tere is available balance
      if (availableQuantty > quatity) {
        const deliver = await Inventory.create({
          type,
          product,
          quatity,
          date,
          to_store,
          tin,
          user,
        });
        const deliver_store = await Store.create({
          type,
          product,
          quatity,
          date,
          to_store,
          tin,
          user,
        });
        if (deliver && deliver_store) {
          res.status(201).json({deliver, deliver_store});
        }
      } else {
        res.status(400);
        throw new Error("Please check your balance");
      }
    }
  } else {
    res.status(404).json({ message: "This item is not purchased" });
  }
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


const sale = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const type = "ps";
  const user = req.user.id;
  const currentDate = new Date();
  const date = currentDate;
  const product_id = req.product_id;
  const product_price = req.product_selling_price;
  const to_store = req.to_store;

  // validation
  if (!type || !date || !product_id || !product_price || !to_store) {
    res.status(400);
    throw new Error("Some fields are mandatory");
  }

  const deliveredQuantity = [
    {
      $match: {
        type: "pd",
        to_store: new mongoose.Types.ObjectId(to_store),
        product: new mongoose.Types.ObjectId(product_id),
      },
    },
    {
      $group: {
        _id: null,
        currentBalance: { $sum: "$quatity" },
      },
    },
  ];
  const soledQuantity = [
    {
      $match: {
        type: "ps",
        to_store: new mongoose.Types.ObjectId(to_store),
        product: new mongoose.Types.ObjectId(product_id),
      },
    },
    {
      $group: {
        _id: null,
        currentBalance: { $sum: "$quatity" },
      },
    },
  ];

  const totalDelivered = (await Inventory.aggregate(deliveredQuantity)) || 0;
  const totalsoled = (await Inventory.aggregate(soledQuantity)) || 0;

  if (totalDelivered.length > 0) {
    if (totalsoled.length > 0) {
      var balance_in_store =
        totalDelivered[0].currentBalance - totalsoled[0].currentBalance;
    } else if (totalsoled.length <= 0) {
      var balance_in_store = totalDelivered[0].currentBalance - 0;
    }

    if (balance_in_store <= quantity) {
      res.status(400);
      throw new Error("Please check your balance");
    }
    const toatal_sell_price = quantity * product_price;

    const createSalesInv = await Inventory.create({
      type,
      product: product_id,
      quatity: quantity,
      unit_price: product_price,
      total_price: toatal_sell_price,
      to_store,
      date,
      user,
    });
    const createSalesStore = await Store.create({
      type,
      product: product_id,
      quatity: quantity,
      unit_price: product_price,
      total_price: toatal_sell_price,
      to_store,
      date,
      user,
    });
    if (createSalesInv && createSalesStore) {
      res.status(201).json({ createSalesInv, createSalesStore });
    }
  } else {
    res.status(400);
    throw new Error("Product not purchased yet");
  }
});

const getAllSales = asyncHandler(async (req, res) => {
  const allSales = await Store.find({ type: "ps" })
    .populate("to_store", "name")
    .populate("product", "name")
    .sort("-createdAt");
  res.status(201).json(allSales);
});

// product balance
const getProductBalance = asyncHandler(async (req, res) => {
  const stores = await Store.find()
    .populate("product", "name")
    .populate("to_store", "name");

  // Initialize a dictionary to store remaining quantities
  const remainingQuantities = {};

  // Process transactions to calculate remaining quantities
  stores.forEach((store) => {
    const productId = store.product._id.toString();
    const productName = store.product.name;
    const storeId = store.to_store._id.toString();
    const storeName = store.to_store.name;
    const type = store.type;
    const quantity = store.quatity;
    if (!(productName in remainingQuantities)) {
      remainingQuantities[productName] = productName;
      remainingQuantities[productName] = {};
      
    }
    if (!(storeName in remainingQuantities[productName])) {
      remainingQuantities[productName]["store_id"]= storeId
      remainingQuantities[productName]["storeName"]= storeName
      remainingQuantities[productName][storeName] = 0;
    }

    // Adjust remaining quantity based on transaction type
    if (type === "pd") {
      remainingQuantities[productName][storeName] += quantity;
      
    } else if (type === "ps") {
      
      remainingQuantities["product_id"] = productId

    }


  });

  res.status(201).json(remainingQuantities);
});

module.exports = {
  purchase,
  delivery,
  sale,
  getAllPurchase,
  getTinPurchase,
  getAllDelivery,
  getStoreDelivery,
  getAllSales,
  getProductBalance,
};
