const mongoose = require("mongoose");
const User = require("./userModel");
const Product = require("./productModel");
const StoreList = require("./storeList");
const MainStore = require("./mainStore")


const tinValidator = {
    validator: function(value) {
      // Check if the TIN is a string with exactly 10 digits
      return /^[0-9]{10}$/.test(value);
    },
    message: 'Invalid TIN format. TIN must be a 10-digit number.',
  };


const inventorySchema = mongoose.Schema({
    type: {
        type: String,
        enum: ['pp', 'pd', 'fpu'],
        // pp-product purchase 
        //pd-product distribute/ delivery 
        //ps-product sale
        //fpu - fixed products utilized
        required: [true, "Trasnaction type is required"],        
    },
    
    product: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "Product is required"],
        ref: Product
    },
    to_mainstore: {  // For purchase and delivery
        type: mongoose.Schema.Types.ObjectId,
        ref: MainStore,
        default: null
    },
    quatity: {
        type: Number,
        required: [true, "Quantity is required"],
        trim: true
    },
    unit_price: { // for purchase only
        type: Number,
        // required: [true, "Unit price is required!"]
    },
    total_price: { // for purchase only
        type: Number,
        // required: [true, "Total price is required!"],
        trim: true
    },
    to_store: { // for delivery only
        type: mongoose.Schema.Types.ObjectId,
        ref: StoreList,
        default: null

        
    },
    tin: { // for delivery only
        type: String,
        // validate: tinValidator,
        default: null
    },
    
    date: {
        type: Date,
        required: [true, "Date is required"]
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: User
    },
},{
    timestamps: true
})



const Inventory = mongoose.model("Inventory", inventorySchema)
module.exports = Inventory

