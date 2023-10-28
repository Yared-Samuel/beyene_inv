const Inventory = require("../models/inventoryModel");
const Product = require("../models/productModel");
const Serve = require("../models/serveListModel");
const StoreList = require("../models/storeList");
const Store = require("../models/storeModel");
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");


const sale = asyncHandler(async (req, res) => {
    const { quantity, date } = req.body;
    const type = "ps";
    const user = req.user.id;
    const currentDate = new Date();
    const product_id = req.product_id;
    const product_price = req.product_selling_price;
    const to_store = req.to_store;
    const value = req.value
    const measurment_unit = req.measured_by
    
    if (!type || !product_price || !to_store) {
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
  
    const totalDelivered = (await Store.aggregate(deliveredQuantity)) || 0;
    const totalsoled = (await Store.aggregate(soledQuantity)) || 0;
  
        console.log({totalDelivered, totalsoled})
  
    if (totalDelivered.length > 0) {
      if (totalsoled.length > 0) {
        var balance_in_store =
          totalDelivered[0].currentBalance - totalsoled[0].currentBalance;
      } else if (totalsoled.length <= 0) {
        var balance_in_store = totalDelivered[0].currentBalance - 0;
      }
  
      if (balance_in_store < quantity / value) {
        res.status(400);
        throw new Error("Please check your balance");
      }  

      // const sub_quantity = quantity / value
      // const unit_p = product_price / value
      const total_sell_price = ((quantity / value) * product_price) / value;
      
      
      const createSalesStore = await Store.create({
        type,
        product: product_id,
        quatity: quantity / value,
        unit_price: product_price / value,
        total_price: total_sell_price,
        to_store,
        date: date || currentDate,
        measured_by: measurment_unit,
        user,
      });
      if (createSalesStore) {
        res.status(201).json({createSalesStore });
      }
    } else {
      res.status(400);
      throw new Error("Product not available in this store!");
    }
  });
  
  const getAllSales = asyncHandler(async (req, res) => {
    const allSales = await Store.find({
      $or: [
        { 'type': "ps" },
        // { 'type': "pps" },
      ]
     }).populate("to_store", "name")
      .populate("product", "name")
      .populate("serve", 'serveName')
      .sort("-createdAt");
    res.status(200).json(allSales);
  });


  const serviceSale = asyncHandler(async(req, res)=>{
    const {serve_id, serve_to_store, serve_quantity, serve_date} = req.body
    const type = "pps";
    const user = req.user.id;
    const currentDate = new Date()

    const serveList = await Serve.findById(serve_id)
    if(!serveList){
      res.status(400)
      throw new Error("Service not found!")
    }
    const servePrice = serveList.servePrice
    const serveMeasure = serveList.serveMeasure
    const unit_price = servePrice
    const total_price = servePrice * serve_quantity

    if(!serve_id || !serve_to_store || !serve_quantity) {
      res.status(400)
      throw new Error("Fields are required!")
    }

    // Store list check

    const storeType = await StoreList.findById(serve_to_store)
     storeRaw = storeType.processing.toString()
    const raw = "raw"
    
    

    console.log({raw, storeRaw})
    if(storeRaw !== raw ){
      res.status(400)
      throw new Error("Store type not match product!")
    }

    

    const createServeSale = await Store.create({
      type,
      serve: serve_id,
      quatity: serve_quantity,
      unit_price,
      total_price,
      to_store: serve_to_store,
      measured_by: serveMeasure,
      date: serve_date || currentDate,
      user

    })
    if(createServeSale){
      res.status(201).json({createServeSale})
    }
  })
  
  const getServiceSale = asyncHandler(async(req, res)=>{
    const getServiceSales = await Store.find({type: "pps"})
                                        .populate("to_store", "name")
                                        .populate("serve", "serveName")
                                        .sort("-createdAt");

        res.status(201).json(getServiceSales)
  })


  const useProducts = asyncHandler(async (req, res) => {
    const dataArray = req.body
    console.log(dataArray)
    const results = [];
    
    for (const item of dataArray) {
      const { quantity, date, product, to_store } = item;
      const type = "pu";
      const user = req.user.id;
      const currentDate = new Date();

    if (!type || !quantity || !to_store || !product) {
      res.status(400);
      throw new Error("Some fields are mandatory");
    }

    const deliveredQuantity = [
      {
        $match: {
          type: "pd",
          to_store: new mongoose.Types.ObjectId(to_store),
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

    if (!deliveredQuantity) {
      res.status(400);
      throw new Error("Product not exist in this store!");
    }

    const soledQuantity = [
      {
        $match: {
          type: "pu",
          to_store: new mongoose.Types.ObjectId(to_store),
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
    
  
    const totalDelivered = (await Store.aggregate(deliveredQuantity)) || 0;
    const totalsoled = (await Store.aggregate(soledQuantity)) || 0;
  
    if (totalDelivered[0].currentBalance >= 0) {
      if (totalsoled[0].currentBalance > 0) {
        var balance_in_store =totalDelivered[0].currentBalance - totalsoled[0].currentBalance;
      } else if (totalsoled.length <= 0) {
        var balance_in_store = totalDelivered[0].currentBalance - 0;
      }
  
      if (balance_in_store <= quantity) {
        res.status(400);
        throw new Error("Please check your balance");
      }  


    const product_detail = await Product.findById(product)

    if(!product_detail) {
      res.status(400);
      throw new Error("No such product is found.");
    }
      const measured_by = product_detail.measurment
      const productId =new mongoose.Types.ObjectId(product);
      const getPurchasePrice = await Inventory.find({
        $and: [
          { type: "pp" },
          { product: productId }
        ]
      })
      .sort({ date: -1 })
      .limit(1)
      
      if(!getPurchasePrice) {
        res.status(400);
        throw new Error("Products purchase price is not found!");
      }
      const total_price = getPurchasePrice[0].unit_price * quantity

      if(!measured_by){
        res.status(400);
        throw new Error("Product does not have measurment.");
      }

      
      const createSalesStore = await Store.create({
        type,
        product,
        quatity: quantity,
        to_store,
        total_price,
        date: date || currentDate,
        measured_by,
        user,
      });
      if (createSalesStore) {
        results.push(createSalesStore);
      }
    } else {
      res.status(400);
      throw new Error("Product not available in this store!");
    }
  }
  res.status(201).json({ results });
  });

  const getUseProducts = asyncHandler(async (req, res) => {
    const getUsedProducts = await Store.find({type: "pu"})
                                        .populate("to_store", "name")
                                        .populate("product", "name")
                                        .sort("-createdAt");

        res.status(201).json(getUsedProducts)
  })

  module.exports = {
    sale,
    getAllSales,
    serviceSale,
    getServiceSale,
    useProducts,
    getUseProducts
  }