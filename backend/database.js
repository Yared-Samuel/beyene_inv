const mongoose = require('mongoose');

const connectDatabase = () =>{
    mongoose.connect(process.env.DB)
}