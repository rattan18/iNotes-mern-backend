const mongoose = require('mongoose');


const connectToMongo = ()=>{
    mongoose.connect(process.env.MONGO_URI);
    
}

module.exports = connectToMongo;