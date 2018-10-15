var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var titlize = require('mongoose-title-case');
var validate = require('mongoose-validator');
var autoIncrement = require('mongoose-auto-increment');
var connection = mongoose.createConnection("mongodb://localhost/backendtravinesia");

autoIncrement.initialize(connection);

var nameValidator = [
    validate({
        validator: 'isLength',
        arguments: [3, 30],
        message: 'Status: 400, message: Must be at least 3 characters, max 30, no special characters or numbers, must have space between name.'
    })
];

var emailValidator = [
    validate({
        validator: 'matches',
        arguments: /^[a-zA-Z0-9_.+-]+@(?:(?:[a-zA-Z0-9-]+\.)?[a-zA-Z]+\.)?(gmail|mail|yahoo|outlook|hotmail|live|rocketmail|live|aol)\.?(co.id|com|co)$/,
        message: 'Status: 400, message: Is not a valid E-mail'
    }),
    validate({
        validator: 'isLength',
        arguments: [3, 25],
        message: 'Status: 400, message: Email should be between {ARGS[0]} and {ARGS[1]} characters'
    })
];

var passwordValidator = [
    validate({
        validator: 'isLength',
        arguments: [8, 35],
        message: 'Status: 400, message: Password must be at least 8 characters'
    })
];

var telephoneValidator = [
    validate({
        validator: 'isNumeric',
        //arguments : [8, 35],
        message: 'Status: 400, message: Must be number'
    })
];

var no_identitasValidator = [
    validate({
        validator: 'isLength',
        arguments: [3, 20],
        message: 'Status: 400, message: No Identitas should be between {ARGS[0]} and {ARGS[1]} characters'
    })
];


var UserSchema = new Schema({
    name: { type: String, required: true, validate: nameValidator },
    telephone: { type: String, validate: telephoneValidator },
    email: { type: String, lowercase: true, unique: true, validate: emailValidator },
    //email:{ type: String, lowercase: true, unique: true },
    password: { type: String, required: true, select: false, validate: passwordValidator },
    gender: { type: String, default: null },
    birthday: { type: Date, default: null },
    identity_number: { type: String, validate: no_identitasValidator },
    photo: { type: String, },
    role: { type: Number, default: 1 },
    active: { type: Boolean, required: true, default: false },
    flag_provider: { type: Boolean, default: false },
    temporarytoken: { type: String, required: true },
    resettoken: { type: String, required: false },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

UserSchema.pre('save', function(next) {
    var user = this;

    if (!user.isModified('password')) return next();

    bcrypt.hash(user.password, null, null, function(err, hash) {
        if (err) return next(err);
        user.password = hash;
        next();
    });
});


UserSchema.plugin(titlize, {
    paths: ['name']
});

UserSchema.methods.comparePassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

UserSchema.plugin(autoIncrement.plugin, { model: 'User', field: 'id_user', startAt: 1 });

module.exports = mongoose.model('User', UserSchema);