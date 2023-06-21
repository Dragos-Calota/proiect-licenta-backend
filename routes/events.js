require("dotenv").config();

const express = require("express");
const router = express.Router();
const { MongoClient, ObjectId } = require("mongodb");

const client = new MongoClient(process.env.DATABASE_URL);

const RRule = require("rrule").RRule;

router.get("/", async (req, res) => {
  try {
    const db = client.db();
    const collection = db.collection(process.env.events);

    const result = await collection.find().toArray();

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const db = client.db();
    const collection = db.collection(process.env.events);

    const result = await collection.findOne({
      _id: new ObjectId(req.params.id),
    });
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  const start = new Date(req.body.start);

  const rule = new RRule({
    freq: RRule.WEEKLY,
    dtstart: start,
    count: req.body.interval === 1 ? 14 : 7,
    interval: req.body.interval,
  });

  const dates = rule.all();

  const event = {
    allDay: false,
    title: `${req.body.subject.name}(${
      req.body.type === "course"
        ? "curs"
        : req.body.type === "seminar"
        ? "seminar"
        : req.body.type === "lab"
        ? "laborator"
        : req.body.type === "project"
        ? "proiect"
        : null
    })`,
    backgroundColor:
      req.body.type === "course"
        ? "green"
        : req.body.type === "seminar"
        ? "blue"
        : req.body.type === "lab"
        ? "purple"
        : req.body.type === "project"
        ? "brown"
        : "",
    rrule: {
      freq: "weekly",
      dtstart: start,
      count: req.body.interval === 1 ? 14 : 7,
      interval: req.body.interval,
    },
    duration: `0${req.body.duration}:00`,
    extendedProps: {
      teacher: req.body.teacher,
      students: req.body.students,
      classroom: req.body.classroom,
      year: req.body.year,
      series: req.body.series,
      allDates: dates,
      subject: req.body.subject,
      interval: req.body.interval,
      end: new Date(
        new Date(start).setHours(start.getHours() + req.body.duration)
      ),
    },
  };

  try {
    const db = client.db();
    const collection = db.collection(process.env.events);
    const teachersCollection = db.collection(process.env.teachers);

    const teacher = await teachersCollection.findOne({
      _id: new ObjectId(event.extendedProps.teacher._id),
    });

    if (teacher.hasPreferences) {
      if (!teacher.preferences[start.getDay() - 1].isAvailable) {
        return res.json({
          text: "Intervalul orar nu corespunde cu preferințele cadrului didactic",
        });
      }

      if (teacher.preferences[start.getDay() - 1].isAvailable) {
        if (
          teacher.preferences[start.getDay() - 1].startHours >
            start.getUTCHours() ||
          teacher.preferences[start.getDay() - 1].endHours < start.getUTCHours()
        ) {
          return res.json({
            text: "Intervalul orar nu corespunde cu preferințele cadrului didactic",
          });
        }

        if (
          teacher.preferences[start.getDay() - 1].endHours >
          new Date(start).setUTCHours(start.getUTCHours() + event.duration)
        ) {
          return res.json({
            text: "Intervalul orar nu corespunde cu preferințele cadrului didactic",
          });
        }
      }
    }

    const teacherError = await collection
      .find({
        $or: [
          {
            "rrule.dtstart": {
              $gte: start,
              $lt: new Date(
                start.getTime() + req.body.duration * 60 * 60 * 1000
              ),
            },
          },
          {
            "extendedProps.end": {
              $gt: start,
              $lte: new Date(
                start.getTime() + req.body.duration * 60 * 60 * 1000
              ),
            },
          },
        ],

        "extendedProps.teacher._id": req.body.teacher._id,
      })
      .toArray();

    if (teacherError.length > 0)
      return res.json({ text: "Cadrul didactic este ocupat" });

    const classroomError = await collection
      .find({
        $or: [
          {
            "rrule.dtstart": {
              $gte: start,
              $lt: new Date(
                start.getTime() + req.body.duration * 60 * 60 * 1000
              ),
            },
          },
          {
            "extendedProps.end": {
              $gt: start,
              $lte: new Date(
                start.getTime() + req.body.duration * 60 * 60 * 1000
              ),
            },
          },
        ],
        "extendedProps.classroom._id": req.body.classroom._id,
      })
      .toArray();

    if (classroomError.length > 0)
      return res.json({ text: "Sala este ocupată" });

    const result = await collection.insertOne(event);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const db = client.db();
    const collection = db.collection(process.env.events);

    const result = await collection.deleteOne({
      _id: new ObjectId(req.params.id),
    });

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/classroom/:id", async (req, res) => {
  try {
    const db = client.db();
    const collection = db.collection(process.env.events);

    const result = await collection.deleteMany({
      "extendedProps.classroom._id": req.params.id,
    });

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/teacher/:id", async (req, res) => {
  try {
    const db = client.db();
    const collection = db.collection(process.env.events);

    const result = await collection.deleteMany({
      "extendedProps.teacher._id": req.params.id,
    });

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:id", async (req, res) => {
  let oldStart = new Date(req.body.oldStart);
  let start = new Date(req.body.start);
  let initialStart = new Date(req.body.initialStart);

  initialStart.setTime(initialStart.getTime() - (oldStart - start));

  const rule = new RRule({
    freq: RRule.WEEKLY,
    dtstart: new Date(initialStart),
    count: req.body.interval === 1 ? 14 : 7,
    interval: req.body.interval,
  });

  const dates = rule.all();
  try {
    const db = client.db();
    const collection = db.collection(process.env.events);
    const teachersCollection = db.collection(process.env.teachers);

    const teacher = await teachersCollection.findOne({
      _id: new ObjectId(req.body.teacherId),
    });

    if (teacher.hasPreferences) {
      if (!teacher.preferences[initialStart.getDay() - 1].isAvailable) {
        return res.json({
          text: "Intervalul orar nu corespunde cu preferințele cadrului didactic",
        });
      }

      if (teacher.preferences[initialStart.getDay() - 1].isAvailable) {
        if (
          teacher.preferences[initialStart.getDay() - 1].startHours >
            initialStart.getUTCHours() ||
          teacher.preferences[initialStart.getDay() - 1].endHours <
            initialStart.getUTCHours()
        ) {
          return res.json({
            text: "Intervalul orar nu corespunde cu preferințele cadrului didactic",
          });
        }

        if (
          teacher.preferences[initialStart.getDay() - 1].endHours >
          new Date(initialStart).setUTCHours(
            initialStart.getUTCHours() + req.body.duration
          )
        ) {
          return res.json({
            text: "Intervalul orar nu corespunde cu preferințele cadrului didactic",
          });
        }
      }
    }

    const teacherError = await collection
      .find({
        $or: [
          {
            "rrule.dtstart": {
              $gte: new Date(initialStart),
              $lt: new Date(
                initialStart.getTime() + req.body.duration * 60 * 60 * 1000
              ),
            },
          },
          {
            "extendedProps.end": {
              $gt: new Date(initialStart),
              $lte: new Date(
                initialStart.getTime() + req.body.duration * 60 * 60 * 1000
              ),
            },
          },
        ],
        _id: { $ne: new ObjectId(req.body.currentEventId) },
        "extendedProps.teacher._id": req.body.teacherId,
      })
      .toArray();

    if (teacherError.length > 0)
      return res.json({ text: "Cadrul didactic este ocupat" });

    const classroomError = await collection
      .find({
        $or: [
          {
            "rrule.dtstart": {
              $gte: new Date(initialStart),
              $lt: new Date(
                initialStart.getTime() + req.body.duration * 60 * 60 * 1000
              ),
            },
          },
          {
            "extendedProps.end": {
              $gt: new Date(initialStart),
              $lte: new Date(
                initialStart.getTime() + req.body.duration * 60 * 60 * 1000
              ),
            },
          },
        ],
        _id: { $ne: new ObjectId(req.body.currentEventId) },
        "extendedProps.classroom._id": req.body.classroomId,
      })
      .toArray();

    if (classroomError.length > 0)
      return res.json({ text: "Sala este ocupată" });

    const result = await collection.updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $set: {
          "rrule.dtstart": initialStart,
          "extendedProps.allDates": dates,
          "extendedProps.end": new Date(
            initialStart.getTime() + req.body.duration * 60 * 60 * 1000
          ),
        },
      }
    );

    res.status(200).json(result);
  } catch (err) {}
});

router.patch("/classroom/:id", async (req, res) => {
  try {
    const db = client.db();
    const collection = db.collection(process.env.events);

    const result = await collection.updateMany(
      { "extendedProps.classroom._id": req.params.id },
      {
        $set: {
          "extendedProps.classroom.room": req.body.room,
          "extendedProps.classroom.building": req.body.building,
          "extendedProps.classroom.floor": req.body.floor,
        },
      }
    );

    res.status(200).json(result);
  } catch (err) {}
});

module.exports = router;
