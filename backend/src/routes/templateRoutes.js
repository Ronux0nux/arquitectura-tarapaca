const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const templatesFile = path.join(__dirname, '../../data/templates.json');

// Helper: load templates
function loadTemplates() {
  if (!fs.existsSync(templatesFile)) return [];
  const raw = fs.readFileSync(templatesFile, 'utf8');
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// Helper: save templates
function saveTemplates(templates) {
  fs.writeFileSync(templatesFile, JSON.stringify(templates, null, 2), 'utf8');
}

// GET /api/templates
router.get('/', (req, res) => {
  const templates = loadTemplates();
  res.json(templates);
});

// POST /api/templates
router.post('/', (req, res) => {
  const templates = loadTemplates();
  const newTemplate = req.body;
  templates.push(newTemplate);
  saveTemplates(templates);
  res.status(201).json({ success: true });
});

module.exports = router;
