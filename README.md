# National Foam & Fabrics – nationalrexine.in

Static site served by GitHub Pages (custom domain via `CNAME`).

## Contact + newsletter forms -> Yahoo inbox only
Enquiries are delivered ONLY to `newnational_furnishing@yahoo.com` (`js/forms.js`). The site tries, in order:
1. **Google Apps Script** (recommended, free, no activation email, no Yahoo app password) - setup below
2. **EmailJS** (optional) - fill `EMAILJS = {service, template, key}` in `js/forms.js`
3. **FormSubmit** (needs a one-time activation email to the Yahoo inbox; may be blocked by Yahoo or by ad blockers)
If all fail, the visitor gets a pre-filled WhatsApp link, so no enquiry is lost.

### Apps Script setup (5 minutes)
1. Go to script.google.com (signed in to any Google account) -> **New project**.
2. Delete the sample code, paste the contents of `tools/apps-script-mailer.gs`, click **Save**.
3. Pick the function `testSend` in the toolbar and click **Run**. Google asks for permission:
   Review permissions -> choose your account -> Advanced -> "Go to ... (unsafe)" -> Allow.
   A test email must arrive in the Yahoo inbox (check spam once; mark "Not spam").
4. **Deploy -> New deployment -> type: Web app** -> Execute as: **Me** -> Who has access: **Anyone** -> Deploy. Copy the **Web app URL** (ends in `/exec`).
5. In `js/forms.js` paste it: `var APPS_SCRIPT_URL = 'https://script.google.com/macros/s/.../exec';` then commit and push.
If you ever edit the script, use Deploy -> Manage deployments -> edit -> New version (the URL stays the same).
Limit: about 100 emails/day on a free Google account, far more than enquiries need.

### Debugging
Open the site with `?debug=1` at the end of the address (e.g. nationalrexine.in/?debug=1#contact), submit, and the
real error from each provider is printed under the form (also in the browser console, F12).

## Customer reviews ("Loved by our customers")
The Google rating panel stays solid in the middle and real customer reviews glide behind it, right to left,
continuously (desktop: one row; phones: a row above and a row below). It pauses when someone hovers or touches it,
via the small pause button, when the tab is hidden, and it respects "reduce motion" settings.
All reviews live in `data/reviews.json` (one entry per review, in the order they should appear):

    { "name": "Reviewer Name", "text": "Exactly what they wrote.", "when": "Nov 2023" }

- Keep the customer's exact words (spelling mistakes, emojis, Gujarati/Hindi all fine). Line breaks are kept.
- Only 5-star reviews are shown (add `"rating": 4` to an entry to hide it). Any number of reviews works.
- To add new ones: Google Maps -> your business -> Reviews, copy the new ones, add entries at the top of the file, commit and push.

## Instagram feed (optional)
`.github/workflows/update-live-data.yml` runs every 6 hours and writes `data/instagram-feed.json`.
Add the repo secret `BEHOLD_FEED_URL` (behold.so feed) in GitHub -> Settings -> Secrets and variables -> Actions.
Without it the Instagram section stays hidden. The Google rating card is static text ("Rated 5 stars on Google").

## Notes
- Linux is case-sensitive: keep file names and links identical in case.
- `pp.htm` / `term.htm` are redirect stubs for old URLs from the previous ASP.NET site.
