const express = require("express");
const router = express.Router();
const Patient = require("../models/patient");

// GET all patients
router.get("/", async (req, res) => {
  try {
    const patients = await Patient.find();
    res.json(patients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET a single patient
router.get("/:id", async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create a patient
router.post("/", async (req, res) => {
  const patient = new Patient(req.body);
  try {
    const newPatient = await patient.save();
    res.status(201).json(newPatient);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update a patient
router.put("/:id", async (req, res) => {
  try {
    const updated = await Patient.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: "Patient not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a patient
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Patient.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Patient not found" });
    res.json({ message: "Patient deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH update address only
router.patch("/:id/address", async (req, res) => {
  const { address } = req.body;
  if (!address) return res.status(400).json({ message: "Address is required" });
  try {
    const updated = await Patient.findByIdAndUpdate(
      req.params.id,
      { address },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Patient not found" });
    res.json({ message: "Address updated successfully", patient: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
