var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var User = require('../models/user');
var session = require('express-session');
var jwt = require('jsonwebtoken');
var secret = 'travinesiaauthentication';

module.exports = function(app, passport) {
    
    //oauth Facebook
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(session({ secret: 'TravinesiaFacebook', resave: false, saveUninitialized: true, cookie: { secure: false } }));
    passport.serializeUser(function(user, done){
        token = jwt.sign({ name: user.name, email: user.email }, secret, { expiresIn: '24h' });
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done){
        User.findById(id, function(err, user){
            done(err, user);
        });
    });
    
    passport.use(new FacebookStrategy({
        clientID: '280844729091966',
        clientSecret: 'd9eee834651b7fe25eb9ea9d51ffbaae',
        callbackURL: "http://localhost:3000/auth/facebook/callback",
        profileFields: ['id', 'displayName', 'photos', 'email']
      },
      function(accessToken, refreshToken, profile, done) {
        User.findOne({ email: profile._json.email }).select('name password email').exec(function(err, user){
            if (err) done(err);

            if (user && user != null) {
                done(null, user);
            } else {
                done(err);
            }
        });
        done(null, profile);
      }
    ));
    
    //oauth Twitter
    passport.use(new TwitterStrategy({
        consumerKey: '3X4vi0PLb3k1vndcTMKVVnsLM',
        consumerSecret: 'aBF7WZXSXtvQpRZC9YJ5WkhNtrmL2UmtDbxb10pcceG7L2lVd7',
        callbackURL: "http://localhost:3000/auth/twitter/callback",
        userProfileURL: "https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true"
      },
      function(token, tokenSecret, profile, done) {
        User.findOne({ email: profile.emails[0].value }).select('name password email').exec(function(err, user){
            if (err) done(err);

            if (user && user != null) {
                done(null, user);
            } else {
                done(err);
            }
        });
      }
    ));

    //oauth Google
    passport.use(new GoogleStrategy({
        clientID: '51339990419-nnkhcb7eai1mo5psqsmbvcchg1ag3eu0.apps.googleusercontent.com',
        clientSecret: '5kxFbSUtMpVWFEnyy5KsnSv1',
        callbackURL: "http://localhost:3000/auth/google/callback"
      },
    function(accessToken, refreshToken, profile, done) {
        User.findOne({ email: profile.emails[0].value }).select('name password email').exec(function(err, user){
            if (err) done(err);

            if (user && user != null) {
                done(null, user);
            } else {
                done(err);
            }
        });
      }
    ));

    //Route oauth Google
    app.get('/auth/google', passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login', 'profile', 'email'] }));
  
    app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/googleerror' }), function(req, res) {
      res.redirect('/google/' + token);
    });

    app.get('/auth/twitter', passport.authenticate('twitter'));

    app.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/twittererror' }), function(req, res){
        res.redirect('/twitter/' + token);
    });

    app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/facebookerror' }), function(req, res){
        res.redirect('/facebook/' + token);
    });

    app.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));

    return passport;
}