require("dotenv").config();

const express = require("express");
const router = express.Router();
const { MongoClient, ObjectId } = require("mongodb");

const client = new MongoClient(process.env.DATABASE_URL);

router.get("/", async (req, res) => {
  try {
    const db = client.db();
    const collection = db.collection(process.env.teachers);

    const result = await collection.find().toArray();

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const db = client.db();
    const collection = db.collection(process.env.teachers);

    const result = await collection.findOne({
      _id: new ObjectId(req.params.id),
    });
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  if (req.body.name === "" || req.body.title === "" || req.body.email === "") {
    return res.json({ message: "Câmpurile marcate cu roșu sunt obligtorii" });
  }
  const teacher = {
    name: req.body.name,
    title: req.body.title,
    email: req.body.email,
    hasPreferences: req.body.hasPreferences,
    preferences: req.body.preferences,
  };

  try {
    const db = client.db();
    const collection = db.collection(process.env.teachers);
    const match = await collection.findOne({ name: teacher.name });
    if (match !== null) {
      return res.json({ message: "Cadrul didactic există deja" });
    }
    const result = await collection.insertOne(teacher);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const db = client.db();
    const collection = db.collection(process.env.teachers);

    const result = await collection.deleteOne({
      _id: new ObjectId(req.params.id),
    });

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:id", async (req, res) => {
  if (req.body.name === "" || req.body.title === "" || req.body.email === "") {
    return res.json({ message: "Câmpurile marcate cu roșu sunt obligtorii" });
  }

  try {
    const db = client.db();
    const collection = db.collection(process.env.teachers);
    const eventsCollection = db.collection(process.env.events);

    const result = await collection.updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $set: {
          name: req.body.name,
          title: req.body.title,
          email: req.body.email,
          hasPreferences: req.body.hasPreferences,
          preferences: req.body.preferences,
        },
      }
    );

    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
