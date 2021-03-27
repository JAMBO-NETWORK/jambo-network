'use strict';

const mongoose = require('mongoose');

const Config = require('../configs');

try {
  mongoose.connect(`mongodb://${Config.Mongo.user}:${Config.Mongo.pwd}@${Config.Mongo.host}:${Config.Mongo.port}/${Config.Mongo.db}`, { useNewUrlParser: true });
} catch (error) {
  console.log(error);
}

mongoose.connection.on('error', err => {
  console.log(err);
});

// Models
const ContactSchema = require('./contactSchema');

exports.ContactSchema = mongoose.model('Contact', ContactSchema);
