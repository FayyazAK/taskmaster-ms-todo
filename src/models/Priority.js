const mongoose = require("mongoose");

const prioritySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 50
  },
  level: {
    type: Number,
    required: true,
    unique: true
  }
}, {
  timestamps: false
});

// Create index on level field
prioritySchema.index({ level: 1 });

module.exports = mongoose.model("Priority", prioritySchema);
