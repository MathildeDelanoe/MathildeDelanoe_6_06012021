// Importation des dépendances
const mongoose = require ('mongoose');

// Création du schéma mongoose
const sauceSchema = mongoose.Schema({
    userId: { type:String},
    name: { type:String, required:true},
    manufacturer: { type:String, required:true},
    description: { type:String, required:true},
    mainPepper: { type:String, required:true},
    imageUrl: { type:String, required:true},
    heat: { type:Number, required:true},
    likes: { type:Number, default: 0}, //default permet d'initialiser la valeur (nécessaire pour l'incrémentation)
    dislikes: { type:Number, default: 0},
    usersLiked: [{ type:String}], // Définition d'un tableau de strings
    usersDisliked: [{ type:String}]
});

// Exportation du schéma sous forme de modèle
module.exports = mongoose.model('sauce', sauceSchema);
