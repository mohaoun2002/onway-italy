const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { sendApplicationNotification, EMAIL_CONFIG } = require('./services/emailService');

const app = express();
const PORT = process.env.PORT || 5050;

// Enable CORS and JSON body parser
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Upload directory setup
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(uploadDir));

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const cleanOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${uniqueSuffix}-${cleanOriginalName}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB max
});

// Paths to data
const universitiesPath = path.join(__dirname, 'data', 'universities.js');
const applicationsPath = path.join(__dirname, 'data', 'applications.json');

const UNIVERSITIES = require(universitiesPath);

// Helper to read applications
function getApplications() {
  try {
    const data = fs.readFileSync(applicationsPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading applications:", err);
    return [];
  }
}

// Helper to save applications
function saveApplications(apps) {
  try {
    fs.writeFileSync(applicationsPath, JSON.stringify(apps, null, 2), 'utf8');
  } catch (err) {
    console.error("Error writing applications:", err);
  }
}

// 1. GET Universities with filters
app.get('/api/universities', (req, res) => {
  const { search, status, level, region } = req.query;
  let results = [...UNIVERSITIES];

  if (search) {
    const query = search.toLowerCase();
    results = results.filter(u =>
      (u.name && u.name.toLowerCase().includes(query)) ||
      (u.englishRequirement && u.englishRequirement.toLowerCase().includes(query)) ||
      (u.admissionFee && u.admissionFee.toLowerCase().includes(query)) ||
      (u.openingDate && u.openingDate.toLowerCase().includes(query)) ||
      (u.deadline && u.deadline.toLowerCase().includes(query))
    );
  }

  if (status && status !== 'all') {
    results = results.filter(u => u.status.toLowerCase() === status.toLowerCase());
  }

  if (level === 'bachelor') {
    results = results.filter(u => u.bachelorEnglish);
  } else if (level === 'master') {
    results = results.filter(u => u.masterEnglish);
  }

  if (region && region !== 'all') {
    results = results.filter(u => u.region.toLowerCase() === region.toLowerCase());
  }

  res.json({
    total: results.length,
    universities: results
  });
});

// 2. GET University by ID
app.get('/api/universities/:id', (req, res) => {
  const uni = UNIVERSITIES.find(u => u.id === req.params.id);
  if (!uni) return res.status(404).json({ error: "University not found" });
  res.json(uni);
});

// 3. GET All Applications
app.get('/api/applications', (req, res) => {
  const apps = getApplications();
  res.json(apps);
});

// 4. GET Application by Tracking Code
app.get('/api/applications/:id', (req, res) => {
  const apps = getApplications();
  const found = apps.find(a => a.id.toUpperCase() === req.params.id.toUpperCase());
  if (!found) return res.status(404).json({ error: "Dossier not found" });
  res.json(found);
});

// 5. POST Submit Application (Multi-part or JSON)
app.post('/api/applications', upload.array('documents', 10), (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      wilaya,
      studyLevel,
      field,
      language,
      gpa,
      bacYear,
      currentDegree,
      universities,
      notes
    } = req.body;

    if (!fullName || !email || !phone) {
      return res.status(400).json({ error: "Name, email, and phone number are required" });
    }

    let parsedUniversities = [];
    if (typeof universities === 'string') {
      try {
        parsedUniversities = JSON.parse(universities);
      } catch {
        parsedUniversities = universities.split(',').map(s => s.trim());
      }
    } else if (Array.isArray(universities)) {
      parsedUniversities = universities;
    }

    // Process uploaded files if any
    const attachedFiles = (req.files || []).map(f => ({
      name: f.originalname,
      serverFilename: f.filename,
      url: `/uploads/${f.filename}`,
      size: `${(f.size / (1024 * 1024)).toFixed(2)} MB`,
      uploadedAt: new Date().toISOString()
    }));

    // If no physical files uploaded, check if documentMeta was sent
    if (attachedFiles.length === 0 && req.body.documentsMeta) {
      try {
        const meta = JSON.parse(req.body.documentsMeta);
        meta.forEach(m => attachedFiles.push(m));
      } catch (e) {
        // ignore
      }
    }

    // Generate unique ID e.g. OWI-2026-XXXX
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const trackingId = `OWI-2026-${randomCode}`;

    // Determine consulate based on wilaya
    // Algerian Annaba jurisdiction: Annaba, Constantine, Guelma, Skikda, Souk Ahras, El Tarf, Tebessa, Batna, Biskra, Khenchela, Oum El Bouaghi, Jijel, Mila, Setif, etc.
    const annabaWilayas = [
      '25 - Constantine', '23 - Annaba', '21 - Skikda', '24 - Guelma',
      '41 - Souk Ahras', '36 - El Tarf', '12 - Tébessa', '05 - Batna',
      '07 - Biskra', '40 - Khenchela', '04 - Oum El Bouaghi', '18 - Jijel', '43 - Mila'
    ];
    const isAnnaba = annabaWilayas.some(w => (wilaya || '').includes(w.split(' - ')[1]));
    const consulate = isAnnaba 
      ? 'Italian Consulate General in Annaba'
      : 'Italian Embassy in Algiers (VFS Global)';

    const newApplication = {
      id: trackingId,
      createdAt: new Date().toISOString(),
      fullName,
      email,
      phone,
      wilaya: wilaya || '16 - Alger',
      studyLevel: studyLevel || 'Master',
      field: field || 'General Studies',
      language: language || 'English',
      gpa: gpa || 'N/A',
      bacYear: bacYear || '2024',
      currentDegree: currentDegree || 'Licence / Baccalaureate',
      universities: parsedUniversities.length > 0 ? parsedUniversities : ['University of Padua'],
      status: 'Pending Review',
      statusNote: notes || 'New dossier submitted. OnWay Italy counselor assigned for initial academic validation.',
      consulate,
      dsuEligibility: 'Calculated upon translation of family income records',
      documents: attachedFiles
    };

    const apps = getApplications();
    apps.unshift(newApplication);
    saveApplications(apps);

    // Asynchronously dispatch SMTP email notification to receiver (italyoneway@gmail.com)
    sendApplicationNotification(newApplication).catch(err => {
      console.error("[Email Notification Error]", err);
    });

    res.status(201).json({
      success: true,
      message: "Application submitted successfully!",
      application: newApplication
    });
  } catch (err) {
    console.error("Submission error:", err);
    res.status(500).json({ error: "Failed to process application" });
  }
});

