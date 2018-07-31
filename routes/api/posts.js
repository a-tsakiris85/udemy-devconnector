const express = require("express");

const router = express.Router(); //use router instead of app

//actually goes to api/users because of config in server.js
// @route   GET api/posts/test
// @desc    Tests post route
// @access  public
router.get("/test", (req, res) => {
  res.json({
    msg: "Post Test Message"
  }); //automatic 200 status
});

module.exports = router;
