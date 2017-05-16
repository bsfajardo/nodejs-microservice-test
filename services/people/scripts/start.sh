#!/bin/bash
/usr/bin/mongod --fork --dbpath=/data/db --logpath /var/log/mongod.log
npm start