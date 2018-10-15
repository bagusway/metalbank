var User = require('../models/user');
var Provider = require('../models/provider');
var Trip = require('../models/trip');
var Type = require('../models/type_trip');
var Discussion = require('../models/discussion/discussion');
var Comment = require('../models/discussion/comment');
var jwt = require('jsonwebtoken');
var { secret } = require('../config/index');
var ImageSaver = require('image-saver-nodejs/lib');
var multer = require('multer');
var fs = require('fs');
var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');
var hbs = require('nodemailer-express-handlebars');

var options = {
    auth: {
        api_user: 'travinesia',
        api_key: 'travinesia123'
    }
}

var client = nodemailer.createTransport(sgTransport(options));

client.use('compile', hbs({
    viewPath: './views/email_provider/',
    extName: '.hbs'
}));

var postDiscussion = function(req, res) {
    User.findById(req.user_id, function(err, user) {
        if (!user) {
            res.send({ status: 404, message: 'User Not Found' });
        } else if (err) {
            res.send({ status: 404, message: 'Error' });
        } else {
            if (user.role == 1 || user.role == 2) {
                var id_trip = req.params.id_trip;
                Trip.findById(id_trip, function(err, trip) {
                    if (err) {
                        res.send({ status: 404, message: 'Trip Not Found' });
                    } else if (!trip) {
                        res.send({ status: 404, message: 'Trip Not Found' });
                    } else {
                        var discussion = new Discussion();
                        discussion.id_trip = id_trip;
                        discussion.id_user = req.id_user;
                        discussion.content = req.body.content;
                        discussion.save(function(err, discussion) {
                            if (err) {
                                res.status(500).send(err)
                            } else {
                                User.findOne({ id_user: req.id_user }).select('name photo email').exec(function(err, user) {
                                    if (!user) {
                                        res.send({ status: 404, message: 'User Not Found' });
                                    } else {
                                        //var template = fs.readFileSync("./views/email_provider/email_diskusi.html", "utf8");
                                        var email = {
                                            from: 'Travinesia, travinesia@localhost.com',
                                            to: user.email,
                                            subject: 'Discussion Added',
                                            template: 'diskusi_compiled',
                                            context: {
                                                username: user.name
                                            }
                                            //text: 'Hello ' + user.name + ', Thankyou for registering at travinesia.com. Please click on the following link below to complote your activation: http://travinesia.com:3000/v1/user/activate/' + user.temporarytoken,

                                        };

                                        client.sendMail(email, function(err, info) {
                                            if (err) {
                                                console.log(err);
                                            } else {
                                                console.log('Message sent: ' + info.response);
                                            }
                                        });
                                        res.send({ status: 200, message: 'Success added the discussion', data: user, discussion: discussion.content, created: discussion.created_at });
                                    }
                                });
                            }
                        });
                    }
                });
            } else {
                res.json({ status: 403, message: "Forbidden access for this user", token: req.token });
            }
        }
    });
}

var editDiscussion = function(req, res) {
    User.findById(req.user_id, function(err, user) {
        if (!user) {
            res.send({ status: 404, message: 'User Not Found' });
        } else if (err) {
            res.send({ status: 404, message: 'Error' });
        } else {
            if (user.role == 1 || user.role == 2) {
                Discussion.findById(req.params.id, function(err, discussion) {
                    if (!discussion) {
                        res.send({ status: 404, message: 'Discussion not Found!' });
                    } else if (discussion.id_user != req.id_user) {
                        res.send({ status: 404, message: 'Discussion not Found!' });
                    } else {
                        discussion.id_trip = discussion.id_trip;
                        discussion.id_user = req.id_user;
                        discussion.content = req.body.content || discussion.content;
                        discussion.save(function(err, discussion) {
                            if (err) {
                                res.status(500).send(err)
                            } else {
                                User.findOne({ _id: req.user_id }).select('name photo').exec(function(err, user) {
                                    if (!user) {
                                        res.send({ status: 404, message: 'User Not Found' });
                                    } else {
                                        res.send({ status: 200, message: 'Discussion edited!', data: user, discussion: discussion.content, updated: discussion.updated_at });
                                    }
                                });
                            }
                        });
                    }
                });
            } else {
                res.json({ status: 403, message: "Forbidden access for this user", token: req.token });
            }

        }
    });

}

