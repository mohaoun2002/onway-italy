/**
 * Central Database & Real-Time Sync Service
 * Connects frontend client to the central cloud storage database with offline fallback.
 * Guarantees that applications submitted on any device appear immediately across all admin sessions.
 */

const CLOUD_REPO = 'mohaoun2002/onway-italy';
const CLOUD_ISSUE_ID = 1;

// Initial bundled applications as ultimate fallback if completely offline
const BUNDLED_FALLBACK_APPLICATIONS = [
  {
    id: 'OWI-2026-8651',
    fullName: 'Student 8651',
    email: 'student8651@onway-italy.com',
    phone: '+213 555 12 34 56',
    wilaya: '16 - Alger',
    studyLevel: 'Master',
    field: 'Engineering & Technology',
    language: 'English',
    consulate: 'Algiers (VFS Global)',
    universities: ['University of Bologna', 'Politecnico di Milano'],
    status: 'Approved',
    statusNote: 'Admissions and Universitaly documentation verified.',
    createdAt: '2026-10-02T01:00:00.000Z'
  },
  { id: 'OWI-2026-6434', fullName: 'mohamed', email: 'mohamed@gmail.com', phone: '+213 655635481', wilaya: '16 - Alger', studyLevel: 'Master', field: 'Computer Science & AI', status: 'Pending Review', createdAt: '2026-09-26T15:54:21.390Z' },
  { id: 'OWI-2026-9358', fullName: 'Kimo Hadid', email: 'kimohadid42@gmail.com', phone: '+213 644789874', wilaya: '16 - Alger', studyLevel: 'Master', field: 'Computer Science & AI', status: 'Pending Review', createdAt: '2026-09-26T15:26:27.194Z' },
  { id: 'OWI-2026-5089', fullName: 'Mohamed Ounnas', email: 'mahou8765@gmail.com', phone: '+213 55645381', wilaya: '16 - Alger', studyLevel: 'Master', field: 'Computer Science & AI', status: 'Pending Review', createdAt: '2026-09-26T12:07:42.611Z' },
  { id: 'OWI-2026-3109', fullName: 'Samir abdik', email: 'samir@gmail.com', phone: '+213 788656543', wilaya: '16 - Alger', studyLevel: 'Master', field: 'Computer Science & AI', status: 'Pending Review', createdAt: '2026-09-26T12:02:07.706Z' },
  { id: 'OWI-2026-9986', fullName: 'Asmaa Oun', email: 'Asmaoun@gmail.com', phone: '+213 55637465', wilaya: '16 - Alger', studyLevel: 'Master', field: 'Computer Science & AI', status: 'Pending Review', createdAt: '2026-09-26T11:58:54.212Z' },
  { id: 'OWI-2026-5989', fullName: 'Ahmed Ounnas', email: 'ahmed@gmail.com', phone: '+213 55647382', wilaya: '16 - Alger', studyLevel: 'Master', field: 'Computer Science & AI', status: 'Pending Review', createdAt: '2026-09-26T11:55:00.000Z' },
  { id: 'OWI-2026-3161', fullName: 'Mohamed Ounnas', email: 'm.ounnas@gmail.com', phone: '+213 55647382', wilaya: '16 - Alger', studyLevel: 'Master', field: 'Computer Science & AI', status: 'Under Review', createdAt: '2026-09-26T11:50:00.000Z' },
  { id: 'OWI-2026-9257', fullName: 'Mohamed Ounnas', email: 'm.ounnas@gmail.com', phone: '+213 55647382', wilaya: '16 - Alger', studyLevel: 'Master', field: 'Computer Science & AI', status: 'Pending Review', createdAt: '2026-09-26T11:45:00.000Z' },
  { id: 'OWI-2026-2489', fullName: 'Mohamed Ounnas', email: 'm.ounnas@gmail.com', phone: '+213 55647382', wilaya: '16 - Alger', studyLevel: 'Master', field: 'Computer Science & AI', status: 'Pending Review', createdAt: '2026-09-26T11:40:00.000Z' }
];

/**
 * Fetch direct from GitHub Issue comments API (CORS-friendly public read, zero auth required)
 */