// 5b. GET Email & Notification Configuration
app.get('/api/config/email', (req, res) => {
  res.json({
    senderEmail: EMAIL_CONFIG.senderEmail,
    notificationReceiver: EMAIL_CONFIG.notificationReceiver,
    host: EMAIL_CONFIG.host,
    port: EMAIL_CONFIG.port,
    secure: EMAIL_CONFIG.secure,
    authConfigured: Boolean(EMAIL_CONFIG.auth.pass)
  });
});

// 6. PATCH Update Application Status & Notes
app.patch('/api/applications/:id/status', (req, res) => {
  const { status, statusNote } = req.body;
  const apps = getApplications();
  const index = apps.findIndex(a => a.id.toUpperCase() === req.params.id.toUpperCase());

  if (index === -1) {
    return res.status(404).json({ error: "Application not found" });
  }

  if (status) apps[index].status = status;
  if (statusNote) apps[index].statusNote = statusNote;
  apps[index].updatedAt = new Date().toISOString();

  saveApplications(apps);

  res.json({
    success: true,
    application: apps[index]
  });
});

// 7. GET System Statistics
app.get('/api/stats', (req, res) => {
  const apps = getApplications();
  const openUnis = UNIVERSITIES.filter(u => u.status === 'Open').length;
  const pending = apps.filter(a => a.status === 'Pending Review' || a.status === 'Under Review').length;
  const universitaly = apps.filter(a => a.status === 'Universitaly Validated').length;
  const visaStage = apps.filter(a => a.status === 'Visa Stage').length;
  const approved = apps.filter(a => a.status === 'Approved').length;

  res.json({
    totalUniversities: UNIVERSITIES.length,
    openUniversities: openUnis,
    totalApplications: apps.length,
    pendingDossiers: pending,
    universitalyValidated: universitaly,
    visaStage: visaStage,
    visaSuccessRate: '98.4%',
    regionsCovered: 18
  });
});

// Serve static assets from built client if available
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`OnWay Italy API server running on http://localhost:${PORT}`);
});

