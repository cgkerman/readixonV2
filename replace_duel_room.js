const fs = require('fs');
const path = require('path');

const filePath = path.resolve('c:/dev/readixondev/apps/web/src/app/(main)/arena/[duelId]/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Icons
content = content.replace(/Swords/g, 'Feather');

// Red color replacements
content = content.replace(/text-red-400/g, 'text-primary');
content = content.replace(/ring-red-500/g, 'ring-primary');
content = content.replace(/border-red-500\/30/g, 'border-destructive/30');
content = content.replace(/hover:bg-red-500\/10/g, 'hover:bg-destructive/10');
content = content.replace(/bg-red-600\/10/g, 'bg-primary/10');
content = content.replace(/border-red-500\/20/g, 'border-primary/20');
content = content.replace(/text-red-50/g, 'text-primary-foreground');
content = content.replace(/bg-red-950\/30/g, 'bg-destructive/10');
content = content.replace(/border-red-500\/50/g, 'border-destructive/50'); // for embargo warning
content = content.replace(/focus:border-red-500\/50/g, 'focus:border-primary/50');
content = content.replace(/bg-red-600/g, 'bg-primary');
content = content.replace(/hover:bg-red-700/g, 'hover:bg-primary/90');
content = content.replace(/border-t-red-500/g, 'border-t-primary');

// Orange color replacements
content = content.replace(/text-orange-400/g, 'text-primary');
content = content.replace(/bg-orange-950\/20/g, 'bg-primary/10');
content = content.replace(/border-orange-500\/20/g, 'border-primary/20');

// Inject Time Limit Display
const injectTarget = `<Typography variant="body" className="font-semibold">Konu: {duel.prompt}</Typography>`;
const injectContent = `<Typography variant="body" className="font-semibold">Konu: {duel.prompt}</Typography>
            {duel.turnTimeLimitMinutes && (
              <Typography variant="caption" className="text-muted flex items-center gap-1 mt-1">
                Tur Süresi: {duel.turnTimeLimitMinutes >= 60 ? \`\${duel.turnTimeLimitMinutes / 60} Saat\` : \`\${duel.turnTimeLimitMinutes} Dk\`}
              </Typography>
            )}`;
content = content.replace(injectTarget, injectContent);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Replacements completed.');
