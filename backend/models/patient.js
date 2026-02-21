const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },  // used to auto-update age every year
    age: { type: Number },                         // auto-calculated by cron job
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    contact: { type: String, required: true },
    address: { type: String },
    medicalHistory: { type: String },
  },
  { timestamps: true }
);

// Calculate age from dateOfBirth before saving
patientSchema.pre("save", async function () {
  if (this.dateOfBirth) {
    const today = new Date();
    const dob = new Date(this.dateOfBirth);
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    this.age = age;
  }
});

module.exports = mongoose.model("Patient", patientSchema);
