// Importation des dépendances
const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user');

// Création des routes
router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);

// Exportation du router et de ses différentes routes
module.exports = router;