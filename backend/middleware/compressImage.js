const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const compressImage = (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const filePath = req.file.path;
  const newFilePath = path.posix.join(
    path.dirname(filePath),
    "compressed-" + req.file.filename
  );
  // console.log(newFilePath);

  sharp(filePath)
    .resize(800)
    .jpeg({ quality: 70 })
    .toFile(newFilePath, (err, info) => {
      if (err) {
        console.error(err);
        return next();
      }

      // Delete the original file
      fs.unlinkSync(filePath);

      // Set the path of the compressed file in the request object
      req.file.path = newFilePath;

      next();
    });
};

module.exports = compressImage;
