// Importation des dépendances
const multer = require('multer');

// Dictionnaire des extensions de fichiers
const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpeg',
    'image/png': 'png',
};

// Cette constante indique où enregistrer l'image ainsi que la création du nom de fichier unique
const storage = multer.diskStorage(
{
    destination: (req, file, callback) =>
    {
        callback(null, 'images')
    },
    filename: (req, file, callback) => 
    {
        const extension = MIME_TYPES[file.mimetype];
        // Timestamp pour rendre l'image unique
        callback(null, 'sauce_' + Date.now() + '.' + extension);
    }
});

// Exportation de l'élément multer
module.exports = multer({ storage }).single('image'); // Seulement téléchargement de fichiers image