const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

module.exports = function (app, passport) {
  app.use(express.static('public'));
  app.use(cors());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  app.set('jwtsecret', '78yvn4s87ty4byvs87by83bvk37b8y4tsv');
}
