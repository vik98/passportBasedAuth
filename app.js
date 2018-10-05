var express = require("express");
var bodyParser = require("body-parser");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");
var mongoose = require("mongoose");
var user = require("./models/user");

var app = express();

mongoose.connect("mongodb://localhost/user");

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(require("express-session")({
  secret: "Random",
  resave: false,
  saveUninitialized: false
}));

app.set("view engine", "ejs");
app.use(passport.initialize());
app.use(passport.session());

// serializeUser will take data from the session which is encoded and decodes the data.
passport.use(new LocalStrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.get("/", function(req, res) {
  res.render("home");
});

app.get("/secret", isLoggedIn, function(req, res) {
  res.render("secret");
});

app.get("/login", function(req, res) {
  res.render("login");
});

//middleware is used to execute before the call back function, itis executed as soon as the route request is made and before the callback execution
app.post("/login", passport.authenticate("local", {
  successRedirect: "/secret",
  failureRedirect: "/login"
}), function(req, res) {});

app.get("/register", function(req, res) {
  res.render("register");
});

app.post("/register", function(req, res) {
  user.register(new user({
    username: req.body.username
  }), req.body.password, function(err, user) {
    if (err) {
      console.log(err);
    }
    passport.authenticate("local")(req, res, function() {
      res.redirect("/secret");
    });
  });
});

app.get("/logout", function(req, res) {
  //passport will destroy all the user data in the session
  req.logout();
  res.redirect("/")
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    //Herre the next method will tell express to execute the call back function(req, res)
    // only if  Authenticated
    return next();
  }
  res.redirect("/login");
}

app.listen(3000, function() {
  console.log("Server Started");
});
