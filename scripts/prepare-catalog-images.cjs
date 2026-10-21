const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Source paths of newly generated high-res images
const brainDir = 'C:/Users/Josa/.gemini/antigravity-ide/brain/f7c4a888-68fd-4fea-a892-cdbe6d4545b1';
const mainForklift = path.join(brainDir, 'cima_forklift_isolated_1792558598760.jpg');
const electricForklift = path.join(brainDir, 'cima_electric_forklift_1792558623528.jpg');
const reachTruck = path.join(brainDir, 'cima_reach_truck_1792558653170.jpg');
const dieselTitan = path.join(brainDir, 'cima_diesel_titan_1792558687480.jpg');

const publicDir = path.join(__dirname, '..', 'public');

// Copy catalog images
fs.copyFileSync(mainForklift, path.join(publicDir, 'forklift-c25.jpg'));
fs.copyFileSync(mainForklift, path.join(publicDir, 'forklift-c35.jpg'));
fs.copyFileSync(electricForklift, path.join(publicDir, 'forklift-e20.jpg'));
fs.copyFileSync(electricForklift, path.join(publicDir, 'forklift-t15.jpg'));
fs.copyFileSync(reachTruck, path.join(publicDir, 'forklift-r16.jpg'));
fs.copyFileSync(dieselTitan, path.join(publicDir, 'forklift-d50.jpg'));
fs.copyFileSync(mainForklift, path.join(publicDir, 'cima-forklift-main.jpg'));

console.log('✓ All catalog forklift images copied to public/');
