const mongoose = require ('mongoose');

const sauceSchema = mongoose.Schema({
    name: { type:String},
    manufacturer: { type:String},
    description: { type:String},
    mainPepper: { type:String},
    imageUrl: { type:String},
    heat: { type:Number}
});

module.exports = mongoose.model('sauce', sauceSchema);
