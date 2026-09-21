const assert = require('assert');

async function testSuite() {
  console.log('--- Running OnWay Italy API Test Suite ---');
  const baseUrl = 'http://localhost:5050/api';

  // 1. Test universities endpoint
  const resUnis = await fetch(`${baseUrl}/universities`);
  const dataUnis = await resUnis.json();
  console.log(`[PASS] Universities count: ${dataUnis.total}`);
  assert.strictEqual(dataUnis.total, 67, 'Expected 67 universities calls');

  // 2. Test search filter
  const resSearch = await fetch(`${baseUrl}/universities?search=padua`);
  const dataSearch = await resSearch.json();
  console.log(`[PASS] Search 'padua' found: ${dataSearch.total} match(es)`);
  assert(dataSearch.total >= 1, 'Search should find Padua');

  // 3. Test application submission
  const newAppData = {
    fullName: "Karim Zerrouki",
    email: "karim.zerrouki@gmail.com",
    phone: "+213 670 11 22 33",
    wilaya: "16 - Alger",
    studyLevel: "Master",
    field: "Artificial Intelligence",
    language: "English",
    gpa: "16.20 / 20",
    bacYear: "2023",
    currentDegree: "Licence Math-Info",
    universities: ["University of Bologna", "Politecnico di Milano"],
    notes: "Requires fast-track pre-enrolment for Universitaly."
  };

  const resPost = await fetch(`${baseUrl}/applications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newAppData)
  });
  const dataPost = await resPost.json();
  console.log(`[PASS] Submitted application ID: ${dataPost.application?.id}`);
  assert(dataPost.application?.id.startsWith('OWI-2026-'), 'Invalid tracking ID format');
  const trackingId = dataPost.application.id;

  // 4. Test tracking retrieval
  const resTrack = await fetch(`${baseUrl}/applications/${trackingId}`);
  const dataTrack = await resTrack.json();
  console.log(`[PASS] Retrieved application status: ${dataTrack.status}`);
  assert.strictEqual(dataTrack.fullName, "Karim Zerrouki");

  // 5. Test status update
  const resPatch = await fetch(`${baseUrl}/applications/${trackingId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: 'Universitaly Validated',
      statusNote: 'All credentials validated. Bologna pre-admission letter issued.'
    })
  });
  const dataPatch = await resPatch.json();
  console.log(`[PASS] Updated status to: ${dataPatch.application?.status}`);
  assert.strictEqual(dataPatch.application?.status, 'Universitaly Validated');

  // 6. Test stats
  const resStats = await fetch(`${baseUrl}/stats`);
  const dataStats = await resStats.json();
  console.log(`[PASS] Stats total applications: ${dataStats.totalApplications}`);
  assert(dataStats.totalApplications >= 5);

  console.log('\nAll API endpoints and business logic verified successfully! ✅');
}

testSuite().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
