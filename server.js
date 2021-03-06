const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");

const users = require("./routes/api/users");
const profile = require("./routes/api/profile");
const posts = require("./routes/api/posts");

//Create an express app
const app = express();

//Body Parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const cors = require("cors");
app.use(cors());

//DB Config
var db = process.env.MONGODB_URI || require("./config/keys").mongoURI;

//Connect to mongoDB
mongoose
  .connect(
    db,
    { useNewUrlParser: true }
  )
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

//Passport middleware
app.use(passport.initialize());

//Passport Config
require("./config/passport.js")(passport);

//Use Routes from files on these routes.
app.use("/api/users", users);
app.use("/api/profile", profile);
app.use("/api/posts", posts);

const port = 5000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
