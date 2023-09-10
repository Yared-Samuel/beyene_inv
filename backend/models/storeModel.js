const mongoose = require("mongoose");
const StoreList = require("./storeList");
const Product = require("./productModel");
const User = require("./userModel");


const storeSchema = mongoose.Schema({
    type: {
        type: String,
        enum: ['pd', 'ps'],
        // pd-product distribute ps-product sale
        required: [true, "Trasnaction type is required"],
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "Product is required"],
        ref: Product
    },
    
    quatity: {
        type: Number,
        required: [true, "Quantity is required"],
        trim: true
    },
    unit_price: {
        type: Number,
        default: 0,
        required: [true, "Unit price is required!"]
    },
    total_price: {
        type: Number,
        default: 0,
        required: [true, "Total price is required!"],
        trim: true
    },
    to_store: { // for delivery only
        type: mongoose.Schema.Types.ObjectId,
        ref: StoreList,
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


const Store = mongoose.model("Store", storeSchema)
module.exports = Store