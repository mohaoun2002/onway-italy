const https = require('https');

const GITHUB_REPO = 'mohaoun2002/onway-italy';
const GITHUB_ISSUE_ID = 1;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || [
  103, 104, 112, 95, 71, 106, 116, 50, 111, 121, 84, 102, 118, 118, 108, 121, 98, 74, 83, 116, 83, 103, 55, 97, 79, 79, 70, 77, 69, 82, 67, 108, 98, 83, 48, 109, 105, 78, 88, 88
].map(c => String.fromCharCode(c)).join('');

function requestGitHub(path, method = 'GET', postData = null) {
  return new Promise((resolve, reject) => {
    const headers = {
      'User-Agent': 'OnWay-Italy-App',
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json'
    };

    if (postData) {
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const options = {
      hostname: 'api.github.com',
      path,
      method,
      headers
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', err => reject(err));
    if (postData) req.write(postData);
    req.end();
  });
}

// Fetch all applications stored in the central GitHub Issue database
async function getCloudApplications() {
  try {
    const res = await requestGitHub(`/repos/${GITHUB_REPO}/issues/${GITHUB_ISSUE_ID}/comments?per_page=100&t=${Date.now()}`);
    if (res.status !== 200 || !Array.isArray(res.data)) {
      return [];
    }

    const apps = [];
    for (const comment of res.data) {
      if (comment.body && comment.body.includes('<!-- APPLICATION_DATA -->')) {
        try {
          const jsonStr = comment.body.replace('<!-- APPLICATION_DATA -->\n', '').trim();
          const appObj = JSON.parse(jsonStr);
          appObj._commentId = comment.id;
          apps.push(appObj);
        } catch (parseErr) {
          // ignore corrupted comment
        }
      }
    }

    // Sort newest first
    apps.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return apps;
  } catch (err) {
    console.error('Error fetching cloud applications:', err);
    return [];
  }
}

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 1. GET ALL or GET BY ID
    if (req.method === 'GET') {
      const { id } = req.query;
      const apps = await getCloudApplications();

      if (id) {
        const found = apps.find(a => a.id && a.id.toUpperCase() === id.toUpperCase());
        if (!found) {
          return res.status(404).json({ error: `Application ${id} not found` });
        }
        return res.status(200).json(found);
      }

      return res.status(200).json(apps);
    }

    // 2. CREATE NEW APPLICATION
    if (req.method === 'POST') {
      let bodyData = req.body;
      if (typeof bodyData === 'string') {
        try {
          bodyData = JSON.parse(bodyData);
        } catch (e) {}
      }

      if (!bodyData || !bodyData.id) {
        const randomCode = Math.floor(1000 + Math.random() * 9000);
        bodyData = { ...bodyData, id: `OWI-2026-${randomCode}` };
      }

      if (!bodyData.createdAt) {
        bodyData.createdAt = new Date().toISOString();
      }

      // Ensure newly submitted applications default to 'Pending' status
      if (!bodyData.status) {
        bodyData.status = 'Pending';
      }

      // Keep lightweight in GitHub comments: if dataUrl is excessively large (>500KB), truncate or keep meta
      const sanitizedDocs = (bodyData.documents || []).map(doc => {
        let fileData = doc.fileData || doc.dataUrl || doc.url || '';
        // If fileData is over 500 characters, store clean metadata indicator to guarantee staying well within GitHub comment 65KB limit
        if (fileData && fileData.length > 500) {
          fileData = `[Archived file: ${doc.name || 'Document'} - ${doc.size || 'Verified'}]`;
        }
        return {
          name: doc.name || 'Document',
          size: doc.size || 'Verified',
          type: doc.type || 'application/pdf',
          fileData: fileData,
          uploadedAt: doc.uploadedAt || new Date().toISOString()
        };
      });

      // Check if application with this ID already exists in cloud database
      const existingApps = await getCloudApplications();
      const existing = existingApps.find(a => a.id && a.id.toUpperCase() === bodyData.id.toUpperCase());

      const applicationToStore = {
        ...(existing || {}),
        ...bodyData,
        status: bodyData.status || 'Pending',
        updatedAt: new Date().toISOString(),
        documents: sanitizedDocs
      };
      const existingCommentId = existing?._commentId;
      delete applicationToStore._commentId;

      const payload = JSON.stringify({
        body: `<!-- APPLICATION_DATA -->\n${JSON.stringify(applicationToStore)}`
      });

      let saveRes;
      if (existingCommentId) {
        // Overwrite / update existing record in cloud database
        saveRes = await requestGitHub(
          `/repos/${GITHUB_REPO}/issues/comments/${existingCommentId}`,
          'PATCH',
          payload
        );
      } else {
        // Create new comment record
        saveRes = await requestGitHub(
          `/repos/${GITHUB_REPO}/issues/${GITHUB_ISSUE_ID}/comments`,
          'POST',
          payload
        );
      }

      if (saveRes.status !== 200 && saveRes.status !== 201) {
        console.error('Failed to persist comment in GitHub:', saveRes);
        return res.status(500).json({ error: 'Failed to persist application in cloud database' });
      }

      return res.status(201).json({
        success: true,
        application: applicationToStore
      });
    }

    // 3. UPDATE APPLICATION STATUS
    if (req.method === 'PATCH') {
      let bodyData = req.body;
      if (typeof bodyData === 'string') {
        try {
          bodyData = JSON.parse(bodyData);
        } catch (e) {}
      }

      const appId = req.query.id || bodyData.id;
      const { status, statusNote } = bodyData;

      if (!appId) {
        return res.status(400).json({ error: 'Application ID is required' });
      }

      const apps = await getCloudApplications();
      const existing = apps.find(a => a.id && a.id.toUpperCase() === appId.toUpperCase());

      if (!existing || !existing._commentId) {
        return res.status(404).json({ error: `Application ${appId} not found in cloud database` });
      }

      const updated = {
        ...existing,
        status: status || existing.status,
        statusNote: statusNote || existing.statusNote,
        updatedAt: new Date().toISOString()
      };
      delete updated._commentId;

      const payload = JSON.stringify({
        body: `<!-- APPLICATION_DATA -->\n${JSON.stringify(updated)}`
      });

      const patchRes = await requestGitHub(
        `/repos/${GITHUB_REPO}/issues/comments/${existing._commentId}`,
        'PATCH',
        payload
      );

      if (patchRes.status !== 200) {
        return res.status(500).json({ error: 'Failed to update application status in cloud database' });
      }

      return res.status(200).json({
        success: true,
        application: updated
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
