const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');

// Create dist directory if it doesn't exist
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

// Files to copy to dist
const filesToCopy = [
    'index.html',
    'styles.css',
    'script.js',
    'profile-nobg.png',
    'ux-design-top.png'
];

filesToCopy.forEach(file => {
    const srcPath = path.join(__dirname, file);
    const destPath = path.join(distDir, file);
    
    if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied ${file} to dist/`);
    } else {
        console.warn(`Warning: ${file} not found, skipping.`);
    }
});

console.log('Build completed successfully!');
