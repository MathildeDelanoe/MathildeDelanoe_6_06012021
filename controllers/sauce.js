// Import du modèle
const sauce = require('../models/sauce');
const fs = require ('fs');

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

// Gestion de la récupération d'une sauce
exports.getOneSauce = (req, res, next) => {
  sauce.findOne({ _id: req.params.id})
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({ error }));
};

// Gestion de la modification d'une sauce
exports.modifySauce = (req, res, next) => {
  const modifiedSauce = req.file ?
    { 
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
     } : { ...req.body };
  sauce.updateOne({_id: req.params.id}, {...modifiedSauce, _id:req.params.id})
    .then(() => res.status(200).json({message: 'Sauce modifiée !'}))
    .catch(error => res.status(400).json({ error }));
};

// Gestion de la récupération d'une sauce
exports.deleteSauce = (req, res, next) => {
  sauce.findOne({_id: req.params.id})
    .then(sauce => {
      const filename = sauce.imageUrl.split('/images/')[1];// on récupère le deuxième élément du tableau pour avoir le nom du fichier
      fs.unlink('images/' + filename,() => {
        sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({message: 'Sauce supprimée !'}))
          .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error }));
};


// Gestion du like ou du dislike d'une sauce
exports.likeSauce = (req, res, next) => {
  sauce.findOne({ _id: req.params.id})
    .then(sauce => {
      let message = "";
      // Si l'utilisateur aime la sauce
      if (req.body.like === 1)
      {
          sauce.usersLiked.push(req.body.userId);
          message = "j\'aime";
      }
      // Si l'utilisateur n'aime pas la sauce
      else if (req.body.like === -1)
      {
        sauce.usersDisliked.push(req.body.userId);
        message = "je n\'aime pas";
      }
      else // Ici, l'utilisateur a supprimé son vote soit en enlevant son "j'aime" soit son "je n'aime pas"
      {
        // Recherche de l'id de l'utilisateur dans les utilisateurs qui aiment la sauce
        let userIndex = sauce.usersLiked.findIndex(element => (element === req.body.userId));
        if (userIndex !== -1) // -1 signifie que l'id n'a pas été trouvé dans le tableau
        {
          // Il a supprimé son "j'aime"
          sauce.usersLiked.splice(userIndex, 1); // Suppression d'un élément à l'indice userIndex
        }

        // Recherche de l'id de l'utilisateur dans les utilisateurs qui n'aiment pas la sauce
        userIndex = sauce.usersDisliked.findIndex(element => (element === req.body.userId));
        if (userIndex !== -1)
        {
          // Il a supprimé son "je n'aime pas"
          sauce.usersDisliked.splice(userIndex, 1); // Suppression d'un element a l'indice userIndex
        }
        message = "supression du précédent choix";
      }
        sauce.likes = sauce.usersLiked.length;
        sauce.dislikes = sauce.usersDisliked.length;
        sauce.save()
        .then(() => res.status(201).json(message))
        .catch(error => res.status(400).json({ error }));
      })
    .catch(error => res.status(400).json({ error }))
};