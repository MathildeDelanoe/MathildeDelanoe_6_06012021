// Importation des differents package
const express = require('express');
const bodyParser = require('body-parser');
const mongoSanitize = require('express-mongo-sanitize');
const mongoose = require('mongoose');
const path = require('path');
const helmet = require('helmet');
require('dotenv').config();

// Importation des routeurs
const userRoutes = require('./routes/user');
const sauceRoutes = require('./routes/sauce');

// Connexion à la base de données mongoDB
mongoose.connect(`${process.env.DB_HOST}://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_CLUSTERURL}/test?retryWrites=true&w=majority`,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));
mongoose.set('useCreateIndex', true); // Enlève le warning "DeprecationWarning: collection.ensureIndex is deprecated"

// Création de l'application Express
const app = express();

// Permet de sécuriser en définissant des en-têtes HTTP liés à la sécurité
app.use(helmet());

// Nettoie les données fournies pas les utilisateurs pour empêcher les attaques d'injection
app.use(mongoSanitize());

// Empêche les requêtes malveillantes d'accéder à des ressources sensibles
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

// Permet d'extraire le corps de la requête
app.use(bodyParser.json());

// Indique qu'il faut gérer l'image de manière statique
app.use('/images', express.static(path.join(__dirname, 'images')));

// Enregistrement des routes
app.use('/api/auth', userRoutes);
app.use('/api/sauces', sauceRoutes);

//exporter cette application
module.exports = app;