import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, 'data.json');
const PORT = process.env.PORT ?? 4000;

function readData() {
  if (!fs.existsSync(DATA_FILE)) return [];
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

function writeData(surveys) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(surveys, null, 2));
}

const app = express();
app.use(cors());
// Higher limit than the 100kb default: survey photos are sent as base64 data URLs.
app.use(express.json({ limit: '10mb' }));

// Mock backend for the Field Survey app: stores whatever the client pushes,
// upserting by the client-generated survey id.
app.get('/api/surveys', (_req, res) => {
  res.json(readData());
});

app.post('/api/surveys', (req, res) => {
  const survey = req.body;
  if (!survey?.id || !survey?.title) {
    return res.status(400).json({ error: 'Missing id or title' });
  }
  const surveys = readData();
  const index = surveys.findIndex((s) => s.id === survey.id);
  if (index === -1) {
    surveys.push(survey);
  } else {
    surveys[index] = survey;
  }
  writeData(surveys);
  res.status(201).json(survey);
});

app.delete('/api/surveys/:id', (req, res) => {
  const surveys = readData().filter((s) => s.id !== req.params.id);
  writeData(surveys);
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`Field Survey mock API listening on http://localhost:${PORT}`);
});
