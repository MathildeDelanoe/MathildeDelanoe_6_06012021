// Importation des dépendances
const mongoose = require('mongoose');
const uniqueValidator = require ('mongoose-unique-validator'); // package de pré-validation des informations

// Création du schéma mongoose
const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique : true}, // l'email doit être unique dans la BDD
    password: { type: String, required: true}
});

/* Le validateur est appliqué au schéma
   Ce validateur va lever une erreur de validation Mongoose si cette règle d'unicité est enfreinte.
   S'il n'est pas utilisé, MongoDB va lever une erreur E11000 qui est plus difficile à interpréter.
*/
userSchema.plugin(uniqueValidator);

// Exportation du schéma sous forme de modèle
module.exports = mongoose.model('user', userSchema);