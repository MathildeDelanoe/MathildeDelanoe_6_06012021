// Pour importer express
const express = require('express');

// Pour importer body-parser
const bodyParser = require('body-parser');

// Importer mongoose
const mongoose = require('mongoose');

const path = require('path');

const Sauce = require('./models/sauce');

require('dotenv').config();

// Importe le routeur
const userRoutes = require('./routes/user');
const sauceRoutes = require('./routes/sauce');

// Connexion à la database mongoDB
mongoose.connect(`${process.env.DB_HOST}://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_CLUSTER}/test?retryWrites=true&w=majority`,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));
mongoose.set('useCreateIndex', true);

// Pour l'application
const app = express();

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

app.use(bodyParser.json());

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/api/auth', userRoutes);
app.use('/api/sauces', sauceRoutes);

//exporter cette application
module.exports = app;