const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: Number,
  gender: String,
  contact: String,
  address: String,
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  medicalHistory: [String],
  createdAt: { type: Date, default: Date.now },
  });
  const Patient = mongoose.model('Patient', patientSchema);
  module.exports = Patient;