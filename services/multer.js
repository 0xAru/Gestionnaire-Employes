// Multer est une bibliothèque middleware pour Express.js, elle est utilisée pour gérer les téléchargements de fichiers dans les applications web. (ici elle est utile pour l'upload des photos des employés)
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './assets/uploads');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + file.originalname);
    }
})

const upload = multer({ storage: storage });

module.exports = upload;