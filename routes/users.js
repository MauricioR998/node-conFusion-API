const passport = require("passport");

const cors = require("./cors");

const authenticate = require("../authenticate");

var express = require("express");
const bodyParser = require("body-parser");
const User = require("../models/user");

var router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router.get(
  "/",
  cors.corsWithOptions,
  authenticate.verifyUser,
  authenticate.verifyAdmin,
  (req, res, next) => {
    User.find({}).then(
      (users) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(users);
      },
      (err) => next(err)
    );
  }
);

router.post("/signup", cors.corsWithOptions, (req, res, next) => {
  User.register(
    new User({
      username: req.body.username,
    }),
    req.body.password,
    (err, user) => {
      if (err) {
        res.setHeader("Content-Type", "application/json");
        res.statusCode = 500;
        res.json({ error: err });
      } else {
        if (req.body.firstname) user.firstname = req.body.firstname;
        if (req.body.lastname) user.lastname = req.body.lastname;
        user.save((err, user) => {
          if (err) {
            res.setHeader("Content-Type", "application/json");
            res.statusCode = 500;
            res.json({ error: err });
            return;
          }
          passport.authenticate("local")(req, res, () => {
            res.setHeader("Content-Type", "application/json");
            res.statusCode = 200;
            res.json({ success: true, status: "Registration Successful!" });
          });
        });
      }
    }
  );
});

router.post(
  "/login",
  cors.corsWithOptions,
  passport.authenticate("local"),
  (req, res) => {
    var token = authenticate.getToken({ _id: req.user._id });
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 200;
    res.json({
      success: true,
      token,
      status: "You are successfully logged in!",
    });
  }
);

router.get("/logout", cors.corsWithOptions, (req, res) => {
  if (req.session) {
    req.session.destroy();
    res.clearCookie("session-id");
    res.redirect("/");
  } else {
    var err = new Error("You are not logged in!");
    err.status = 403;
    next(err);
  }
});

router.delete("/dropCollection", cors.corsWithOptions, function (req, res) {
  User.remove({}).then(
    (resp) => {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.json(resp);
    },
    (err) => next(err)
  );
});

module.exports = router;
