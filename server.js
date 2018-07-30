const express = require("express");
const mongoose = require("mongoose");

//Create an express app
const app = express();

//DB Config
var db = require("./config/keys").mongoURI;

//Connect to mongoDB
mongoose
  .connect(
    db,
    { useNewUrlParser: true }
  )
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));
//Sample Route~
app.get("/", (req, res) => res.send("Hello"));

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
