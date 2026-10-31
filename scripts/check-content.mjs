import { readFileSync, existsSync } from 'node:fs';

const content = JSON.parse(readFileSync('public/content/works.json', 'utf8'));
const errors = [];
const english = (value, location) => {
  if (typeof value !== 'string' || !value.trim()) errors.push(`${location}: missing English translation`);
  else if (/\p{Script=Han}/u.test(value)) errors.push(`${location}: English copy contains Chinese text`);
};
const asset = (value, location) => {
  if (value?.startsWith('/') && !existsSync(`public${value}`)) errors.push(`${location}: missing ${value}`);
};
const ids = new Set();
for (const work of content.works) {
  if (ids.has(String(work.id))) errors.push(`Duplicate project ID: ${work.id}`);
  ids.add(String(work.id));
  for (const field of ['title', 'category', 'description', 'client']) {
    if (work[field]) english(work[`${field}_en`], `${work.id}.${field}_en`);
  }
  if (work.detail_content?.full_desc) english(work.detail_content.full_desc_en, `${work.id}.full_desc_en`);
  asset(work.image, `${work.id}.image`);
  for (const [index, image] of (work.detail_content?.images || []).entries()) {
    asset(image.url, `${work.id}.images[${index}]`);
    if (image.alt) english(image.alt_en, `${work.id}.images[${index}].alt_en`);
  }
}
for (const [index, slide] of content.hero_images.entries()) {
  english(slide.alt_en, `hero_images[${index}].alt_en`);
  asset(slide.image, `hero_images[${index}].image`);
  if (slide.project_id && !ids.has(String(slide.project_id))) errors.push(`Unknown hero project: ${slide.project_id}`);
}
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`Content check passed: ${ids.size} bilingual projects, ${content.hero_images.length} bilingual slides and all image paths.`);
