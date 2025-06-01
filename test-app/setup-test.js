#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up Form Builder Test Environment...\n');

// Check if we're in the right directory
const currentDir = process.cwd();
const formBuilderPath = path.join(currentDir, 'form-builder');
const testAppPath = path.join(currentDir, 'test-app');

console.log('📁 Checking directory structure...');

if (!fs.existsSync(formBuilderPath)) {
  console.error('❌ form-builder directory not found!');
  console.log('Make sure you run this script from the dynamic-form-builder root directory');
  process.exit(1);
}

console.log('✅ form-builder directory found');

// Create test-app directory if it doesn't exist
if (!fs.existsSync(testAppPath)) {
  console.log('📁 Creating test-app directory...');
  fs.mkdirSync(testAppPath);
}

// Create subdirectories
const dirs = [
  'test-app/src',
  'test-app/src/components',
  'test-app/src/styles',
  'test-app/public'
];

dirs.forEach(dir => {
  const fullPath = path.join(currentDir, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`✅ Created ${dir}`);
  }
});

// Check if package.json exists in test-app
const packageJsonPath = path.join(testAppPath, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.log('📦 Initializing npm project...');
  
  const packageJson = {
    "name": "form-builder-test",
    "version": "1.0.0",
    "private": true,
    "dependencies": {
      "react": "^18.2.0",
      "react-dom": "^18.2.0",
      "react-scripts": "5.0.1",
      "react-beautiful-dnd": "^13.1.1",
      "uuid": "^9.0.0",
      "firebase": "^10.7.1"
    },
    "scripts": {
      "start": "react-scripts start",
      "build": "react-scripts build",
      "test": "react-scripts test",
      "eject": "react-scripts eject"
    },
    "eslintConfig": {
      "extends": [
        "react-app",
        "react-app/jest"
      ]
    },
    "browserslist": {
      "production": [
        ">0.2%",
        "not dead",
        "not op_mini all"
      ],
      "development": [
        "last 1 chrome version",
        "last 1 firefox version",
        "last 1 safari version"
      ]
    }
  };
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Created package.json');
}

// Create public/index.html if it doesn't exist
const indexHtmlPath = path.join(testAppPath, 'public', 'index.html');
if (!fs.existsSync(indexHtmlPath)) {
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="Form Builder Module Test Application" />
    <title>Form Builder Test</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>`;
  
  fs.writeFileSync(indexHtmlPath, indexHtml);
  console.log('✅ Created public/index.html');
}

console.log('\n📦 Installing dependencies...');
try {
  execSync('npm install', { cwd: testAppPath, stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully');
} catch (error) {
  console.error('❌ Failed to install dependencies');
  console.log('Please run "npm install" manually in the test-app directory');
}

console.log('\n🎉 Setup complete!');
console.log('\nNext steps:');
console.log('1. Copy the test files from the artifacts to their respective locations');
console.log('2. cd test-app');
console.log('3. npm start');
console.log('4. Open http://localhost:3000');
console.log('\n📚 Check test-app/README.md for detailed testing instructions');

// List files that need to be created
console.log('\n📝 Files to create in test-app/src/:');
console.log('- App.js');
console.log('- index.js');
console.log('- styles/App.css');
console.log('- components/FormBuilderTest.js');
console.log('- components/FormRendererTest.js');
console.log('- components/SubmissionsTest.js');
console.log('\nAll file contents are provided in the artifacts above.');