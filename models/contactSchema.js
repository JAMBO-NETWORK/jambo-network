'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ContactSchema = new Schema({
  etherentAddress: {
    type: String,
    required: true,
  },
  twitterAccount: {
    type: String,
    required: true,
  },
  telegram: {
    type: String,
    required: true,
  },
  twitterRepostUrl: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
  },
});

module.exports = ContactSchema;
