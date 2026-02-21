const cron = require("node-cron");
const Patient = require("../models/patient");

// Runs every day at midnight — updates age for patients whose birthday is today
const startAgeUpdateJob = () => {
  cron.schedule("0 0 * * *", async () => {
    console.log("[CRON] Running daily age update job...");
    try {
      const today = new Date();
      const month = today.getMonth() + 1; // 1-12
      const day = today.getDate();

      // Find patients whose birthday is today (any year)
      const patients = await Patient.find({
        $expr: {
          $and: [
            { $eq: [{ $month: "$dateOfBirth" }, month] },
            { $eq: [{ $dayOfMonth: "$dateOfBirth" }, day] },
          ],
        },
      });

      for (const patient of patients) {
        const dob = new Date(patient.dateOfBirth);
        let age = today.getFullYear() - dob.getFullYear();
        patient.age = age;
        await patient.save();
        console.log(`[CRON] Updated age for patient: ${patient.name} → ${age}`);
      }

      console.log(`[CRON] Age update complete. ${patients.length} patient(s) updated.`);
    } catch (err) {
      console.error("[CRON] Age update job failed:", err.message);
    }
  });

  console.log("[CRON] Daily age update job scheduled (runs at midnight).");
};

module.exports = { startAgeUpdateJob };