var deleteDiscussion = function(req, res) {
    User.findById(req.user_id, function(err, user) {
        if (!user) {
            res.send({ status: 404, message: 'User Not Found' });
        } else if (err) {
            res.send({ status: 404, message: 'Error' });
        } else {
            if (user.role == 1 || user.role == 2) {
                var discussion = req.params.id;
                Discussion.findByIdAndRemove(discussion, function(err, removediscussion) {
                    if (!removediscussion) {
                        res.send({ status: 404, message: 'Discussion not found' });
                    } else if (removediscussion.id_user != req.id_user) {
                        res.send({ status: 404, message: 'Error in deleting discussion' });
                    } else {
                        Comment.remove({ discussion: removediscussion._id }, function(err, comment) {
                            if (!comment) {
                                res.send({ status: 404, message: 'Comment not found' });
                            } else if (err) {
                                res.send({ status: 404, message: 'Comment not found' });
                            } else {
                                res.send({ status: 200, message: 'Discussion deleted!', data: comment });
                            }
                        });
                    }
                });
            } else {
                res.json({ status: 403, message: "Forbidden access for this user", token: req.token });
            }
        }
    });
}

var getAllDiscussion = function(req, res) {
    Discussion.find({ 'id_trip': req.params.id }, function(err, discussion) {
        if (err) {
            res.json({ status: 402, message: err, data: "" });
        } else {
            res.json({ status: 200, message: "succes get all discussion", data: discussion });
        }
    })
}

