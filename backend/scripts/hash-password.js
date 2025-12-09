// scripts/hash-password.js - Generate bcrypt password hash
const bcrypt = require('bcrypt');

const password = process.argv[2] || 'password123';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('❌ Error generating hash:', err);
    process.exit(1);
  }
  
  console.log('✅ Password hashed successfully!');
  console.log('==========================================');
  console.log('Original Password:', password);
  console.log('Hashed Password:', hash);
  console.log('==========================================');
  console.log('\n💡 Use this hash in your SQL seed file');
  console.log('   Replace: $2b$10$YourHashedPasswordHere');
  console.log('   With:   ', hash);
});

// Usage:
// node scripts/hash-password.js password123