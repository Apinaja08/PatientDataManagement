const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");

// GET doctor availability — /appointments/availability?doctor=Dr.Smith&date=2026-03-10
router.get("/availability", async (req, res) => {
  const { doctor, date } = req.query;
  if (!doctor || !date)
    return res.status(400).json({ message: "doctor and date query params are required" });

  try {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const existing = await Appointment.find({
      doctor,
      status: "Scheduled",
      date: { $gte: start, $lte: end },
    }).populate("patient", "name contact");

    if (existing.length === 0) {
      return res.json({ available: true, message: `${doctor} is available on ${date}` });
    }
    return res.json({
      available: false,
      message: `${doctor} has ${existing.length} appointment(s) on ${date}`,
      appointments: existing,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all appointments
router.get("/", async (req, res) => {
  try {
    const appointments = await Appointment.find().populate("patient", "name contact");
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET a single appointment
router.get("/:id", async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate("patient", "name contact");
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create an appointment
router.post("/", async (req, res) => {
  const appointment = new Appointment(req.body);
  try {
    const newAppointment = await appointment.save();
    res.status(201).json(newAppointment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update an appointment
router.put("/:id", async (req, res) => {
  try {
    const updated = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: "Appointment not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE an appointment
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Appointment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Appointment not found" });
    res.json({ message: "Appointment deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH cancel an appointment
router.patch("/:id/cancel", async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    if (appointment.status === "Cancelled")
      return res.status(400).json({ message: "Appointment is already cancelled" });

    appointment.status = "Cancelled";
    await appointment.save();
    res.json({ message: "Appointment cancelled successfully", appointment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
