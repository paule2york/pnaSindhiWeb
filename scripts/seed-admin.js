// Run with: node scripts/seed-admin.js
// Then copy the hash into the SQL migration.

const bcrypt = require('bcryptjs');

async function main() {
  const hash = await bcrypt.hash('admin123', 10);
  console.log('hash for admin123:', hash);

  // Also test verification
  const ok = await bcrypt.compare('admin123', hash);
  console.log('verify:', ok);
}

main();
