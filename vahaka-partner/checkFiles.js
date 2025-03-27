const fs = require('fs');
const path = require('path');

// Define file paths to check
const filesToCheck = [
  'app/components/Card.tsx',
  'app/components/Button.tsx',
  'app/components/Input.tsx',
  'app/services/driverService.ts',
  'app/services/firebase.ts',
  'app/types/driver.ts',
  'app/constants/theme.ts',
];

console.log('Checking if files exist:');
filesToCheck.forEach(file => {
  const fullPath = path.join(__dirname, file);
  const exists = fs.existsSync(fullPath);
  console.log(`${file}: ${exists ? 'EXISTS' : 'MISSING'}`);
});

// Check file contents if they exist
filesToCheck.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf-8');
    console.log(`\n${file} (${content.length} bytes):`);
    console.log(content.substring(0, 200) + '...');
  }
}); 