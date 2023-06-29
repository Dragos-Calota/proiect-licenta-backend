const express = require("express");
const cors = require("cors");
const app = express();
const port = 3001;

app.use(express.json());
app.use(cors());

const teachersRoutes = require("./routes/teachers");
const subjectsRoutes = require("./routes/subjects");
const classroomsRoutes = require("./routes/classrooms");
const seriesRoutes = require("./routes/series");
const eventsRoutes = require("./routes/events");

app.use("/teachers", teachersRoutes);
app.use("/subjects", subjectsRoutes);
app.use("/classrooms", classroomsRoutes);
app.use("/series", seriesRoutes);
app.use("/events", eventsRoutes);

app.listen(port, () => console.log(`Server running on port ${port}`));
