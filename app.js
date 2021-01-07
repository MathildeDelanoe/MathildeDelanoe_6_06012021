// Pour importer express
const express = require('express');

// Pour importer body-parser
const bodyParser = require('body-parser');

// Importer mongoose
const mongoose = require('mongoose');

// Importe le routeur
const userRoutes = require('./routes/user')

// Connexion à la database mongoDB
mongoose.connect('mongodb+srv://test:cabqJsGyFqgZ7TV@cluster0.oahzn.mongodb.net/test?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

// Pour l'application
const app = express();

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

app.use(bodyParser.json());

app.use('/api/auth', userRoutes);

//exporter cette application
module.exports = app;