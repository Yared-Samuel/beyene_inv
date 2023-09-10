const asyncHandler = require('express-async-handler')
const StoreCat = require('../models/storeListCatModel');
const StoreList = require('../models/storeList');

const createStoreCategory = asyncHandler(async(req, res)=>{
    const {name , description} = req.body;
    const user_creater = req.user.id;
    if(!name) {
        res.status(400)
        throw new Error("Category name is required!")
    }
    const nameCheck = await StoreCat.findOne({name})
    if(nameCheck) {
        res.status(400)
        throw new Error("Product name already exist!")
    }

    const category = await StoreCat.create({
        name,
        description,
        user : user_creater
    });
    res.status(201).json(category)

})

const getStoreCategory = asyncHandler(async(req, res) =>{
    const categoies = await StoreCat.find().sort("-createdAt");
    res.status(200).json(categoies)
})


////////  Store List   /////////


const createStore = asyncHandler(async(req, res)=>{
    const {name, operator, description, category, sPrice } = req.body;
    const user_creater = req.user.id;
    if(!name || !category || !sPrice) {
        res.status(400)
        throw new Error("Category name and Category is required!")
    }
    const nameCheck = await StoreCat.findOne({name})
    if(nameCheck) {
        res.status(400)
        throw new Error("Product name already exist!")
    }

    const categories = await StoreList.create({
        name,
        description,
        operator,
        category,
        sPrice,
        user : user_creater
    });
    res.status(201).json(categories)

})

const getStores = asyncHandler(async(req, res) =>{
    const storeLists = await StoreList.find({})
                            .populate('category', 'name')
                            .populate('sPrice', 'name',)
                            
    res.status(200).json(storeLists)
})


module.exports ={
     createStoreCategory,
     getStoreCategory,
     createStore,
     getStores
    }