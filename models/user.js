// Import de mongoose
const mongoose = require('mongoose');

// Import du package de validation pour pré-valider les informations
const uniqueValidator = require ('mongoose-unique-validator');

// Creation du schema
const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique : true},
    password: { type: String, required: true}
});

// Le validateur est applique au schema
userSchema.plugin(uniqueValidator);

// Export du schema sous forme de modele
module.exports = mongoose.model('user', userSchema);