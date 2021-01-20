// Importation du modèle
const user = require('../models/user');

// Importation des dépendances
const bcrypt = require('bcrypt');
const jwt = require ('jsonwebtoken');
var cryptoJs = require("crypto-js");
var passwordValidator = require('password-validator');

/* Paramétrage du schéma de mot de passe autorisé
 Longueur minimale de 8 éléments
 Longueur maximale de 30 éléments
 Présence d'au moins une majuscule
 Présence d'au moins une minuscule
 Présence d'au moins un chiffre
 Absence d'espaces
*/
var schema = new passwordValidator();
schema
  .is().min(8)
  .is().max(30)
  .has().uppercase()
  .has().lowercase()
  .has().digits(1)
  .has().not().spaces();

/* Fonction de vérification du mot de passe
 La fonction prend en argument une chaine de caractères représentant un mot de passe
 Elle renvoie une promesse :
    - résolue si le mot de passe est conforme au format attendu
    - rejetée si le mot de passe ne respecte pas les critères définis
*/
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

/* Fonction de vérification de l'adresse email
 La fonction prend en argument une chaine de caractères représentant une adresse email
 Elle renvoie une promesse :
    - résolue si l'email est conforme à l'expression régulière définie
    - rejetée si l'email diffère du format attendu
*/
function checkEmail(email)
{
    return new Promise((resolve, reject) => {
        /* /gm signifie :
            g : 'global', vérifie l'expression dans son intégralité
            m : 'multi line', les symboles ^ et $ représentent le début et la fin de la ligne
        */
        const regex = /^[A-z0-9_.-]+@[A-z]+.[A-z]{2,3}$/gm; // Définition de l'expression régulière
        if (email.match(regex) !== null)
        {
            // L'email est du format attendu
            resolve(true);
        }
        else
        {
            reject('Votre email ne remplit pas les critères');
        }
    });
}

// Création du middleware d'enregistrement de nouveaux utilisateurs
exports.signup = (req, res, next) => {
    checkEmail(req.body.email) // Vérification du format d'email
        .then(() => 
            checkPassword(req.body.password) // Vérification du format de mot de passe
            .then(() =>
            {
                // Chiffrement de l'adresse email
                let encryptedEmail = cryptoJs.AES.encrypt(req.body.email, "key").toString();
                // Fonction pour crypter le mot de passe via hash
                bcrypt.hash(req.body.password, 10) // 10 itérations
                .then(hash =>
                {
                    // Création d'un nouvel utilisateur avec email/mot de passe cryptés
                    const signedUser = new user({
                        email: encryptedEmail,
                        password: hash
                    }); 
                    // Sauvegarde du nouvel utilisateur dans la base de données et envoi de la réponse
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

// Création du middleware de connexion des utilisateurs
exports.login = (req, res, next) => {
    let currentEmail = "";
    /* Comme le cryptage AES utilisé ne permet pas d'obtenir le même cryptage pour une même chaine de départ
       il nous faut parcourir tous les utilisateurs de la base, décoder les emails et les comparer à celui
       présent dans la requête.
    */
    user.find() // Récupération de tous les utilisateurs
        .then(users =>
        {
            // Parcours du tableau de users
            for (let user of users)
            {
                // Décrytage de l'email présent danse MongoDB
                var bytes  = cryptoJs.AES.decrypt(user.email, 'key');
                var originalEmail = bytes.toString(cryptoJs.enc.Utf8);
                // Si l'email correspond on sort de la boucle for
                if (originalEmail === req.body.email)
                {
                    currentEmail = user.email; // Stockage de l'email crypté
                    break;
                }
            }
             // Recherche de l'utilisateur dans la base de données à partir de son email crypté
            return user.findOne({ email: currentEmail })
        })
        .then(foundUser =>
        {
            /* foundUser peut être vide dans le cas où aucun utilisateur ne correspond dans la base de données
               ou contenir l'utilisateur en question
            */
            if (!foundUser)
            {
                // L'utilisateur est absent de la base de données, envoi d'une réponse avec erreur
                return res.status(401).json({ error: 'Utilisateur non trouvé !' });
            }
            // L'utilisateur a été trouvé. Il faut maintenant procéder à la comparaison des mots de passe
            bcrypt.compare(req.body.password, foundUser.password)
            .then(valid =>
            {
                /* valid est un booléen qui retourne si la comparaison est validée :
                    - les chaînes de caractères sont identiques => renvoie true
                    - les chaînes diffèrent => renvoie false
                */
                if (!valid)
                {
                    // Le mot de passe fourni diffère de celui enregistré dans MongoDB => envoi d'une réponse avec erreur
                    return res.status(401).json({ error: 'Mot de passe incorrect !' });
                }
                /* Le mot de passe est correct.
                   Envoi d'un objet json qui contient l'identifiant de l'utilisateur et un token d'authentification
                */
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


