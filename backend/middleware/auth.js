const jwt = require("jsonwebtoken");

// On utilise la clef secrete défini plus tôt, RANDOM_TOKEN_SECRET pour décoder le token qui contient le userId. Il va ensuite dans le req.auth pour être utilisé plus tard

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, "RANDOM_TOKEN_SECRET");
    const userId = decodedToken.userId;
    req.auth = {
      userId: userId,
    };
    next();
  } catch (error) {
    res.status(401).json({ error });
  }
};
