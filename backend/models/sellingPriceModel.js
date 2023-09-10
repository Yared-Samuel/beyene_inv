const mongoose = require("mongoose");
const Product = require("./productModel")


const sPrice = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Price name is required!"],
        unique: [true, "Price name must be unique!"]
    },
    
    products: [
        {
        product: { type: mongoose.Schema.Types.ObjectId, 
        required: [true,"Product is required"] ,
        ref: Product, 
                },
          sellingPrice: { type: Number, required: [true, "selling price is required"] },
        },
      ],
      

})

const Sprice = mongoose.model("Sprice", sPrice)
module.exports = Sprice;