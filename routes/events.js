require("dotenv").config();

const express = require("express");
const router = express.Router();
const { MongoClient, ObjectId } = require("mongodb");

const client = new MongoClient(process.env.DATABASE_URL);

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

router.get("/holidays", async (req, res) => {
  try {
    const db = client.db();
    const collection = db.collection(process.env.events);

    const result = await collection.find({ display: "background" }).toArray();

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
    rrule: {
      dtstart: req.body.start,
      freq: "weekly",
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

router.post("/holidays", async (req, res) => {
  const event = {
    start: req.body.start,
    end: req.body.end,
    display: "background",
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

router.patch("/:id", async (req, res) => {
  try {
    const db = client.db();
    const collection = db.collection(process.env.events);

    const result = await collection.updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $set: {
          "rrule.dtstart": req.body.start,
        },
      }
    );

    res.status(200).json(result);
  } catch (err) {}
});

module.exports = router;
