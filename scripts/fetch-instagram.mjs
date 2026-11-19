// Runs in GitHub Actions. Writes data/instagram-feed.json from a Behold feed (behold.so, free plan works).
// Needs the repo secret BEHOLD_FEED_URL (https://feeds.behold.so/XXXX). Without it this step is skipped
// and the Instagram section simply stays hidden on the site.
import { writeFileSync } from 'node:fs';
const url = process.env.BEHOLD_FEED_URL;
if (!url) { console.log('BEHOLD_FEED_URL not set - skipping Instagram update.'); process.exit(0); }
if (!/^https:\/\/feeds\.behold\.so\//.test(url)) { console.error('BEHOLD_FEED_URL must start with https://feeds.behold.so/'); process.exit(1); }
const r = await fetch(url, { headers: { Accept: 'application/json' } });
if (!r.ok) { console.error('Behold error', r.status); process.exit(1); }
const d = await r.json();
const posts = (d.posts || d.media || []).map(p => {
  const s = p.sizes && (p.sizes.medium || p.sizes.small || p.sizes.large || p.sizes.full);
  const video = String(p.mediaType || '').toUpperCase() === 'VIDEO';
  const img = (s && s.mediaUrl) || p.thumbnailUrl || (!video ? p.mediaUrl : '');
  return { id: p.id, link: p.permalink, img, caption: (p.prunedCaption || p.caption || '').slice(0, 140), video };
}).filter(p => p.img && p.link).slice(0, 6);
writeFileSync('data/instagram-feed.json', JSON.stringify({ username: d.username || 'national_foam_fabrics', posts }));
console.log('Saved', posts.length, 'posts');
