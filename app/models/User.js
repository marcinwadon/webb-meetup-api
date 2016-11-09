const mongoose = require('mongoose');
const crypto = require('crypto');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: { type: String, default: '' },
  email: { type: String, default: '' },
  presentation: { type: Boolean, default: false },
  hashed_password: { type: String, default: '' },
  salt: { type: String, default: '' },
  role: { type: String, default: 'ROLE_USER' }
});

UserSchema.set('toJSON', {
  transform: (doc, ret, options) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

UserSchema
.virtual('password')
.set(function (password) {
  this._password = password;
  this.salt = this.makeSalt();
  this.hashed_password = this.encryptPassword(password)
})
.get(function () {
  return this._password;
});

UserSchema
.path('name')
.validate((name) => name.length, 'Nazwa nie może być pusta');

UserSchema
.path('email')
.validate((email) => email.length, 'Email nie może być pusty');

UserSchema
.path('email')
.validate(function (email, fn) {
  const User = mongoose.model('User');

  if (this.isNew || this.isModified('email')) {
    User
    .find({ email })
    .exec((err, users) => {
      fn(!err && users.length === 0);
    });
  } else {
    fn(true);
  }
}, 'Taki email już istnieje');

UserSchema
.path('hashed_password')
.validate(function (hashed_password) {
  return hashed_password.length && this._password.length;
}, 'Hasło nie może być puste');

UserSchema
.pre('save', function (next) {
  if (!this.isNew) {
    return next();
  }

  if (!this.password || !this.password.length) {
    return next(new Error('Invalid password'));
  }
  
  next();
});

UserSchema.methods = {
  authenticate: function (plainText) {
    return this.encryptPassword(plainText) === this.hashed_password;
  },

  makeSalt: () => Math.round((new Date().valueOf() * Math.random())) + '',

  encryptPassword: function (password) {
    if (!password) {
      return '';
    }

    try {
      return crypto
        .createHmac('sha1', this.salt)
        .update(password)
        .digest('hex');
    } catch (err) {
      return '';
    }
  }
}

UserSchema.statics = {
  load: function (options, cb) {
    options.select = options.select || 'name role email presentation';
    return this.findOne(options.criteria)
      .select(options.select)
      .exec(cb);
  }
};

mongoose.model('User', UserSchema);
