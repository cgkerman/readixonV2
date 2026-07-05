import fs from 'fs';
import path from 'path';

const files = [
  'apps/web/src/app/studio/story/[storyId]/page.tsx',
  'apps/web/src/app/studio/story/[storyId]/chapter/[chapterId]/page.tsx',
  'apps/web/src/app/studio/page.tsx',
  'apps/web/src/app/read/[storyId]/page.tsx',
  'apps/web/src/app/(main)/settings/page.tsx',
  'apps/web/src/app/(main)/search/page.tsx',
  'apps/web/src/app/(main)/readix/page.tsx',
  'apps/web/src/app/(main)/profile/[username]/page.tsx',
  'apps/web/src/app/(main)/profile/page.tsx',
  'apps/web/src/app/(main)/notifications/page.tsx',
  'apps/web/src/app/(main)/layout.tsx',
  'apps/web/src/app/(main)/feed/page.tsx',
  'apps/web/src/app/(main)/explore/authors/page.tsx'
];

for (const file of files) {
  const filePath = path.resolve(file);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf-8');
  
  if (content.includes('alert(')) {
    // Add import if not exists
    if (!content.includes('import { toast } from "sonner";') && !content.includes("import { toast } from 'sonner';")) {
      // Find the last import line
      const lines = content.split('\n');
      const lastImportIndex = lines.findLastIndex(line => line.startsWith('import '));
      if (lastImportIndex !== -1) {
        lines.splice(lastImportIndex + 1, 0, 'import { toast } from "sonner";');
        content = lines.join('\n');
      } else {
        content = 'import { toast } from "sonner";\n' + content;
      }
    }

    // Replace alert calls based on keywords
    content = content.replace(/alert\((['"`])(.*?)(['"`])\)/g, (match, p1, p2, p3) => {
      const lower = p2.toLowerCase();
      if (lower.includes('hata') || lower.includes('bulunamadı') || lower.includes('başarısız') || lower.includes('yüklenemedi') || lower.includes('lütfen') || lower.includes('oluşturulamadı')) {
        return `toast.error(${p1}${p2}${p3})`;
      } else if (lower.includes('başarı') || lower.includes('kaydedildi') || lower.includes('hoşça kalın')) {
        return `toast.success(${p1}${p2}${p3})`;
      } else {
        return `toast(${p1}${p2}${p3})`;
      }
    });

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated ${file}`);
  }
}
