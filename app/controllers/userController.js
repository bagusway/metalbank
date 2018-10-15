var User = require('../models/user');
var jwt = require('jsonwebtoken');
var { secret } = require('../config/index');
var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');

//Cek ROLE

/*
1 = user
2 = provider
3 = admin provider
4 = admin travinesia
5 = customer
*/


var options = {
    auth: {
        api_user: 'travinesia',
        api_key: 'travinesia123'
    }
}

var client = nodemailer.createTransport(sgTransport(options));

//User Registeration Route
var register = function(req, res) {
    var user = new User();
    user.name = req.body.name;
    user.telephone = req.body.telephone;
    user.email = req.body.email;
    user.password = req.body.password;
    user.temporarytoken = jwt.sign({ id: user._id, id_user: user.id_user, name: user.name, email: user.email, role: user.role }, secret, { expiresIn: '24h' });
    if (req.body.name == null || req.body.name == '' || req.body.email == null || req.body.email == '' || req.body.password == null || req.body.password == '') {
        res.json({ success: false, message: 'Ensure email and password were provided' });
    } else {
        user.save(function(err) {
            if (err) {
                if (err.errors != null) {
                    if (err.errors.name) {
                        res.json({ success: false, message: err.errors.name.message });
                    } else if (err.errors.email) {
                        res.json({ success: false, message: err.errors.email.message });
                    } else if (err.errors.password) {
                        res.json({ success: false, message: err.errors.password.message });
                    } else {
                        res.json({ success: false, message: err });
                    }
                } else if (err) {
                    if (err.code == 11000) {
                        res.json({ success: false, message: 'That email is already taken' });
                    } else {
                        res.json({ success: false, message: err });
                    }
                }
            } else {
                var email = {
                    from: 'Travinesia, travinesia@localhost.com',
                    to: user.email,
                    subject: 'Travinesia Activation Link',
                    text: 'Hello ' + user.name + ', Thankyou for registering at travinesia.com. Please click on the following link below to complete your activation: http://travinesia.com:3000/v1/user/activate/' + user.temporarytoken,
                    html: 'Hello<strong> ' + user.name + '</strong>,<br><br>Thankyou for registering at travinesia.com. Please click on the link below to complete your activation:<br><br><a href="http://travinesia/v1/user/activate/' + user.temporarytoken + '">http://travinesia.com:3000/v1/user/activate</a>'
                };

                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('Message sent: ' + info.response);
                    }
                });
                res.json({ status: 200, success: true, message: 'Account registered! Please check your e-mail for activation link.' });
            }
        });
    }
}


//checkemail
var checkemail = function(req, res) {
    User.findOne({ email: req.body.email }).select('email').exec(function(err, user) {
        if (err) throw err;

        if (user) {
            res.json({ success: false, message: 'That E-mail is already taken' });
        } else {
            res.json({ success: true, message: 'Valid e-mail' });
        }
    });
}

//User Login Route
var authenticate = function(req, res) {
    User.findOne({ email: req.body.email }).select('name email password id_user role').exec(function(err, user) {
        if (err) throw err;

        if (!user) {
            res.json({ success: false, message: 'Ensure your Email and Password are correct' });
        } else if (user) {
            if (req.body.password) {
                var validPassword = user.comparePassword(req.body.password);
            } else {
                res.json({ status: 400, success: false, message: 'No password provided' });
            }
            if (!validPassword) {
                res.json({ status: 400, success: false, message: 'Ensure your Email and Password are correct' });
            } else {
                var token = jwt.sign({ id: user._id, id_user: user.id_user, name: user.name, email: user.email, role: user.role }, secret, { expiresIn: '24h' });
                res.json({ status: 200, success: true, message: 'User authenticated!', token: token });
            }
        }
    });
}

