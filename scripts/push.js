const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');
const fs = require('fs');
const path = require('path');

async function main() {
  const repoUrl = process.argv[2] || process.env.GITHUB_REPO_URL;
  const token = process.argv[3] || process.env.GITHUB_TOKEN;

  if (!repoUrl) {
    console.log('Usage: node scripts/push.js <GITHUB_REPO_URL> [GITHUB_TOKEN]');
    console.log('Example: node scripts/push.js https://github.com/username/my-repo.git ghp_xxxxxx');
    process.exit(1);
  }

  const dir = path.resolve(__dirname, '..');

  console.log(`Setting remote origin to: ${repoUrl}`);
  try {
    await git.deleteRemote({ fs, dir, remote: 'origin' });
  } catch (e) {
    // ignore if remote did not exist
  }

  await git.addRemote({
    fs,
    dir,
    remote: 'origin',
    url: repoUrl
  });

  console.log('Pushing main branch to GitHub remote...');

  try {
    const pushResult = await git.push({
      fs,
      http,
      dir,
      remote: 'origin',
      ref: 'main',
      force: false,
      onAuth: () => ({
        username: token || 'git',
        password: token || ''
      })
    });

    console.log('Push completed successfully!', pushResult);
    console.log('Vercel will automatically detect the new commit on main and trigger deployment.');
  } catch (err) {
    console.error('Push failed:', err.message);
    if (err.data) console.error('Details:', err.data);
    process.exit(1);
  }
}

main();
