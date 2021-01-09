const multer = require('multer');

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpeg',
    'image/png': 'png',
};

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images')
    },
    filename: (req, file, callback) => {
        console.log(file.originalname)
        const name = file.originalname.split(' ').join('_'); // Elimine les espaces et les remplace par des _
        console.log(name)
        const extension = MIME_TYPES[file.mimetype];
        console.log(extension)
        // Timestamp pour rendre l'image unique
        callback(null, name + Date.now() + '.' + extension);
    }
});

module.exports = multer({ storage }).single('image');