var postComment = function(req, res) {
    User.findById(req.user_id, function(err, user) {
        if (!user) {
            res.send({ status: 404, message: 'User Not Found' });
        } else if (err) {
            res.send({ status: 404, message: 'Error' });
        } else {
            if (user.role == 1 || user.role == 2) {
                Discussion.findOne({ 'id_discussion': req.params.id }, function(err, discussion) {
                    if (!discussion) {
                        res.send({ status: 404, message: 'Discussion Not Found' });
                    } else {
                        var trip_discussion = discussion.id_trip;
                        var comment = new Comment;
                        comment.id_trip = discussion.id_trip;
                        comment.id_user = req.id_user;
                        comment.comment = req.body.comment;
                        discussion.comments.push(comment);
                        discussion.save();
                        comment.discussion = discussion;
                        comment.save(function(err, Comment) {
                            if (err) {
                                res.status(500).send(err)
                            } else {
                                Provider.findOne({ id_user: req.id_user }).select('travel_name logo').exec(function(err, provider) {
                                    if (!provider) {
                                        res.send({ status: 404, message: 'Provider Not Found' });
                                    } else {
                                        Trip.findById(discussion.id_trip, function(err, trip) {
                                            if (!trip) {
                                                res.send({ status: 404, message: 'Trip Not Found' });
                                            } else if (provider._id.equals(trip.provider)) {
                                                res.send({ status: 200, message: 'Comment added successfully', data: provider, comment: comment.comment, created: comment.created_at });
                                            } else {
                                                User.findOne({ id_user: req.id_user }).select('name photo').exec(function(err, user) {
                                                    if (!user) {
                                                        res.send({ status: 404, message: 'User Not Found' });
                                                    } else {
                                                        res.send({ status: 200, message: 'Comment added successfully', data: user, comment: comment.comment, created: comment.created_at });
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            } else {
                res.json({ status: 403, message: "Forbidden access for this user", token: req.token });
            }
        }
    });
}

var editComment = function(req, res) {
    User.findById(req.user_id, function(err, user) {
        if (!user) {
            res.send({ status: 404, message: 'User Not Found' });
        } else if (err) {
            res.send({ status: 404, message: 'Error' });
        } else {
            if (user.role == 1 || user.role == 2) {
                Discussion.findOne({ id_discussion: req.body.id_discussion }, function(err, discussion) {
                    if (!discussion) {
                        res.send({ status: 404, message: 'Discussion Not Found' });
                    } else {
                        Comment.findById(req.params.id, function(err, comment) {
                            if (!comment) {
                                res.send({ status: 404, message: 'Comment not Found!' });
                            } else if (comment.id_user != req.id_user) {
                                res.send({ status: 404, message: 'Comment not Found!' });
                            } else {
                                var trip_discussion = discussion.id_trip;
                                comment.id_trip = discussion.id_trip;
                                comment.id_user = req.id_user;
                                comment.comment = req.body.comment || comment.comment;
                                comment.save(function(err, Comment) {
                                    if (err) {
                                        res.status(500).send(err)
                                    } else {
                                        Provider.findOne({ id_user: req.id_user }).select('travel_name logo').exec(function(err, provider) {
                                            if (!provider) {
                                                res.send({ status: 404, message: 'Provider Not Found' });
                                            } else {
                                                Trip.findById(discussion.id_trip, function(err, trip) {
                                                    if (!trip) {
                                                        res.send({ status: 404, message: 'Trip Not Found' });
                                                    } else if (provider._id.equals(trip.provider)) {
                                                        res.send({ status: 200, message: 'Comment successfully changed', data: provider, comment: comment.comment, updated: comment.updated_at });
                                                    } else {
                                                        User.findOne({ id_user: req.id_user }).select('name photo').exec(function(err, user) {
                                                            if (!user) {
                                                                res.send({ status: 404, message: 'User Not Found' });
                                                            } else {
                                                                res.send({ status: 200, message: 'Comment successfully changed', data: user, comment: comment.comment, updated: comment.updated_at });
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });

                    }
                });
            } else {
                res.json({ status: 403, message: "Forbidden access for this user", token: req.token });
            }
        }
    });
}

var deleteComment = function(req, res) {
    User.findById(req.user_id, function(err, user) {
        if (!user) {
            res.send({ status: 404, message: 'User Not Found' });
        } else {
            var id_comment = req.params.id;
            Comment.findById(id_comment, function(err, searchcomment) {
                if (!searchcomment) {
                    res.send({ status: 404, message: 'Comment not Found!' });
                } else if (searchcomment.id_user == req.id_user) {
                    Comment.findByIdAndRemove(id_comment, function(err, removecomment) {
                        if (!removecomment) {
                            res.send({ status: 404, message: 'Comment not found!' });
                        } else if (err) {
                            res.send({ status: 404, message: 'Error in deleting comment' });
                        } else {
                            Discussion.findOneAndUpdate({ id_discussion: req.params.id_discussion }, { $pull: { "comments": id_comment } }, function(err, discussion) {
                                if (err) {
                                    return res.status(500).json({ 'error': 'Error in deleting comment' });
                                } else {
                                    res.json({ status: 204, message: "Comment Removed!" });
                                }
                            });
                        }
                    });
                } else {
                    res.send({ status: 404, message: 'Comment not Found!' });
                }
            });
        }
    });
}

var getCommentDiscussion = function(req, res) {
    Comment.find({ 'id_trip': req.params.id }, function(err, comment) {
        if (err) {
            res.json({ status: 402, message: err, data: "" });
        } else {
            res.json({ status: 200, message: "succes get all comment", data: comment });
        }
    })
}

module.exports = {
    postDiscussion: postDiscussion,
    editDiscussion: editDiscussion,
    deleteDiscussion: deleteDiscussion,
    getAllDiscussion: getAllDiscussion,
    postComment: postComment,
    editComment: editComment,
    deleteComment: deleteComment,
    getCommentDiscussion: getCommentDiscussion
}