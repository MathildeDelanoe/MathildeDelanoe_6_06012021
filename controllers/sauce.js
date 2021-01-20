// Importation du modèle
const sauce = require('../models/sauce');
// Importation des dépendances
const fs = require ('fs');

/* Création du middleware d'ajout d'une sauce grâce à "ajouter une sauce"
 La requête contient un formData envoyé par le frontEnd qui contient un objet
 sauce et un objet image
*/
exports.createSauce = (req, res, next) => {
    // Récupération de la partie "sauce" du corps de la requête
    const currentSauceObject = JSON.parse(req.body.sauce);
    // Suppression de l'id généré par mongoDb
    delete currentSauceObject._id;
    // Création d'un nouvel objet sauce contenant l'objet sauce et l'image envoyée dans la requête
    const addedSauce = new sauce({
      ...currentSauceObject,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    // Sauvegarde de la nouvelle sauce dans la base de données et envoi de la réponse
    addedSauce.save()
      .then(() => res.status(201).json({ message: 'Sauce enregistrée !'}))
      .catch(error => res.status(400).json({ error }));
};

// Création du middleware de récupération de la liste entière de sauces
exports.getAllSauces = (req, res, next) => {
  // Récupération de toutes les sauces et envoi de la réponse contenant le tableau de sauce
  sauce.find()
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).json({ error }));
};

// Création du middleware de récupération d'une sauce
exports.getOneSauce = (req, res, next) => {
  // Récupération d'une sauce particulière et envoi de la réponse contenant cette unique sauce
  sauce.findOne({ _id: req.params.id})
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({ error }));
};

// Création du middleware de modification d'une sauce
exports.modifySauce = (req, res, next) => {
  // Interrogation de l'existence d'un fichier dans la requête => Signifie que l'image, au moins, a été modifiée
  const modifiedSauce = req.file ?
    { // Si l'image a été modifiée, gestion du formData reçu du frontEnd
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : 
    { // Seulement du contenu texte a été modifié, la requête présente seulement un contenu JSON
      ...req.body 
    };
  // Recherche de la sauce à modifier par son ID
  sauce.findOne({_id: req.params.id})
    .then(currentsauce => {
      // Récupération du nom de l'image représentant la sauce avant modification
      const filename = currentsauce.imageUrl.split('/images/')[1];
      // Mise à jour de la sauce identifiée par son ID
      sauce.updateOne({_id: req.params.id}, {...modifiedSauce, _id:req.params.id})
        .then(() => fs.unlink('images/' + filename,() => { // Suppression de la précédente image stockée pour cette sauce
          res.status(200).json({message: 'Sauce modifiée !'})})) 
        .catch(error => res.status(400).json({ error })) 
    })
    .catch(error => res.status(500).json({ error }));
};

// Création du middleware de suppression d'une sauce
exports.deleteSauce = (req, res, next) => {
  // Recherche de la sauce à supprimer par son ID
  sauce.findOne({_id: req.params.id})
    .then(sauce => {
      // Récupération du nom de l'image représentant la sauce
      const filename = sauce.imageUrl.split('/images/')[1];
      // Suppression de l'image
      fs.unlink('images/' + filename,() => {
        sauce.deleteOne({ _id: req.params.id }) // Suppression de la sauce et envoi de la réponse
          .then(() => res.status(200).json({message: 'Sauce supprimée !'}))
          .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error }));
};

// Création du middleware de gestion du like ou du dislike d'une sauce
exports.likeSauce = (req, res, next) => {
  // Recherche de la sauce pour laquelle un vote a été émis
  sauce.findOne({ _id: req.params.id})
    .then(sauce => {
      // Création d'une variable contenant le texte de succès de la promesse
      let message = "";
      // Si l'utilisateur aime la sauce
      if (req.body.like === 1)
      {
        sauce.usersLiked.push(req.body.userId); // Mise à jour du tableau des utilisateurs aimant la sauce
        message = "j\'aime";
      }
      // Si l'utilisateur n'aime pas la sauce
      else if (req.body.like === -1)
      {
        sauce.usersDisliked.push(req.body.userId); // Mise à jour du tableau des utilisateurs n'aimant pas la sauce
        message = "je n\'aime pas";
      }
      // Ici, l'utilisateur a supprimé son vote soit en enlevant son "j'aime" soit son "je n'aime pas"
      else
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
      // Mise à jour du nombre de like et dislike
      sauce.likes = sauce.usersLiked.length;
      sauce.dislikes = sauce.usersDisliked.length;
      // Sauvegarde de la sauce avec les informations de like/dislike mises à jour et envoi de la réponse
      sauce.save()
      .then(() => res.status(201).json(message))
      .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(400).json({ error }))
};