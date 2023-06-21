require("dotenv").config();

const express = require("express");
const router = express.Router();
const { MongoClient, ObjectId } = require("mongodb");

const client = new MongoClient(process.env.DATABASE_URL);

router.get("/", async (req, res) => {
  try {
    const db = client.db();
    const collection = db.collection(process.env.subjects);

    const result = await collection.find().toArray();

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const db = client.db();
    const collection = db.collection(process.env.subjects);

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
    req.body.name === "" ||
    req.body.shortName === "" ||
    req.body.year < 1 ||
    req.body.year > 4 ||
    req.body.semester < 1 ||
    req.body.semester > 2 ||
    (req.body.seminarHours >= 1 && req.body.seminarTeachers.length < 1) ||
    (req.body.labHours >= 1 && req.body.labTeachers.length < 1) ||
    (req.body.projectHours >= 1 && req.body.projectTeachers.length < 1)
  ) {
    return res.json({ message: "Câmpurile marcate cu roșu sunt obligtorii" });
  }
  const subject = {
    name: req.body.name,
    shortName: req.body.shortName,
    year: req.body.year,
    semester: req.body.semester,
    courseHours: req.body.courseHours,
    seminarHours: req.body.seminarHours,
    labHours: req.body.labHours,
    projectHours: req.body.projectHours,
    courseTeachers: req.body.courseTeachers,
    seminarTeachers: req.body.seminarTeachers,
    labTeachers: req.body.labTeachers,
    projectTeachers: req.body.projectTeachers,
  };

  try {
    const db = client.db();
    const collection = db.collection(process.env.subjects);
    const match = await collection.findOne({ name: subject.name });
    if (match !== null) {
      return res.json({ message: "Disciplina există deja" });
    }
    const result = await collection.insertOne(subject);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const db = client.db();
    const collection = db.collection(process.env.subjects);

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
    req.body.name === "" ||
    req.body.shortName === "" ||
    req.body.year < 1 ||
    req.body.year > 4 ||
    req.body.semester < 1 ||
    req.body.semester > 2 ||
    (req.body.seminarHours >= 1 && req.body.seminarTeachers.length < 1) ||
    (req.body.labHours >= 1 && req.body.labTeachers.length < 1) ||
    (req.body.projectHours >= 1 && req.body.projectTeachers.length < 1)
  ) {
    return res.json({ message: "Câmpurile marcate cu roșu sunt obligtorii" });
  }

  try {
    const db = client.db();
    const collection = db.collection(process.env.subjects);

    const result = await collection.updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $set: {
          name: req.body.name,
          shortName: req.body.shortName,
          year: req.body.year,
          semester: req.body.semester,
          courseHours: req.body.courseHours,
          seminarHours: req.body.seminarHours,
          labHours: req.body.labHours,
          projectHours: req.body.projectHours,
          courseTeachers: req.body.courseTeachers,
          seminarTeachers: req.body.seminarTeachers,
          labTeachers: req.body.labTeachers,
          projectTeachers: req.body.projectTeachers,
        },
      }
    );

    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.patch("/teacher/:id", async (req, res) => {
  try {
    const db = client.db();
    const collection = db.collection(process.env.subjects);

    const subjectsResponse = await collection
      .find({
        "courseTeachers.teacher._id": req.params.id,
      })
      .toArray();

    let courseTeachersBigArray = subjectsResponse.map((element) => ({
      subjectId: element._id,
      teachers: element.courseTeachers,
    }));

    courseTeachersBigArray.forEach((element) => {
      element.teachers.forEach((series) => {
        if (series.teacher._id === req.params.id) {
          series.teacher = null;
        }
      });
    });

    let courseTeachers = [];

    const allSubjects = await collection.find().toArray();

    courseTeachersBigArray.forEach((element) => {
      allSubjects.forEach((subject) => {
        if (subject._id.toString() === element.subjectId.toString()) {
          courseTeachers = element.teachers;
        }
      });
    });

    const response = await collection.updateMany(
      {
        "courseTeachers.teacher._id": req.params.id,
      },
      {
        $set: {
          courseTeachers: courseTeachers,
        },
      }
    );

    await collection.updateMany(
      {
        "seminarTeachers._id": req.params.id,
      },
      {
        $pull: {
          seminarTeachers: {
            _id: req.params.id,
          },
        },
      }
    );

    await collection.updateMany(
      {
        "labTeachers._id": req.params.id,
      },
      {
        $pull: {
          labTeachers: {
            _id: req.params.id,
          },
        },
      }
    );

    await collection.updateMany(
      {
        "projectTeachers._id": req.params.id,
      },
      {
        $pull: {
          projectTeachers: {
            _id: req.params.id,
          },
        },
      }
    );

    res.status(200).json(response);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
