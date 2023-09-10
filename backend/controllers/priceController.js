const asyncHandler = require("express-async-handler");
const Sprice = require("../models/sellingPriceModel")

const createSprice = asyncHandler(async(req, res)=>{
    const {name, products} = req.body
    if(!name) {
        res.status(400)
        throw new Error("All fields are required")
    }

    const productEntries = products.map(product => ({
        product: product.product_id,
        sellingPrice: product.price
    }));
    const createPrice = await Sprice.create({
        name,
        products: productEntries
    })
    res.status(201).json(createPrice)
})

const getSprice = asyncHandler(async(req, res)=>{
    const sPrice = await Sprice.find()
    res.status(200).json(sPrice)
})

module.exports = {
    createSprice,
    getSprice
}