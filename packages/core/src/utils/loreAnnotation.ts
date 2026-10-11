import type { InlineUniverseEntity } from '../types/universe';

/**
 * Regex özel karakterlerini kaçış karakteriyle korur
 */
export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export interface AnnotateLoreOptions {
  maxPerEntity?: number; // Bir varlığın kaç defaya kadar işaretleneceği (varsayılan: 2)
  matchedEntityIds?: Set<string>; // Eşleşen varlık ID'lerini toplayan küme
}

/**
 * HTML veya düz metin içeriğini verilen evren varlıklarıyla tarar
 * ve kelimelerin etrafına interaktif, spoiler korumalı butonlar yerleştirir.
 * 
 * HTML etiketlerini (<...>) ve linkleri bozmaz, sadece metin düğümlerini işler.
 * Türkçe ve Unicode karakter sınırlarını (?<![\p{L}\p{N}]) dikkate alır.
 */
export function annotateHtmlWithLore(
  html: string,
  entities: InlineUniverseEntity[],
  options?: AnnotateLoreOptions
): string {
  if (!entities || entities.length === 0 || !html) return html;

  const maxPerEntity = options?.maxPerEntity ?? 2;
  const entityCounts: Record<string, number> = {};
  const matchedSet = options?.matchedEntityIds;

  // İsim uzunluğu 2'den büyük olanları al ve çok kelimeliler önce eşleşsin diye uzunluk sırasına göre diz
  const validEntities = entities
    .filter((e) => e.name && e.name.trim().length >= 2)
    .sort((a, b) => b.name.trim().length - a.name.trim().length);

  if (validEntities.length === 0) return html;

  // Küçük harfli isim -> Varlık haritası
  const entityMap = new Map<string, InlineUniverseEntity>();
  const patternParts: string[] = [];

  for (const ent of validEntities) {
    const key = ent.name.trim().toLowerCase();
    if (!entityMap.has(key)) {
      entityMap.set(key, ent);
      patternParts.push(escapeRegExp(ent.name.trim()));
    }
  }

  if (patternParts.length === 0) return html;

  // Regex:
  // 1. Grup: (<[^>]+>) -> HTML etiketleri (dokunulmayacak)
  // 2. Grup: Kelime eşleşmesi (Unicode sınırlarıyla)
  const regex = new RegExp(
    `(<[^>]+>)|(?<![\\p{L}\\p{N}])(${patternParts.join('|')})(?![\\p{L}\\p{N}])`,
    'gui'
  );

  return html.replace(regex, (match, tag, word) => {
    // HTML etiketi ise olduğu gibi bırak
    if (tag) return tag;

    if (word) {
      const lower = word.toLowerCase();
      const entity = entityMap.get(lower);
      if (entity) {
        const count = entityCounts[entity.id] || 0;
        if (count < maxPerEntity) {
          entityCounts[entity.id] = count + 1;
          if (matchedSet) matchedSet.add(entity.id);

          const roleLabel = entity.roleOrType ? ` (${entity.roleOrType})` : '';
          return `<button type="button" class="readixon-lore-entity inline-flex items-baseline px-1 py-0.5 mx-0.5 rounded-lg text-primary hover:text-primary font-semibold bg-primary/10 hover:bg-primary/20 border-b-2 border-dashed border-primary/50 transition-all duration-150 cursor-pointer no-zen-toggle" data-entity-id="${entity.id}" data-entity-type="${entity.type}" title="${entity.name}${roleLabel}">${match}</button>`;
        }
      }
    }

    return match;
  });
}

/**
 * Bir metin bloğunda veya bölüm içeriğinde geçen tüm evren varlıklarını tespit eder.
 */
export function extractMentionedEntities(
  fullText: string,
  entities: InlineUniverseEntity[]
): InlineUniverseEntity[] {
  if (!fullText || !entities || entities.length === 0) return [];

  const matchedSet = new Set<string>();
  const lowerText = fullText.toLowerCase();

  for (const ent of entities) {
    if (!ent.name || ent.name.trim().length < 2) continue;
    const nameLower = ent.name.trim().toLowerCase();
    
    // Basit kontrol veya regex kontrolü
    const regex = new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegExp(nameLower)}(?![\\p{L}\\p{N}])`, 'gui');
    if (regex.test(lowerText)) {
      matchedSet.add(ent.id);
    }
  }

  return entities.filter((e) => matchedSet.has(e.id));
}
