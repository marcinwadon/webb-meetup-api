const jwt = require('jsonwebtoken');

const mongoose = require('mongoose');
const User = mongoose.model('User');

exports.requiresLogin = (req, res, next) => {  
  const authorizationHeader = req.headers['authorization'] || '';
  const token = (authorizationHeader.indexOf('Bearer ') > -1) ? authorizationHeader.split(' ')[1] : '';

  if (token) {
    jwt.verify(token, req.app.get('jwtsecret'), function (err, decoded) {
      if (err) {
        return res.status(403).json({ error: 'Invalid token.' });
      }

      User.find({ _id: decoded.id }, function (err, user) {
        if (err) {
          return res.status(403).json({ error: 'User not exists.' });
        }

        req.user = user[0];

        return next();
      });
    });
  } else {
    return res.status(403).json({ error: 'No token provided.' });
  }
};

exports.requiresRole = (role) => (req, res, next) => {
  if (req.user && role.indexOf(req.user.role) > -1) {
    return next();
  }

  return res.status(403).json({});
};

exports.couldLogin = (req, res, next) => {
  const authorizationHeader = req.headers['authorization'] || '';
  const token = (authorizationHeader.indexOf('Bearer ') > -1) ? authorizationHeader.split(' ')[1] : '';

  if (token) {
    jwt.verify(token, req.app.get('jwtsecret'), function (err, decoded) {
      if (err) {       
        req.user = new User();
        user._id = null;
        
        return next();
      }

      User.find({ _id: decoded.id }, function (err, user) {
        if (err) {
          req.user = new User();
          user._id = null;

          return next();
        }

        req.user = user[0];

        return next();
      });
    });
  } else {
    req.user = new User();
    
    return next();
  }  
}
