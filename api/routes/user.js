const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt"); // for hashing the password.
const jwt = require("jsonwebtoken"); // for making token

const User = require("../models/user");
const RefreshToken = require("../models/refreshToken");

router.post("/signUp", (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then((user) => {
      console.log(user);
      if (user.length >= 1) {
        res.status(409).json({
          message: "Email already exist",
        });
      } else {
        bcrypt.hash(req.body.password, 10, function (err, hash) {
          if (err) {
            return res.status(500).json({
              error: err,
            });
          } else {
            const user = new User({
              _id: new mongoose.Types.ObjectId(),
              email: req.body.email,
              password: hash,
            });

            user
              .save()
              .then((result) => {
                console.log(result);
                res.status(201).json({
                  message: "User created successfully",
                });
              })
              .catch((err) => {
                console.log(err);
                res.status(500).json({
                  error: err,
                });
              });
          }
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        err: error,
      });
    });
});

router.post("/login", (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then((user) => {
      if (user.length < 1) {
        //check valid email
        return res.status(401).json({
          message: "auth failed",
        });
      } else {
        // check valid password
        bcrypt.compare(
          req.body.password,
          user[0].password,
          function (err, result) {
            if (err) {
              // error comes while in hashing the given password
              return res.status(401).json({
                error: err,
              });
            }
            if (result) {
              const token = jwt.sign(
                {
                  email: user[0].email, // payload data of user given to jwt
                  userId: user[0]._id,
                },
                process.env.JWT_PRIVATEKEY,
                { expiresIn: "1m" } // access token expires in a minute.
              );

              const madeRefreshToken = jwt.sign(
                {
                  email: user[0].email,
                  userId: user[0]._id,
                },
                process.env.JWT_REFRESHPRIVATEKEY
              );

              const refreshToken = new RefreshToken({
                _id: new mongoose.Types.ObjectId(),
                refreshTokenId: madeRefreshToken,
              });

              refreshToken.save();

              return res.status(200).json({
                message: "auth successful",
                token: token,
                refreshToken: madeRefreshToken,
              });
            }

            res.status(401).json({
              message: "auth failed",
            });
          }
        );
      }
    })
    .catch((err) => {
      res.status(401).json({
        error: err,
      });
    });
});

router.delete("/logout", (req, res, next) => {
  RefreshToken.remove({ refreshTokenId: req.body.refreshTokenId })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "log out successfully",
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

module.exports = router;
