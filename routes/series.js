require("dotenv").config();

const express = require("express");
const router = express.Router();
const { MongoClient, ObjectId } = require("mongodb");

const client = new MongoClient(process.env.DATABASE_URL);

router.get("/", async (req, res) => {
  try {
    const db = client.db();
    const collection = db.collection(process.env.series);

    const result = await collection.find().toArray();

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const db = client.db();
    const collection = db.collection(process.env.series);

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
    req.body.series === "" ||
    req.body.groupsNumberFirstYear < 1 ||
    req.body.semigroupsNumberFirstYear < 1 ||
    req.body.groupsNumberSecondYear < 1 ||
    req.body.semigroupsNumberSecondYear < 1 ||
    req.body.groupsNumberThirdYear < 1 ||
    req.body.semigroupsNumberThirdYear < 1 ||
    req.body.groupsNumberFourthYear < 1 ||
    req.body.semigroupsNumberFourthYear < 1
  ) {
    return res.json({ message: "Câmpurile marcate cu roșu sunt obligtorii" });
  }

  const groupsFirstYear = [];
  const semigroupsFirstYear = [];
  const groupsSecondYear = [];
  const semigroupsSecondYear = [];
  const groupsThirdYear = [];
  const semigroupsThirdYear = [];
  const groupsFourthYear = [];
  const semigroupsFourthYear = [];

  for (let i = 1; i <= req.body.groupsNumberFirstYear; i++) {
    groupsFirstYear.push(`41${i}${req.body.series}`);
  }

  for (let i = 1; i <= req.body.semigroupsNumberFirstYear; i++) {
    if (i <= req.body.groupsNumberFirstYear) {
      semigroupsFirstYear.push(`41${i}${req.body.series}a`);
    }

    if (i > req.body.groupsNumberFirstYear) {
      semigroupsFirstYear.push(
        `41${i - req.body.groupsNumberFirstYear}${req.body.series}b`
      );
    }
  }

  for (let i = 1; i <= req.body.groupsNumberSecondYear; i++) {
    groupsSecondYear.push(`42${i}${req.body.series}`);
  }

  for (let i = 1; i <= req.body.semigroupsNumberSecondYear; i++) {
    if (i <= req.body.groupsNumberSecondYear) {
      semigroupsSecondYear.push(`42${i}${req.body.series}a`);
    }

    if (i > req.body.groupsNumberSecondYear) {
      semigroupsSecondYear.push(
        `42${i - req.body.groupsNumberSecondYear}${req.body.series}b`
      );
    }
  }

  for (let i = 1; i <= req.body.groupsNumberThirdYear; i++) {
    groupsThirdYear.push(`43${i}${req.body.series}`);
  }

  for (let i = 1; i <= req.body.semigroupsNumberThirdYear; i++) {
    if (i <= req.body.groupsNumberThirdYear) {
      semigroupsThirdYear.push(`43${i}${req.body.series}a`);
    }

    if (i > req.body.groupsNumberThirdYear) {
      semigroupsThirdYear.push(
        `43${i - req.body.groupsNumberThirdYear}${req.body.series}b`
      );
    }
  }

  for (let i = 1; i <= req.body.groupsNumberFourthYear; i++) {
    groupsFourthYear.push(`44${i}${req.body.series}`);
  }

  for (let i = 1; i <= req.body.semigroupsNumberFourthYear; i++) {
    if (i <= req.body.groupsNumberFourthYear) {
      semigroupsFourthYear.push(`44${i}${req.body.series}a`);
    }

    if (i > req.body.groupsNumberFourthYear) {
      semigroupsFourthYear.push(
        `44${i - req.body.groupsNumberFourthYear}${req.body.series}b`
      );
    }
  }

  const series = {
    series: req.body.series,
    first: {
      year: 1,
      groups: groupsFirstYear,
      semigroups: semigroupsFirstYear,
    },
    second: {
      year: 2,
      groups: groupsSecondYear,
      semigroups: semigroupsSecondYear,
    },
    third: {
      year: 3,
      groups: groupsThirdYear,
      semigroups: semigroupsThirdYear,
    },
    fourth: {
      year: 4,
      groups: groupsFourthYear,
      semigroups: semigroupsFourthYear,
    },
  };

  try {
    const db = client.db();
    const collection = db.collection(process.env.series);

    const match = await collection.findOne({ series: series.series });
    if (match !== null) {
      return res.json({ message: "Seria există deja" });
    }

    const result = await collection.insertOne(series);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.patch("/:id", async (req, res) => {
  if (
    req.body.series === "" ||
    req.body.groupsNumberFirstYear < 1 ||
    req.body.semigroupsNumberFirstYear < 1 ||
    req.body.groupsNumberSecondYear < 1 ||
    req.body.semigroupsNumberSecondYear < 1 ||
    req.body.groupsNumberThirdYear < 1 ||
    req.body.semigroupsNumberThirdYear < 1 ||
    req.body.groupsNumberFourthYear < 1 ||
    req.body.semigroupsNumberFourthYear < 1
  ) {
    return res.json({ message: "Câmpurile marcate cu roșu sunt obligtorii" });
  }

  const groupsFirstYear = [];
  const semigroupsFirstYear = [];
  const groupsSecondYear = [];
  const semigroupsSecondYear = [];
  const groupsThirdYear = [];
  const semigroupsThirdYear = [];
  const groupsFourthYear = [];
  const semigroupsFourthYear = [];

  for (let i = 1; i <= req.body.groupsNumberFirstYear; i++) {
    groupsFirstYear.push(`41${i}${req.body.series}`);
  }

  for (let i = 1; i <= req.body.semigroupsNumberFirstYear; i++) {
    if (i <= req.body.groupsNumberFirstYear) {
      semigroupsFirstYear.push(`41${i}${req.body.series}a`);
    }

    if (i > req.body.groupsNumberFirstYear) {
      semigroupsFirstYear.push(
        `41${i - req.body.groupsNumberFirstYear}${req.body.series}b`
      );
    }
  }

  for (let i = 1; i <= req.body.groupsNumberSecondYear; i++) {
    groupsSecondYear.push(`42${i}${req.body.series}`);
  }

  for (let i = 1; i <= req.body.semigroupsNumberSecondYear; i++) {
    if (i <= req.body.groupsNumberSecondYear) {
      semigroupsSecondYear.push(`42${i}${req.body.series}a`);
    }

    if (i > req.body.groupsNumberSecondYear) {
      semigroupsSecondYear.push(
        `42${i - req.body.groupsNumberSecondYear}${req.body.series}b`
      );
    }
  }

  for (let i = 1; i <= req.body.groupsNumberThirdYear; i++) {
    groupsThirdYear.push(`43${i}${req.body.series}`);
  }

  for (let i = 1; i <= req.body.semigroupsNumberThirdYear; i++) {
    if (i <= req.body.groupsNumberThirdYear) {
      semigroupsThirdYear.push(`43${i}${req.body.series}a`);
    }

    if (i > req.body.groupsNumberThirdYear) {
      semigroupsThirdYear.push(
        `43${i - req.body.groupsNumberThirdYear}${req.body.series}b`
      );
    }
  }

  for (let i = 1; i <= req.body.groupsNumberFourthYear; i++) {
    groupsFourthYear.push(`44${i}${req.body.series}`);
  }

  for (let i = 1; i <= req.body.semigroupsNumberFourthYear; i++) {
    if (i <= req.body.groupsNumberFourthYear) {
      semigroupsFourthYear.push(`44${i}${req.body.series}a`);
    }

    if (i > req.body.groupsNumberFourthYear) {
      semigroupsFourthYear.push(
        `44${i - req.body.groupsNumberFourthYear}${req.body.series}b`
      );
    }
  }

  try {
    const db = client.db();
    const collection = db.collection(process.env.series);

    const result = await collection.updateOne(
      {
        _id: new ObjectId(req.params.id),
      },
      {
        $set: {
          series: req.body.series,
          first: {
            year: 1,
            groups: groupsFirstYear,
            semigroups: semigroupsFirstYear,
          },
          second: {
            year: 2,
            groups: groupsSecondYear,
            semigroups: semigroupsSecondYear,
          },
          third: {
            year: 3,
            groups: groupsThirdYear,
            semigroups: semigroupsThirdYear,
          },
          fourth: {
            year: 4,
            groups: groupsFourthYear,
            semigroups: semigroupsFourthYear,
          },
        },
      }
    );
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const db = client.db();
    const collection = db.collection(process.env.series);

    const result = await collection.deleteOne({
      _id: new ObjectId(req.params.id),
    });

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
