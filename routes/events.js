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
  let holidays = [...req.body.holidays];
  const exrule = holidays.map((element) => ({
    freq: "minutely",
    dtstart: new Date(element.start),
    until: new Date(element.end),
  }));

  const start = new Date(req.body.start);

  const rule = new RRule({
    freq: RRule.WEEKLY,
    dtstart: new Date(
      Date.UTC(
        start.getFullYear(),
        start.getMonth(),
        start.getDate(),
        start.getHours(),
        start.getMinutes(),
        0
      )
    ),
    count: req.body.interval === 1 ? 14 : 7,
    interval: req.body.interval,
  });

  const dates = rule.all();

  const lastDate = dates[dates.length - 1];

  let countIncreaser = 0;

  holidays.forEach((element) => {
    if (new Date(element.start) > start && new Date(element.end) < lastDate) {
      countIncreaser = Math.round(
        (new Date(element.end).getTime() - new Date(element.start).getTime()) /
          1000 /
          60 /
          60 /
          24 /
          7
      );
    }
  });

  const event = {
    allDay: false,
    title: `${req.body.subject}(${
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
      dtstart: req.body.start,
      count:
        req.body.interval === 1
          ? 14 + countIncreaser
          : 7 + Math.round(countIncreaser / 2),
      interval: req.body.interval,
    },
    exrule: [...exrule],
    duration: `0${req.body.duration}:00`,
    extendedProps: {
      teacher: req.body.teacher,
      students: req.body.students,
      classroom: req.body.classroom,
      year: req.body.year,
      series: req.body.series,
    },
  };

  try {
    const db = client.db();
    const collection = db.collection(process.env.events);

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

router.patch("/:id", async (req, res) => {
  try {
    const db = client.db();
    const collection = db.collection(process.env.events);

    let oldStart = new Date(req.body.oldStart);
    let start = new Date(req.body.start);
    let initialStart = new Date(req.body.initialStart);

    initialStart.setTime(initialStart.getTime() - (oldStart - start));

    const result = await collection.updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $set: {
          "rrule.dtstart": initialStart,
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
