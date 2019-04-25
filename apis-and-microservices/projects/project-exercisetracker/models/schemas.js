const { Schema } = require('mongoose');
const shortid = require('shortid');

const userSchema = new Schema({
  username: { type: String, unique: true, required: true },
  _id: { type: String, default: shortid.generate }
});

const exerciseSchema = new Schema({
  userId: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

module.exports = {
  userSchema,
  exerciseSchema
};
