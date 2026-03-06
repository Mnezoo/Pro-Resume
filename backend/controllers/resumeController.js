const Resume = require('../models/Resume');

exports.createResume = async (req, res) => {
  try {
    const { title, content } = req.body;
    const resume = new Resume({ userId: req.userId, title, content });
    await resume.save();
    res.status(201).json(resume);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.userId });
    res.json(resumes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateResume = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const resume = await Resume.findByIdAndUpdate(id, { title, content, updatedAt: Date.now() }, { new: true });
    res.json(resume);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};