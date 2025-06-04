const mongoose = require("mongoose");

const listSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

// Create indexes
listSchema.index({ userId: 1 });
listSchema.index({ createdAt: 1 });

module.exports = mongoose.model("List", listSchema);
