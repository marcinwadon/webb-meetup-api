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

exports.me = async(function* (req, res) {
  res.json({ 
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    } 
  }); 
});

exports.list = async(function* (req, res) {
  if (req.profile) {
    return res.json({ user: { name: req.profile.name } });
  }

  const users = yield User
    .find()
    .select('name')
    .exec();

  res.json({ users });
});

exports.register = async(function* (req, res) {
  const user = new User(req.body);
  user.role = 'ROLE_USER';

  try {
    yield user.save();

    const token = generateToken(user, req);

    res.json({
      user: {
        id: user._id,
        role: user.role
      },
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
    select: 'name email role presentation hashed_password salt'
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

    const token = generateToken(user, req);

    res.json({
      user: {
        id: user._id,
        role: user.role
      },
      token: token
    });
  });
});

exports.changePassword = async(function* (req, res) {
  if (!req.user.authenticate(req.body.oldPassword)) {
    return res.status(400).json({ error: 'Bad password' });
  }

  req.user.password = req.body.password;
  
  try {
    yield req.user.save();
  } catch (err) {
    return res.status(500).json({ error: err });
  }

  return res.status(204).json({});
});

function generateToken(user, req) {
  return jwt.sign({ id: user._id.toString() }, req.app.get('jwtsecret'), { 
    expiresIn: 60*60*24
  });
}
