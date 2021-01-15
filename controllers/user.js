// Import des dépendances
const bcrypt = require('bcrypt');
const jwt = require ('jsonwebtoken');
var cryptoJs = require("crypto-js");
var passwordValidator = require('password-validator');

// Import du modèle
const user = require('../models/user');

var schema = new passwordValidator();

schema
  .is().min(8)
  .is().max(30)
  .has().uppercase()
  .has().lowercase()
  .has().digits(1)
  .has().not().spaces();


function checkPassword(password)
{
    return new Promise((resolve, reject) => {
        if (schema.validate(password))
        {
            resolve(true);
        }
        else
        {
            reject('Votre mot de passe ne remplit pas les critères');
        }
    });
}


function checkEmail(email)
{
    return new Promise((resolve, reject) => {
        const regex = /[A-z0-9_.-]+@[A-z]+.[A-z]{2,3}$/gm;
        if (email.match(regex) !== null)
        {
            resolve(true);
        }
        else
        {
            throw new Error('Votre email ne remplit pas les critères');
        }
    });
}

// Gestion de l'enregistrement de nouveaux utilisateurs
exports.signup = (req, res, next) => {
    checkEmail(req.body.email)
        .then(() => 
            checkPassword(req.body.password)
            .then(() => {
                // Chiffrement de l'adresse email
                let encryptedEmail = cryptoJs.AES.encrypt(req.body.email, "key").toString();
                // Fonction pour crypter le mot de passe via hash
                bcrypt.hash(req.body.password, 10) // 10 iterations
                .then(hash => {
                    // Creation d'un nouvel utilisateur avec son email et son mot de passe crypté
                    const signedUser = new user({
                        email: encryptedEmail,
                        password: hash
                    }); 
                    
                    // Sauvegarde du nouvel utilisateur dans la base de données
                    signedUser.save()
                        .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
                        .catch(error => res.status(400).json({error}));
                    })
                    
                .catch(error => res.status(500).json({ error }));
            })
            .catch((error) => {res.status(403).json({error});})
        )
        .catch((error => {console.log(error); res.status(500).json({ error });}))
};

// Gestion de la connexion des utilisateurs existants
exports.login = (req, res, next) => {
    let currentEmail = "";
    user.find()
        .then(users => {
            for (let user of users)
            {
                var bytes  = cryptoJs.AES.decrypt(user.email, 'key');
                var originalEmail = bytes.toString(cryptoJs.enc.Utf8);
                if (originalEmail === req.body.email)
                {
                    currentEmail = user.email;
                    break;
                }
            }
             // Pour trouver un utilisateur dans la base de données a partir de son email
            return user.findOne({ email: currentEmail })
        })
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
                        { userId: foundUser._id},
                        'RANDOM_TOKEN_SECRET',
                        { expiresIn: '24h' }
                    )
                });
            })
            .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};


