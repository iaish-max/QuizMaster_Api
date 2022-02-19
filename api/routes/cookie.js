const express = require("express");
const router = express.Router();

router.get("/", (req, res, next) => {
  let options = {
    maxAge: 1000 * 60 * 15, // would expire after 15 minutes
    httpOnly: true, // The cookie only accessible by the web server
    signed: true, // Indicates if the cookie should be signed
  };

  // Set cookie
  res.cookie("cookieName", "cookieValue", options);

  res.json({
    message: "hello",
  });
});

module.exports = router;
