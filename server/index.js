const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const app = express();
const port = 8000;
const dbUrl = process.env.dbUrl;
const JwtStrategy = require('passport-jwt').Strategy,
     ExtractJwt = require('passport-jwt').ExtractJwt;
const passport = require("passport");
const User = require("./models/User");
const authRoutes = require("./routes/auth");
const songRoutes = require("./routes/song");

app.use(express.json());
    //connect to database
mongoose.connect(dbUrl, 
{
//yUHmCwGVAprRrkH1
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then((x) => {
    console.log("Connected to database...");
})
.catch((err) => {
    console.log(err);
    console.log("Error");
});

let opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = "thisKeyIsSupposedToBeSecret";
passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    User.findOne({id: jwt_payload.sub}, function(err, user) {
        if (err) {
            return done(err, false);
        }
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
            // or you could create a new account
        }
    });
}));


app.get("/", (req, res) => {
    res.send("Hello World");
});

app.use("/auth", authRoutes);
app.use("/song", songRoutes);

app.listen(port, () => {
    console.log("App is running on the port 8000");
});