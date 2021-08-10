const express = require("express");
const bodyParser = require("body-parser");
const Promotions = require("../models/favorite");
const authenticate = require("../authenticate");
const cors = require("./cors");
const User = require("../models/user");
const Favorite = require("../models/favorite");

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({
      user: req.user._id,
    })
      .populate("user")
      .populate("dishes")
      .then((favorites) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(favorites);
      })
      .catch((err) => {
        next(err);
      });
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({
      user: req.user._id,
    }).then((favorites) => {
      if (favorites !== null) {
        req.body.forEach((dish) => {
          favorites.dishes = favorites.dishes.concat(dish._id);
        });
        favorites
          .save()
          .then(
            (favorites) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(favorites);
            },
            (err) => next(err)
          )
          .catch((err) => next(err));
      } else {
        Favorite.create({
          user: req.user._id,
        })
          .then(
            (favorites) => {
              req.body.forEach((dish) => {
                favorites.dishes = favorites.dishes.concat(dish._id);
              });
              favorites
                .save()
                .then(
                  (favorites) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(favorites);
                  },
                  (err) => next(err)
                )
                .catch((err) => next(err));
            },
            (err) => next(err)
          )
          .catch((err) => next(err));
      }
    });
  })
  .put(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /favorites`);
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndRemove({
      user: req.user._id,
    })
      .then(
        (resp) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(resp);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

favoriteRouter
  .route("/:dishId")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(`GET operation not supported on /favorites/${req.params.dishId}`);
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({
      user: req.user._id,
    }).then((favorites) => {
      if (favorites !== null) {
        favorites.dishes = favorites.dishes.concat(req.params.dishId);
        favorites.save().then(
          (favorites) => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(favorites);
          },
          (err) => next(err)
        );
      } else {
        Favorite.create({
          user: req.user._id,
        })
          .then(
            (favorites) => {
              favorites.dishes = favorites.dishes.concat(req.params.dishId);
              favorites.save().then(
                (favorites) => {
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json(favorites);
                },
                (err) => next(err)
              );
            },
            (err) => next(err)
          )
          .catch((err) => next(err));
      }
    });
  })
  .put(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /favorites/${req.params.dishId}`);
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({
      user: req.user._id,
    })
      .then(
        (favorites) => {
          var dishIndex = favorites.dishes.indexOf(req.params.dishId);
          favorites.dishes = favorites.dishes.pop(dishIndex, 1);
          favorites.save().then(
            (favorites) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(favorites);
            },
            (err) => next(err)
          );
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

module.exports = favoriteRouter;
