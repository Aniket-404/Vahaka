/**
 * Environment Variables Setup Script
 * 
 * This script helps set up the .env file for local development.
 * It checks if .env file exists, and if not, creates one from .env.example.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Paths for the files
const envPath = path.resolve(__dirname, '../.env');
const exampleEnvPath = path.resolve(__dirname, '../.env.example');

// Check if .env file exists
if (fs.existsSync(envPath)) {
  console.log('✅ .env file already exists.');
  console.log('If you want to reset it, delete the file and run this script again.');
  rl.close();
} else {
  // Check if .env.example exists
  if (!fs.existsSync(exampleEnvPath)) {
    console.error('❌ .env.example file not found. Please create one first.');
    rl.close();
    process.exit(1);
  }

  console.log('Creating .env file from .env.example...');
  
  // Read .env.example content
  const exampleContent = fs.readFileSync(exampleEnvPath, 'utf8');
  
  // Create .env file with the same content
  fs.writeFileSync(envPath, exampleContent);
  
  console.log('✅ .env file created successfully!');
  console.log('Please update the values in the .env file with your Firebase configuration.');
  console.log('For Firebase configuration:');
  console.log('1. Go to your Firebase project console (https://console.firebase.google.com/)');
  console.log('2. Select your project');
  console.log('3. Click on "Project Settings" (gear icon)');
  console.log('4. Scroll down to "Your apps" section and find your web app');
  console.log('5. Copy the configuration values to your .env file');
  
  rl.close();
} 