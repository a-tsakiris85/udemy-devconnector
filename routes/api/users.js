const express = require("express");

const router = express.Router(); //use router instead of app

// @route   GET api/users/test
// @desc    Tests users route
// @access  public
router.get("/test", (req, res) => {
  res.json({
    msg: "User Test Message"
  }); //automatic 200 status
});

module.exports = router;
