const fs = require('fs');
const path = require('path');

const srcRenderer = path.join(__dirname, '..', 'src', 'renderer');
const distRenderer = path.join(__dirname, '..', 'dist', 'renderer');
const srcAssets = path.join(__dirname, '..', 'assets');
const distAssets = path.join(__dirname, '..', 'dist', 'assets');

function copyFile(src, dest) {
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(src, dest);
  console.log(`Copied: ${src} -> ${dest}`);
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.log(`Source directory does not exist: ${src}`);
    return;
  }

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFile(srcPath, destPath);
    }
  }
}

// Copy HTML and CSS files
const rendererFiles = ['index.html', 'settings.html', 'index.css', 'settings.css'];
for (const file of rendererFiles) {
  const src = path.join(srcRenderer, file);
  const dest = path.join(distRenderer, file);
  if (fs.existsSync(src)) {
    copyFile(src, dest);
  }
}

// Copy assets
copyDir(srcAssets, distAssets);

console.log('Assets copied successfully!');
