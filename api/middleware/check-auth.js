const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decode = jwt.verify(token, process.env.JWT_PRIVATEKEY);
    req.userData = token;
    next();
  } catch (error) {
    res.status(401).json({
      Message: "auth failed",
    });
  }
};
