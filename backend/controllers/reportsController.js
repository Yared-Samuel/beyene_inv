const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");
const Store = require("../models/storeModel");
const Inventory = require("../models/inventoryModel");


const dailyPurchases = asyncHandler(async(req, res) => {
    const purchaseDailys = await Inventory.aggregate([
        {
          $match: {
            type: 'pp', // Filter by type "pp"
          },
        },
        {
          $group: {
            _id: '$date', // Group by date
            totalPurchase: { $sum: '$total_price' }, // Sum the total_price for each group
          },
        },
        {
          $project: {
            date: '$_id', // Rename _id to date
            totalPurchase: 1, // Include totalPurchase field
            _id: 0, // Exclude _id field
          },
        },
      ]).sort("-date")

      res.send(purchaseDailys)
})

const finishedDailySales = asyncHandler(async(req, res) => {
    const finishedSaleDailys = await Store.aggregate([
      {
        $match: {
          $or: [
            { type: 'ps' },
            { type: 'pps' }
          ]
        }
      },
      {
        $group: {
          _id: '$date', // Group by date
          totalSales: { $sum: '$total_price' }, // Sum the total_price for each group
        }
      },
      {
        $project: {
          date: '$_id', // Rename _id to date
          totalSales: 1, // Include totalSales field
          _id: 0, // Exclude _id field
        }
      }
      ]).sort("-date")

      res.send(finishedSaleDailys
        // .sort((a, b) => b.date - a.date)
        )
})

const dailySaleForStore = asyncHandler(async(req, res)=>{
  const dailySaleStore = await Store.find({
    $or: [
      { 'type': "ps" },
    ]
   }).populate("to_store", "name")
   .sort("-date");

   const remainingQuantities = {};
    
   dailySaleStore.forEach((transaction)=>{
    const storeName = transaction.to_store.name;
    const quantity = transaction.total_price;
    const date = transaction.date;

    if(!(date in remainingQuantities)){
      remainingQuantities[date] = {};
      
    }
    if(!(storeName in remainingQuantities[date])) {
      remainingQuantities[date][storeName] = 0
    }
    
      remainingQuantities[date][storeName] += quantity;
    
   })

   const resultArray = []
   for (const date in remainingQuantities){

    // const storeData = null
      
    for (const storeName in remainingQuantities[date]){
      const quantity = remainingQuantities[date][storeName];
      // storeData.push({
      //   storeName: storeName,
      //   quantity: quantity,
      //   date: date
      // })

    var  storeData=  ({
        storeName: storeName,
        quantity: quantity,
        date: date}
      )
      
     }
     resultArray.push(storeData)
    
   }
   



   res.status(201).json(resultArray.sort((a, b) => b.date - a.date));

 })

// service sale daily
const serviceSales = asyncHandler(async(req, res) => {
    const serivceSaleDailys = await Store.aggregate([
        {
          $match: {
            type: 'pps', // Filter by type "pp"
          },
        },
        {
          $group: {
            _id: '$date', // Group by date
            totalServe: { $sum: '$total_price' }, // Sum the total_price for each group
          },
        },
        {
          $project: {
            date: '$_id', // Rename _id to date
            totalServe: 1, // Include totalServe field
            _id: 0, // Exclude _id field
          },
        },
      ])

      res.send(serivceSaleDailys)
})




 const dailyServeForStore = asyncHandler(async(req, res)=>{
  const dailyServeStore = await Store.find({
    $or: [
      // { 'type': "ps" },
      { 'type': "pps" },
    ]
   }).populate("to_store", "name")
   .populate("serve", 'serveName')
   .sort("-createdAt");

   res.status(200).json(dailyServeStore)
 })


 // product balance
const getStoreProductBalance = asyncHandler(async (req, res) => {
  
  const stores = await Store.find({
    $or: [
      { type: "pd" },
      { type: "ps" },
      { type: "pu" },
    ]
  }).populate("product", "name")
    .populate("to_store", "name");
const remainingQuantities = {};

// Process transactions to calculate remaining quantities
stores.forEach((transaction) => {
  const productName = transaction.product.name;
  const storeName = transaction.to_store.name;
  const type = transaction.type;
  const quantity = transaction.quatity;

  if (!(storeName in remainingQuantities)) {
    remainingQuantities[storeName] = {};
  }

  if (!(productName in remainingQuantities[storeName])) {
    remainingQuantities[storeName][productName] = 0;
  }

  // Adjust remaining quantity based on transaction type
  if (type === 'pd') {
    remainingQuantities[storeName][productName] += quantity;
  } else if (type === 'ps') {
    remainingQuantities[storeName][productName] -= quantity;
  }
   else if (type === 'pu') {
    remainingQuantities[storeName][productName] -= quantity;
  }
});

const resultArray = [];

// Create an array with store names and their product quantities
for (const storeName in remainingQuantities) {
  const storeData = {
    storeName: storeName,
    data: [],
  };

  for (const productName in remainingQuantities[storeName]) {
    const quantity = remainingQuantities[storeName][productName];
    storeData.data.push({
      productName: productName,
      quantity: quantity,
    });
  }

  resultArray.push(storeData);
}

res.status(201).json(resultArray);


});

 // product balance
 const getMainStoreBalance = asyncHandler(async (req, res) => {
  const inv = await Inventory.find({
    $or: [
      { type: "pp" },
      { type: "pd" },
      { type: "fpu" },
    ]
  }).populate("product", "name");

  const remainingQuantities = {};

  // Process transactions to calculate remaining quantities
  inv.forEach((transaction) => {
    const productName = transaction.product.name;
    const type = transaction.type;
    const quantity = transaction.quatity;

    if (!(productName in remainingQuantities)) {
      remainingQuantities[productName] = 0;
    }

    // Adjust remaining quantity based on transaction type
    if (type === 'pp') {
      remainingQuantities[productName] += quantity;
    } else if (type === 'pd' || type === 'fpu') {
      remainingQuantities[productName] -= quantity;
    }
  });

  const resultArray = [];

  // Create an array with store names and their product quantities
  for (const productName in remainingQuantities) {
    const invData = {
      productName: productName,
      quantity: remainingQuantities[productName],
    };

    resultArray.push(invData);
  }

  res.status(201).json(resultArray);
});


// Daily sale per store









module.exports = {
    dailyPurchases,
    finishedDailySales,
    serviceSales,
    dailySaleForStore,
    dailyServeForStore,
    getStoreProductBalance,
    getMainStoreBalance
}