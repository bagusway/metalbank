// ssh bagusway@35.197.136.233  -i ~/Sites/id_rsa

var express = require('express');
var app = express();
var port = process.env.PORT || 3030;
var server = require('http').createServer(app);
// var io = require('socket.io').listen(server);
// var morgan = require('morgan');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var router = express.Router();
var routerAccess = express.Router();
var passport = require('passport');
// var social = require('./app/passport/passport')(app, passport);
var fs = require('fs');
var jwt = require('jsonwebtoken');
// var { secret } = require('./app/config/index');
var path = require('path');
// var tunnel = require('tunnel-ssh');
var dev = process.env.NODE_ENV !== 'production';
// var Chat = require('./app/models/chat');
var users = {};




app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// var userRouter = require('./app/routes/user');
// var userAccessRouter = require('./app/routes/userAccess');
// var providerRouter = require('./app/routes/provider');
// var attributeRouter = require('./app/routes/get');
// var paymentRouter = require('./app/routes/payment');
// var discussionRouter = require('./app/routes/discussion');
// var bookingRouter = require('./app/routes/booking');
// var lenderRouter    = require('./app/routes/lender');ß
var borrowerRouter  = require('./app/routes/borrower');


//view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, content-type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', true);
    // bypass option method
    if ('OPTIONS' == req.method) {
        res.send(200);
    } else {
        next();
    }
});



// app.use(morgan('dev'));
// app.use(bodyParser.json({ limit: '10mb' }));
// app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
//app.use(express.multipart());
    app.use('/v1/p2p/borrower/',borrowerRouter);
    // app.use('v1/lender/',lenderRouter);
// app.use('/v1/user', userRouter);
// app.use('/get', attributeRouter);
// app.use('/v1/user', paymentRouter);

// app.get('/chat', function(req, res) {
//     res.sendfile(__dirname + '/index.html');
// });

// io.sockets.on('connection', function(socket) {
//     var query = Chat.find({});
//     query.sort('-created').limit(8).exec(function(err, docs) {
//         if (err) throw err;
//         socket.emit('load old msgs', docs);
//     });
//     socket.on('new user', function(data, callback) {
//         if (data in users) {
//             callback(false);
//         } else {
//             callback(true);
//             socket.nickname = data;
//             users[socket.nickname] = socket;
//             updateNicknames();
//         }
//     });

//     function updateNicknames() {
//         io.sockets.emit('usernames', Object.keys(users));
//     }

//     socket.on('send message', function(data, callback) {
//         var msg = data.trim();
//         if (msg.substr(0, 3) === '/w ') {
//             msg = msg.substr(3);
//             var ind = msg.indexOf(' ');
//             if (ind !== -1) {
//                 var name = msg.substring(0, ind);
//                 var msg = msg.substring(ind + 1);
//                 if (name in users) {
//                     users[name].emit('whisper', { msg: msg, nick: socket.nickname });
//                     console.log('Whisper!');
//                 } else {
//                     callback('Error! enter a valid user');
//                 }
//             } else {
//                 callback('Error please enter a message for your whisper!');
//             }
//         } else {
//             var newMsg = new Chat({ msg: msg, nick: socket.nickname });
//             newMsg.save(function(err) {
//                 if (err) throw err;
//                 io.sockets.emit('new message', { msg: msg, nick: socket.nickname });
//             });

//         }
//     });

//     socket.on('disconnect', function(data) {
//         if (!socket.nickname) return;
//         delete users[socket.nickname];
//         updateNicknames();
//     });
// });


// --- JWT Validaltion ---
// app.use(function(req, res, next) {
//     if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
//         var token = req.headers.authorization.split(' ')[1];
//         jwt.verify(token, secret, function(err, decoded) {
//             if (err) {
//                 return res.json({ success: false, message: 'Failed to authenticate token.' });
//             } else {
//                 req.user_id = decoded.id;
//                 req.id_user = decoded.id_user;
//                 req.role = decoded.role;
//                 req.token = jwt.sign({
//                     id: decoded.id,
//                     id_user: decoded.id_user,
//                     name: decoded.name,
//                     email: decoded.email,
//                     role: decoded.role
//                 }, secret, { expiresIn: '24h' });
//                 next();
//             }
//         })
//     } else {
//         return res.status(400).json({ status: 400, message: 'Please send token' });
//     }
// });


// app.post('/auth', function(req, res){
//     res.send(req.user_id);
// });

        // app.use('/v1/user', userAccessRouter);
        // app.use('/v1/provider', providerRouter);
        // app.use('/v1/discussion', discussionRouter);
        // app.use('/v1/user/booking', bookingRouter);

mongoose.connect('mongodb://localhost:27017/metalbank', function(err) {
    if (err) {
        console.log('Not connected to the database: ' + err);
    } else {
        console.log('Successfully connected to MongoDB');
    }
});


server.listen(port, function() {
    console.log('Running the server on port ' + port);
});

// if (dev) {
//   const sshTunnelConfig = {
//     agent: process.env.SSH_AUTH_SOCK,
//     username: 'bagusway',
//     privateKey: require('fs').readFileSync('id_rsa'),
//     host: '35.185.191.82', //IP adress of VPS which is the SSH server
//     port: 22,
//     dstHost: '35.185.191.82',
//     dstPort: 27017, //or 27017 or something like that
//     localHost: '127.0.0.1',
//     localPort: 27017 //or anything else unused you want
//   };

//   tunnel(sshTunnelConfig, (error, server) => {
//     if(error) {
//         console.log("SSH connection error: ", error);
//     }

//   mongoose.connect(`mongodb://${Constants.bagusway}:${Constants.metalbankUser}@127.0.0.1:27017/${bagusway}`);
//  //important from above line is the part 127.0.0.1:50001 
//   });
// } else {
//   mongoose.connect('your-production-instance-uri'); //normal from before
// }

