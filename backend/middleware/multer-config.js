const multer = require("multer");

// associe les types MIME des fichiers avec leurs extensions
const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
};

// Défini où l'on va stocker l'image (dossier "images")
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    // console.log(callback);
    callback(null, "images");
  },

  // Modifie le fichier que l'on reçoit pour qu'il suive une nomenclature défini
  filename: (req, file, callback) => {
    const name = file.originalname.split(" ").join("_");
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + "." + extension);
  },
});

// "Single" car l'on veut autoriser qu'une seule image à la fois
module.exports = multer({ storage: storage }).single("image");

// En utilisant ce middleware, multer va automatiquement créer et stocker l'image dans un dossier
