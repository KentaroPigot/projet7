const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");
const compressImage = require("../middleware/compressImage");

const bookCtrl = require("../controllers/book");

router.get("/bestrating", bookCtrl.bestRating);

router
  .route("/")
  .get(bookCtrl.getAllBooks)
  .post(auth, multer, compressImage, bookCtrl.createBook);

router
  .route("/:id")
  .get(bookCtrl.getOneBook)
  .put(auth, bookCtrl.modifyBook)
  .delete(auth, bookCtrl.deleteBook);

router.post("/:id/rating", auth, bookCtrl.addRating);

module.exports = router;
