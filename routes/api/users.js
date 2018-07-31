const express = require("express");

const router = express.Router(); //use router instead of app

const User = require("../../models/User");
const keys = require("../../config/keys");

const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// @route   GET api/users/test
// @desc    Tests users route
// @access  public
router.get("/test", (req, res) => {
  res.json({
    msg: "User Test Message"
  }); //automatic 200 status
});

// @route    POST api/users/register
// @desc    Register
// @access  public
router.post("/register", (req, res) => {
  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      return res.status(400).json({ email: "Email already exists" }); //email already exists
    } else {
      const avatar = gravatar.url(req.body.email, {
        s: "200", //Size
        r: "pg", //Rating
        d: "mm" //gives default pic
      });
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar: avatar,
        password: req.body.password
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => {
              res.json(user);
            })
            .catch(err => console.log(err));
        });
      });
    }
  });
});

// @route    POST api/users/login
// @desc    Login user / Returning JWT Token
// @access  public

router.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email }).then(user => {
    if (!user) {
      return res.status(404).json({ email: "User not found" });
    } else {
      bcrypt.compare(password, user.password).then(isMatch => {
        if (isMatch) {
          //Success!
          //payload. Gets in the token
          const payload = {
            id: user.id,
            name: user.name,
            avatar: user.avatar
          };
          //Sign the token
          jwt.sign(
            payload,
            keys.secretOrKey,
            { expiresIn: 7200 },
            (err, token) => {
              res.json({ success: true, token: "Bearer " + token });
            }
          );
        } else {
          res.status(400).json({ password: "Password incorrect" });
        }
      });
    }
  });
});

module.exports = router;
