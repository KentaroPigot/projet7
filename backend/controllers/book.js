const Book = require("../models/Book");
const fs = require("fs");
const path = require("path");

exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(400).json({ error }));
};

exports.bestRating = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then((books) => {
      res.status(200).json([...books]);
    })
    .catch((error) => res.status(400).json({ error }));
};

exports.createBook = (req, res, next) => {
  // l'identifiant utilisateur (userId) est déjà inclus dans la requête http en tant que jeton d'authentification. On supprime donc ces valeurs que l'utilisateur aurait pu définir.
  // Et on utilise l'id présent dans le jeton.
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject.userId;

  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/${req.file.path}`,
  });
  book
    .save()
    .then(() => {
      res.status(201).json({ message: "Objet enregistré !" });
    })
    .catch((error) => {
      console.error(error);
      res.status(400).json({ error });
    });
};

exports.deleteBook = (req, res, next) => {
  Book.findById(req.params.id)
    .then((book) => {
      // Check if the user making the request is authorized to delete the book
      if (book.userId !== req.auth.userId) {
        return res.status(403).json({ error: "403: unauthorized request" });
      }
      console.log(book.imageUrl);

      // Delete the book
      Book.deleteOne({ _id: req.params.id })
        .then((deleteInfos) => {
          console.log(book.imageUrl);

          const imagePath = book.imageUrl.replace("http://localhost:4000/", "");
          const localImagePath = path.join(__dirname, "..", imagePath);

          fs.unlink(localImagePath, (err) => {
            if (err) {
              console.error(err);
            }
          });

          res.status(200).json({ message: "Objet supprimé" });
        })
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.modifyBook = (req, res, next) => {
  // Récupère le book et supprime le useId fourni par le client
  const bookObject = JSON.parse(req.body.book);
  delete bookObject.userId;

  Book.findById(req.params.id)
    .then((book) => {
      // Check if the user making the request is authorized to modify the book
      if (book.userId !== req.auth.userId) {
        return res.status(403).json({ error: "403: nauthorized request" });
      }

      // Récupère par défaut l'imageUrl déjà existant. Si une nouvelle image est ajoutée on le défini sur celle ci.
      let imageUrl = book.imageUrl;
      if (req.file) {
        imageUrl = `${req.protocol}://${req.get("host")}/${req.file.path}`;
      }

      // Update the book
      Book.updateOne(
        { _id: req.params.id },
        {
          ...bookObject,
          userId: req.auth.userId,
          imageUrl,
        }
      )
        .then((book) => {
          console.log(book);
          res.status(200).json({ message: "Objet modifié" });
        })
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.addRating = (req, res, next) => {
  const newRating = { userId: req.body.userId, grade: req.body.rating }; // On récupère l'id et la note
  Book.findOneAndUpdate(
    { _id: req.params.id }, // On trouve l'id du book que l'on souhaite modifier
    { $push: { ratings: newRating } }, // On push la nouvelle note dans ratings
    { new: true } // Pour return l'updated document
  ).then((updatedBook) => {
    // On calcul la moyenne du book updated
    const ratings = updatedBook.ratings;
    const sum = ratings.reduce((total, rating) => total + rating.grade, 0);
    const average = sum / ratings.length;
    updatedBook.averageRating = average;
    updatedBook // On save le nouveau book updated dans la database
      .save()
      .then(() => {
        res.status(201).json(updatedBook); // On return le book updated au client
      })
      .catch((error) => {
        console.error(error);
        res.status(400).json({ error });
      });
  });
};