//Route Activation Account
//Must be set in Angular route return $http.put('/activate.) because backend cannot declare it in HTML
var activateAccount = function(req, res) {
    User.findOne({ temporarytoken: req.params.token }, function(err, user) {
        if (err) throw err;
        var token = req.params.token;
        jwt.verify(token, secret, function(err, decoded) {
            if (err) {
                res.json({ success: false, message: 'Activation link has expired.' });
            } else if (!user) {
                res.json({ success: false, message: 'Activation link has expired.' });
            } else {
                user.temporarytoken = false;
                user.active = true;
                user.save(function(err) {
                    if (err) {
                        console.log(err);
                    } else {
                        var email = {
                            from: 'Travinesia, travinesia@localhost.com',
                            to: user.email,
                            subject: 'Travinesia Account Activated',
                            text: 'Hello ' + user.name + ', Your account has been successfully activated!',
                            html: 'Hello<strong> ' + user.name + '</strong>,<br><br>Your account has been successfully activated!'
                        };

                        client.sendMail(email, function(err, info) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log('Message sent: ' + info.response);
                            }
                        });
                        res.json({ success: true, message: 'Account activated!' });
                    }
                });
            }
        });
    });
}


//Route Forgot Password
//Go to page Input New Password /v1/user/reset/:token
var forgotPassword = function(req, res) {
    User.findOne({ email: req.body.email }).select('email resettoken name').exec(function(err, user) {
        if (err) throw err;
        if (!user) {
            res.json({ success: false, message: 'E-mail was not found' });
        } else {
            user.resettoken = jwt.sign({ id: user._id, id_user: user.id_user, name: user.name, email: user.email, role: user.role }, secret, { expiresIn: '24h' });
            user.save(function(err) {
                if (err) {
                    res.json({ success: false, message: err });
                } else {
                    var email = {
                        from: 'Travinesia, travinesia@localhost.com',
                        to: user.email,
                        subject: 'Travinesia Reset Password Request',
                        text: 'Hello ' + user.name + ', You recently request a password reset link. Please click on the link below to reset your password: http://travinesia.com:3000/v1/user/resetpassword/' + user.resettoken,
                        html: 'Hello<strong> ' + user.name + '</strong>,<br><br>You recently request a password reset link. Please click on the link below to reset your password:<br><br><a href="http://travinesia.com:3000/v1/user/resetpassword/' + user.resettoken + '">http://travinesia.com:3000/v1/user/resetpassword/</a>'
                    };

                    client.sendMail(email, function(err, info) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log('Message sent: ' + info.response);
                        }
                    });
                    res.json({ success: true, message: 'Please check your e-mail for password reset link' });
                }
            });
        }
    });
}


//Go to page Input New Password /v1/user/resetpassword/:token
var getPassword = function(req, res) {
    User.findOne({ resettoken: req.params.token }).select().exec(function(err, user) {
        if (err) throw err;
        var token = req.params.token;

        //verify token
        jwt.verify(token, secret, function(err, decoded) {
            if (err) {
                res.json({ success: false, message: 'Password link has expired' });
            } else {
                if (!user) {
                    res.json({ success: false, message: 'Password link has expired' });
                } else {
                    res.json({ success: true, message: user.email });
                }
            }
        });
    });
}

//Save new password
var savePassword = function(req, res) {
    User.findOne({ email: req.body.email }).select('name email password resettoken').exec(function(err, user) {
        if (err) throw err;
        if (req.body.password == null || req.body.password == '') {
            res.json({ success: true, message: 'Password not provided' });
        } else {
            if (user.resettoken === true) {
                user.password = req.body.password;
                user.resettoken = false;
                user.save(function(err) {
                    if (err) {
                        res.json({ success: false, message: err });
                    } else {
                        var email = {
                            from: 'Travinesia, travinesia@localhost.com',
                            to: user.email,
                            subject: 'Travinesia Password has ben reset',
                            text: 'Hello ' + user.name + ', This e-mail is to notify you that your password was recently reset at travinesia.com',
                            html: 'Hello<strong> ' + user.name + '</strong>,<br><br>This e-mail is to notify you that your password was recently reset at travinesia.com'
                        };

                        client.sendMail(email, function(err, info) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log('Message sent: ' + info.response);
                            }
                        });
                        res.json({ success: true, message: 'Password has been reset!' });
                    }


                });
            } else {
                res.json({ status: 400, success: false, message: 'Cannot Save Password' });
            }
        }
    });
}

// router.post('/auth', function(req, res){
//     res.send(req.decoded);
// });
module.exports = {
    register: register,
    checkEmail: checkemail,
    authenticate: authenticate,
    activate: activateAccount,
    forgot: forgotPassword,
    getForgotPassword: getPassword,
    save: savePassword
}