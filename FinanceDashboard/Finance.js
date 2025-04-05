const mongoose = require('mongoose');

const financeSchema = new mongoose.Schema({
  type: { type: String, required: true }, // 'billing', 'insurance', etc.
  date: { type: Date, default: Date.now },
  amount: { type: Number, required: true },
  description: String,
  status: { type: String, default: 'pending' }, // e.g. paid, approved, pending
  dueDate: Date // for overdue tracking
});

module.exports = mongoose.model('Finance', financeSchema);
