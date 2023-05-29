require("dotenv").config();

const express = require("express");
const router = express.Router();
const { MongoClient, ObjectId } = require("mongodb");

const client = new MongoClient(process.env.DATABASE_URL);

router.get("/", async (req, res) => {
  try {
    const db = client.db();
    const collection = db.collection(process.env.classrooms);

    const result = await collection.find().toArray();

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const db = client.db();
    const collection = db.collection(process.env.classrooms);

    const result = await collection.findOne({
      _id: new ObjectId(req.params.id),
    });
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  if (
    req.body.room === "" ||
    req.body.building === "" ||
    req.body.floor === ""
  ) {
    return res.json({ message: "Câmpurile marcate cu roșu sunt obligtorii" });
  }
  const classroom = {
    room: req.body.room,
    building: req.body.building,
    floor: req.body.floor,
  };

  try {
    const db = client.db();
    const collection = db.collection(process.env.classrooms);

    const match = await collection.findOne({ room: classroom.room });
    if (match !== null) {
      return res.json({ message: "Sala există deja" });
    }

    const result = await collection.insertOne(classroom);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const db = client.db();
    const collection = db.collection(process.env.classrooms);

    const result = await collection.deleteOne({
      _id: new ObjectId(req.params.id),
    });

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:id", async (req, res) => {
  if (
    req.body.room === "" ||
    req.body.building === "" ||
    req.body.floor === ""
  ) {
    return res.json({ message: "Câmpurile marcate cu roșu sunt obligtorii" });
  }

  try {
    const db = client.db();
    const collection = db.collection(process.env.classrooms);

    const result = await collection.updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $set: {
          room: req.body.room,
          building: req.body.building,
          floor: req.body.floor,
        },
      }
    );

    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
