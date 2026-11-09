// Latest Instagram posts for the website, via a Behold JSON feed (behold.so, free plan works).
// Set ONE Netlify environment variable:  BEHOLD_FEED_URL = https://feeds.behold.so/XXXXXXXX
// Without it this returns 503 and the website just shows its "Follow us on Instagram" card.
const TTL = 6 * 60 * 60 * 1000;           // fetch from Behold at most once every 6 hours
let cache = null;
const hdr = (extra) => Object.assign({ 'Content-Type': 'application/json' }, extra || {});
const OK = { 'Cache-Control': 'public, max-age=1800', 'Netlify-CDN-Cache-Control': 'public, max-age=21600, stale-while-revalidate=86400' };
exports.handler = async () => {
  const url = process.env.BEHOLD_FEED_URL;
  if (!url || !/^https:\/\/feeds\.behold\.so\//.test(url)) return { statusCode: 503, headers: hdr({ 'Cache-Control': 'no-store' }), body: JSON.stringify({ error: 'not_configured' }) };
  if (cache && Date.now() - cache.t < TTL) return { statusCode: 200, headers: hdr(OK), body: cache.body };
  try {
    const r = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!r.ok) throw new Error('behold_' + r.status);
    const d = await r.json();
    const list = d.posts || d.media || [];
    const posts = list.map(p => {
      const s = p.sizes && (p.sizes.medium || p.sizes.small || p.sizes.large || p.sizes.full);
      const video = String(p.mediaType || '').toUpperCase() === 'VIDEO';
      const img = (s && s.mediaUrl) || p.thumbnailUrl || (!video ? p.mediaUrl : '');
      return { id: p.id, link: p.permalink, img, caption: (p.prunedCaption || p.caption || '').slice(0, 140), video };
    }).filter(p => p.img && p.link).slice(0, 6);
    const body = JSON.stringify({ username: d.username || 'national_foam_fabrics', posts });
    cache = { t: Date.now(), body };
    return { statusCode: 200, headers: hdr(OK), body };
  } catch (e) {
    if (cache) return { statusCode: 200, headers: hdr(OK), body: cache.body };
    return { statusCode: 502, headers: hdr({ 'Cache-Control': 'no-store' }), body: JSON.stringify({ error: String(e.message || e) }) };
  }
};
