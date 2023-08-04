const express = require("express");
const mongoose = require("mongoose");
// const passport = require("passport");
// const JwtStrategy = require('passport-jwt').Strategy,
// ExtractJwt = require('passport-jwt').ExtractJwt,
// passportJwt = require('passport-jwt').PassportJwt;
const passport = require('passport');
const JwtStrategy = require("passport-jwt").Strategy,
    ExtractJwt = require("passport-jwt").ExtractJwt;
const User = require("./models/User");
const authRoutes = require("./routes/auth");
const songRoutes = require("./routes/song");
const playlistRoutes = require("./routes/playlist");
require("dotenv").config();
const dbUrl = process.env.dbUrl;
const app = express();
const port = 8000;
// const JWT_SECRET = 'thisKeyIsSupposedToBeSecret';
// const JWT_EXPIRES_IN = '7 days';

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

let opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = "thisKeyIsSupposedToBeSecret";
passport.use(
    new JwtStrategy(opts, function (jwt_payload, done) {
        User.findOne({_id: jwt_payload.identifier})
        .then((user) => {
            if (user) {
                return done(null, user);
            } else {
                console.log("Error");
                return done(null, false);
                // or you could create a new account
            }
        })
    })
);


app.get("/", (req, res) => {
    res.send("Hello World");
});

app.use("/auth", authRoutes);
app.use("/song", songRoutes);
app.use("/playlist", playlistRoutes);

app.listen(port, () => {
    console.log("App is running on the port 8000");
});