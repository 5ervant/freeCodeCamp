const { Schema } = require('mongoose');

const urlSchema = new Schema({
  original: { type: String, required: true },
  short: { type: Number, default: 1 },
  created_at: { type: Date, default: Date.now }
});

module.exports = {
  urlSchema
};
