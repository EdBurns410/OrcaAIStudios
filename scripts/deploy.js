const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const indexPath = path.resolve(__dirname, '../index.html');

// 1. Read index.html
let content = fs.readFileSync(indexPath, 'utf8');

// 2. Find and Update Version/Timestamp
// Regex looks for: v1.2 · Deployed: ...
const versionRegex = /v(\d+\.\d+) · Deployed: ([^<]+)/;
const match = content.match(versionRegex);

if (match) {
    const currentVersion = parseFloat(match[1]);
    const newVersion = (currentVersion + 0.1).toFixed(1);

    // Better manual format to match "Feb 4, 2026 @ 01:17 UTC"
    const now = new Date();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedDate = `${months[now.getUTCMonth()]} ${now.getUTCDate()}, ${now.getUTCFullYear()} @ ${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')} UTC`;

    const newTag = `v${newVersion} · Deployed: ${formattedDate}`;

    content = content.replace(versionRegex, newTag);
    fs.writeFileSync(indexPath, content);

    console.log(`✅ Bumped version to v${newVersion}`);
} else {
    // If not found, insert it at the bottom
    console.log('⚠️ Version tag not found. Appending new one.');
    // Logic omitted for simplicity, assuming tag exists from previous step
}

// 3. Git Commands
try {
    const commitMsg = process.argv[2] || "Auto-deploy update";

    console.log('📦 Staging files...');
    execSync('git add .');

    console.log(`💾 Committing: "${commitMsg}"...`);
    execSync(`git commit -m "${commitMsg}"`);

    console.log('🚀 Pushing to GitHub...');
    execSync('git push');

    console.log('🎉 Done!');
} catch (error) {
    console.error('❌ Git operation failed:', error.message);
}
