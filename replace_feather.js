const fs = require('fs');
const path = require('path');

const arenaPath = path.resolve('c:/dev/readixondev/apps/web/src/app/(main)/arena/page.tsx');
let arenaContent = fs.readFileSync(arenaPath, 'utf8');
arenaContent = arenaContent.replace(/PenTool/g, 'Feather');
fs.writeFileSync(arenaPath, arenaContent, 'utf8');

const notifPath = path.resolve('c:/dev/readixondev/apps/web/src/app/(main)/notifications/page.tsx');
let notifContent = fs.readFileSync(notifPath, 'utf8');
notifContent = notifContent.replace(/PenTool/g, 'Feather');
fs.writeFileSync(notifPath, notifContent, 'utf8');

console.log('Feather icon replacement completed.');
