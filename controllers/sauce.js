// Import du modèle
const sauce = require('../models/sauce');

// Gestion de l'ajout d'une sauce grâce à "ajouter une sauce"
exports.createSauce = (req, res, next) => {
    // Récupération de la partie "sauce" du corps de la requête
    const currentSauceObject = JSON.parse(req.body.sauce);
    delete currentSauceObject._id;
    // Création d'un nouvel objet sauce
    const addedSauce = new sauce({
      ...currentSauceObject,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    // Sauvegarde de la nouvelle sauce dans la base de données
    addedSauce.save()
      .then(() => res.status(201).json({ message: 'Sauce enregistrée !'}))
      .catch(error => res.status(400).json({ error }));
};

// Gestion de la récupération de la liste entière de sauces
exports.getAllSauces = (req, res, next) => {
  sauce.find()
  .then(sauces => res.status(200).json(sauces))
  .catch(error => res.status(400).json({ error }));
};