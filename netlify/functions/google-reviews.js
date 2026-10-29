// Live Google rating + reviews for the website. Needs two Netlify environment variables:
//   GOOGLE_MAPS_API_KEY  (Google Cloud key with "Places API (New)" enabled)
//   GOOGLE_PLACE_ID      (your business Place ID, starts with ChIJ...)
// Without them this returns 503 and the website simply keeps showing its built-in rating card.
const TTL = 6 * 60 * 60 * 1000;
let cache = null;
const J = (code, body, extra) => ({ statusCode: code, headers: Object.assign({ 'Content-Type': 'application/json' }, extra || {}), body: JSON.stringify(body) });
const OK = { 'Cache-Control': 'public, max-age=1800', 'Netlify-CDN-Cache-Control': 'public, max-age=21600, stale-while-revalidate=86400' };
exports.handler = async () => {
  const key = process.env.GOOGLE_MAPS_API_KEY, id = process.env.GOOGLE_PLACE_ID;
  if (!key || !id) return J(503, { error: 'not_configured' }, { 'Cache-Control': 'no-store' });
  if (cache && Date.now() - cache.t < TTL) return { statusCode: 200, headers: Object.assign({ 'Content-Type': 'application/json' }, OK), body: cache.body };
  try {
    const r = await fetch('https://places.googleapis.com/v1/places/' + encodeURIComponent(id), {
      headers: { 'X-Goog-Api-Key': key, 'X-Goog-FieldMask': 'rating,userRatingCount,googleMapsUri,reviews.rating,reviews.text,reviews.originalText,reviews.relativePublishTimeDescription,reviews.authorAttribution' }
    });
    if (!r.ok) throw new Error('google_' + r.status);
    const d = await r.json();
    const out = {
      rating: d.rating, count: d.userRatingCount, url: d.googleMapsUri,
      reviews: (d.reviews || []).slice(0, 6).map(v => ({
        author: v.authorAttribution && v.authorAttribution.displayName, authorUrl: v.authorAttribution && v.authorAttribution.uri,
        photo: v.authorAttribution && v.authorAttribution.photoUri, rating: v.rating, when: v.relativePublishTimeDescription,
        text: (v.text && v.text.text) || (v.originalText && v.originalText.text) || ''
      }))
    };
    cache = { t: Date.now(), body: JSON.stringify(out) };
    return { statusCode: 200, headers: Object.assign({ 'Content-Type': 'application/json' }, OK), body: cache.body };
  } catch (e) {
    if (cache) return { statusCode: 200, headers: Object.assign({ 'Content-Type': 'application/json' }, OK), body: cache.body };
    return J(502, { error: String(e.message || e) }, { 'Cache-Control': 'no-store' });
  }
};
