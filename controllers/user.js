// Import des dépendances et modeles
const bcrypt = require('bcrypt');
const jwt = require ('jsonwebtoken');

const user = require('../models/user');

// Gestion de l'enregistrement de nouveaux utilisateurs
exports.signup = (req, res, next) => {
    // Fonction pour crypter le mot de passe via hash
    bcrypt.hash(req.body.password, 10) // 10 iterations
    .then(hash => {
        // Creation d'un nouvel utilisateur avec son email et son mot de passe crypté
        const signedUser = new user({
            email: req.body.email,
            password: hash
        }); 
        
        // Sauvegarde du nouvel utilisateur dans la base de donnees
        signedUser.save()
            .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
            .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};

// Gestion de la connexion des utilisateurs existants
exports.login = (req, res, next) => {
    // Pour trouver un utilisateur dans la base de données a partir de son email
    user.findOne({ email: req.body.email })
    .then(foundUser => {
        /* foundUser peut être vide dans le cas où aucun utilisateur ne correspond dans la base de données
           ou contenir l'utilisateur en question
        */
        if (!foundUser)
        {
            // L'utilisateur est absent de la base de données
            return res.status(401).json({ error: 'Utilisateur non trouvé !' });
        }
        
        // Fonction pour comparer le mot de passe envoyé par l'utilisateur avec le hash de la BDD)
        bcrypt.compare(req.body.password, foundUser.password)
        .then(valid => {
            // valid est un booléen qui retourne si la comparaison est validée (les chaînes de caractères sont identiques - retourne true) ou non (retourne false)
            if (!valid)
            {
                return res.status(401).json({ error: 'Mot de passe incorrect !' });
            }

            // Envoi d'un objet json qui contient l'identifiant de l'utilisateur et un token
            res.status(200).json({
                userId: foundUser._id,
                token: jwt.sign(
                    { userId: foundUser.id},
                    'RANDOM_TOKEN_SECRET',
                    { expiresIn: '24h' }
                )
            });
        })
        .catch(error => res.status(500).json({ error }));
    }) 
    .catch(error => res.status(500).json({ error }));
};


