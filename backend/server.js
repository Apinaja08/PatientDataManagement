require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const { startAgeUpdateJob } = require("./utils/cronJobs");

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    startAgeUpdateJob(); // start the daily age update cron job
  })
  .catch(err => console.log(err));

app.use("/patients", require("./routes/patientRoutes"));
app.use("/appointments", require("./routes/appointmentRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});