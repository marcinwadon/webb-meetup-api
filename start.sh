#!/bin/bash

npm install
chown -R $USER_ID:root node_modules

npm start
