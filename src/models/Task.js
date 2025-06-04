const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  listId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "List",
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
  },
  priorityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Priority",
    required: false
  },
  dueDate: {
    type: Date,
    required: false
  },
  isCompleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Create indexes
taskSchema.index({ listId: 1 });
taskSchema.index({ priorityId: 1 });
taskSchema.index({ createdAt: 1 });

module.exports = mongoose.model("Task", taskSchema);
