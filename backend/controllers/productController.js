const asyncHandler = require("express-async-handler");
const Product = require("../models/productModel");

const createProduct = asyncHandler(async (req, res) => {
  const { code, name, category, measurment, min_stock, description,sub_measurment,sub_measurment_value } = req.body;
  const user = req.user.id; // because of protected route
  // validation
  if (!code || !name || !user || !category || !measurment) {
    res.status(400);
    throw new Error("Please fill product details correctly!");
  }
  const codeCheck = await Product.findOne({code})
  const nameCheck = await Product.findOne({name})
  
  if(codeCheck || nameCheck) {
    res.status(400)
    throw new Error("Product name or Code already exist!")
  }

  const product = await Product.create({
    code,
    name,
    category,
    measurment,
    sub_measurment,
    sub_measurment_value,
    min_stock,
    description,
    user,
  });
  res.status(201).json(product)
});

const getProducts =asyncHandler (async (req, res) => {
    const products = await Product.find().sort("-createdAt").populate('category', 'name');
    res.status(200).json(products)
})

const updateProduct =asyncHandler (async (req, res) => {
    const {  name, category, measurment, min_stock, description, sub_measurment } = req.body;
  const user = req.user.id; // because of protected route

  const product = await Product.findById(req.params.id)

  if(!product){
    res.status(404)
    throw new Error("Product not found");
  }
  
  // upadte product
  const updatedProduct = await Product.findByIdAndUpdate(
    {_id: req.params.id},
    {
    name,
    category,
    measurment,
    min_stock,
    description,
    sub_measurment
    },
    {
        new: true,
        runValidators: true
    }
  )
  res.status(201).json(updatedProduct)
})


module.exports = {
    createProduct,
    getProducts,
    updateProduct
};
