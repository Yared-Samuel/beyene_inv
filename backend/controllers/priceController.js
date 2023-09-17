const asyncHandler = require("express-async-handler");
const Sprice = require("../models/sellingPriceModel")

const createSprice = asyncHandler(async(req, res)=>{
    const {name, products} = req.body
    if(!name) {
        res.status(400)
        throw new Error("All fields are required")
    }

    const productEntries = products.map(product => ({
        product: product.product,
        sellingPrice: product.price
    }));
    const createPrice = await Sprice.create({
        name,
        products: productEntries
    })
    res.status(201).json(createPrice)
})

const getSprice = asyncHandler(async(req, res)=>{
    const sPrice = await Sprice.find().populate('products.product', "name")
    
    res.status(200).json(sPrice)
})

module.exports = {
    createSprice,
    getSprice
}

// {"name": "yared bar",
// 		"products": [
// 			{
// 				"product": "64fd5c416be8e667fc96637c",
// 				"price": 1500,
// 				"_id": "64ec94763308b63655e1957a"
// 			},
// 			{
// 				"product": "64fb35dae30da852f017822c",
// 				"price": 700,
// 				"_id": "64ec94763308b63655e1957a"
// 			}
// 		]}