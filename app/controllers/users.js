const mongoose = require('mongoose');
const { wrap: async } = require('co');
const jwt = require('jsonwebtoken');

const User = mongoose.model('User');

exports.load = async(function* (req, res, next, _id) {
  if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(404).json({ error: 'User not found.' });
  }
  const criteria = { _id };
  
  try {    
    req.profile = yield User.load({ criteria });

    if (!req.profile) {
      return res.status(404).json({ error: 'User not found.' });
    }
  } catch (err) {
    return next(err);
  }

  next();
});

exports.list = async(function* (req, res) {
  if (req.profile) {
    return res.json({ user: req.profile });
  }

  const users = yield User
    .find()
    .select('name email presentation')
    .exec();

  res.json({ users });
});

exports.register = async(function* (req, res) {
  const user = new User(req.body);

  try {
    yield user.save();

    const token = jwt.sign(user, req.app.get('jwtsecret'), { 
      expiresIn: 60*60*24
    });

    res.json({
      userId: user._id,
      token: token
    });

  } catch (err) {
    const errors = Object.keys(err.errors)
      .map(field => err.errors[field].message);

      res.status(400).json({ errors });
  }
});

exports.login = async(function* (req, res) {
  const options = {
    criteria: { email: req.body.email },
    select: 'name email presentation hashed_password salt'
  };

  User.load(options, function (err, user) {
    if (err) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    if (!user.authenticate(req.body.password)) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(user, req.app.get('jwtsecret'), { 
      expiresIn: 60*60*24
    });

    res.json({
      userId: user._id,
      token: token
    });
  });
});
