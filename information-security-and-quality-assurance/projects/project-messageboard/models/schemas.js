const { Schema } = require('mongoose');

const threadSchema = new Schema(
  {
    text: { type: String, required: true },
    reported: { type: Boolean, default: false },
    delete_password: { type: String, required: true },
    replies: {
      type: [{
        text: { type: String, required: true },
        created_on: { type: Date, default: Date.now },
        delete_password: { type: String, required: true },
        reported: { type: Boolean, default: false }
      }],
      default: []
    }
  },
  {
    timestamps: {
      createdAt: 'created_on',
      updatedAt : 'bumped_on'
    }
  }
);

module.exports = { threadSchema };
