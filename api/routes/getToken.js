const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const RefreshToken = require("../models/refreshToken");

router.get("/", (req, res, next) => {
  RefreshToken.find({ refreshTokenId: req.body.refreshTokenId })
    .exec()
    .then((result) => {
      console.log("dekh lo", result);

      if (result.length >= 1) {
        jwt.verify(
          req.body.refreshTokenId,
          process.env.JWT_REFRESHPRIVATEKEY,
          (err, user) => {
            if (err) {
              return res.status(401).json({
                message: "unauthorized user",
              });
            }

            console.log(user);
            const accessToken = jwt.sign(user, process.env.JWT_PRIVATEKEY, {
              expiresIn: "1m",
            });

            return res.status(200).json({
              token: accessToken,
            });
          }
        );
      } else {
        return res.status(401).json({
          message: "unauthorized",
        });
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

module.exports = router;
