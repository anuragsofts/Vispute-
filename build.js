const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Build working directory:', process.cwd());

if (fs.existsSync(path.join(__dirname, 'client', 'package.json'))) {
  console.log('Building from root: client directory found.');
  execSync('npm --prefix client install && npm --prefix client run build', { stdio: 'inherit' });
  const clientDist = path.join(__dirname, 'client', 'dist');
  const rootDist = path.join(__dirname, 'dist');
  if (fs.existsSync(clientDist)) {
    fs.cpSync(clientDist, rootDist, { recursive: true });
    console.log('Copied client/dist to root dist.');
  }
} else {
  console.log('Building from client directory.');
  execSync('npx vite build', { stdio: 'inherit' });
}

console.log('Universal build successful!');