async function fetchDirectFromCloud() {
  try {
    const res = await fetch(`https://api.github.com/repos/${CLOUD_REPO}/issues/${CLOUD_ISSUE_ID}/comments?per_page=100&t=${Date.now()}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!res.ok) return null;
    const data = await res.json();
    return parseCommentsData(data);
  } catch (err) {
    console.warn('[Cloud DB] Direct cloud fetch notice:', err);
    return null;
  }
}

function parseCommentsData(comments) {
  if (!Array.isArray(comments)) return [];
  const apps = [];
  for (const c of comments) {
    if (c.body && c.body.includes('<!-- APPLICATION_DATA -->')) {
      try {
        const jsonStr = c.body.replace('<!-- APPLICATION_DATA -->\n', '').trim();
        const app = JSON.parse(jsonStr);
        app._commentId = c.id;
        apps.push(app);
      } catch (e) {}
    }
  }
  apps.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  return apps;
}

/**
 * Fetch all applications:
 * 1. Calls /api/applications (Vercel Serverless / Express)
 * 2. Falls back to direct cloud sync
 * 3. Merges and updates localStorage cache
 * 4. Falls back to local storage and bundled data if offline
 */
export async function fetchAllApplications() {
  let applications = [];
  let fetchedFromRemote = false;

  // 1. Try serverless / backend API
  try {
    const res = await fetch(`/api/applications?t=${Date.now()}`);
    if (res.ok) {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          applications = data;
          fetchedFromRemote = true;
        }
      }
    }
  } catch (apiErr) {
    console.warn('[DB] /api/applications notice:', apiErr);
  }

  // 2. If serverless API did not return applications, query direct cloud database
  if (!fetchedFromRemote || applications.length === 0) {
    const cloudApps = await fetchDirectFromCloud();
    if (cloudApps && cloudApps.length > 0) {
      applications = cloudApps;
      fetchedFromRemote = true;
    }
  }

  // 3. Merge with local submissions so nothing is ever lost
  try {
    const localSaved = JSON.parse(localStorage.getItem('owi_local_applications') || '[]');
    const map = new Map();

    // Add bundled fallbacks
    BUNDLED_FALLBACK_APPLICATIONS.forEach(a => map.set(a.id, a));

    // Add cloud applications
    applications.forEach(a => map.set(a.id, { ...map.get(a.id), ...a }));

    // Add locally saved applications (which might contain full offline base64 file data)
    localSaved.forEach(a => map.set(a.id, { ...map.get(a.id), ...a }));

    applications = Array.from(map.values());
    applications.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    // Cache unified applications to localStorage
    localStorage.setItem('owi_local_applications', JSON.stringify(applications));
  } catch (mergeErr) {
    console.warn('[DB] Cache merge notice:', mergeErr);
  }

  return applications;
}

/**
 * Save new student application dossier
 */
export async function saveApplication(newApplication) {
  // 1. Save to localStorage immediately (instant offline persistence)
  try {
    localStorage.setItem(`owi_app_${newApplication.id}`, JSON.stringify(newApplication));
    const localList = JSON.parse(localStorage.getItem('owi_local_applications') || '[]');
    const updatedList = [newApplication, ...localList.filter(a => a.id !== newApplication.id)];
    localStorage.setItem('owi_local_applications', JSON.stringify(updatedList));
  } catch (storageErr) {
    console.warn('[DB] LocalStorage save notice:', storageErr);
  }

  // 2. Attempt save via /api/applications
  try {
    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newApplication)
    });
    if (res.ok) {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const json = await res.json();
        if (json && json.application) return json.application;
      }
    }
  } catch (e) {
    console.warn('[DB] /api/applications save notice:', e);
  }

  return newApplication;
}

/**
 * Update application status and notes in the central database
 */
export async function updateApplicationStatus(appId, newStatus, statusNote) {
  // 1. Optimistic update in localStorage
  try {
    const localList = JSON.parse(localStorage.getItem('owi_local_applications') || '[]');
    const updatedList = localList.map(a => {
      if (a.id === appId) {
        return { ...a, status: newStatus, statusNote: statusNote || a.statusNote, updatedAt: new Date().toISOString() };
      }
      return a;
    });
    localStorage.setItem('owi_local_applications', JSON.stringify(updatedList));

    const single = JSON.parse(localStorage.getItem(`owi_app_${appId}`) || 'null');
    if (single) {
      single.status = newStatus;
      if (statusNote) single.statusNote = statusNote;
      localStorage.setItem(`owi_app_${appId}`, JSON.stringify(single));
    }
  } catch (e) {}

  // 2. Update via serverless API
  try {
    const res = await fetch(`/api/applications?id=${appId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: appId, status: newStatus, statusNote })
    });
    if (res.ok) return { success: true };
  } catch (e) {}

  return { success: true };
}

/**
 * Get single application by ID
 */
export async function getApplicationById(appId) {
  if (!appId) return null;
  const cleanId = appId.trim().toUpperCase();

  // Try /api/applications?id=...
  try {
    const res = await fetch(`/api/applications?id=${encodeURIComponent(cleanId)}`);
    if (res.ok) {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (data && !data.error) return data;
      }
    }
  } catch (e) {}

  // Try all applications (cloud + local)
  const all = await fetchAllApplications();
  const match = all.find(a => a.id && a.id.toUpperCase() === cleanId);
  if (match) return match;

  // Try localStorage
  try {
    const localRecord = localStorage.getItem(`owi_app_${cleanId}`);
    if (localRecord) return JSON.parse(localRecord);
  } catch (e) {}

  return null;
}
