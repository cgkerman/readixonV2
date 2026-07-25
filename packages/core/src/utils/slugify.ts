export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .normalize('NFD')                   // split accented characters into their base characters and diacritical marks
    .replace(/[\u0300-\u036f]/g, '')   // remove all the accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, '')       // remove invalid chars (including :, ;)
    .replace(/\s+/g, '-')              // collapse whitespace and replace by -
    .replace(/-+/g, '-');              // collapse dashes
}
