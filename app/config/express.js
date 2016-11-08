const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

module.exports = function (app, passport) {
  app.use(cors());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  app.set('jwtsecret', '78yvn4s87ty4byvs87by83bvk37b8y4tsv');
}

// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

//   next();
// });
