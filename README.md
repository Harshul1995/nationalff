# National Foam & Fabrics – nationalrexine.in

Static site served by GitHub Pages (custom domain via `CNAME`).

## Contact + newsletter forms
Forms post to FormSubmit (`js/forms.js`) which emails `newnational_furnishing@yahoo.com`.
**One-time activation:** submit the form once on the live site, then open the email from FormSubmit
(check Yahoo spam) and click *Activate*. Until then submissions are rejected (see browser console).
Optional: use the random alias URL FormSubmit gives you instead of the email address, in `js/forms.js`
(`FS`) and in the `action="https://formsubmit.co/..."` of each form, so the address is not public.

## Instagram feed (optional)
`.github/workflows/update-live-data.yml` runs every 6 hours and writes `data/instagram-feed.json`.
Add the repo secret `BEHOLD_FEED_URL` (behold.so feed) in GitHub -> Settings -> Secrets and variables -> Actions.
Without it the Instagram section stays hidden. The Google rating card is static text ("Rated 5 stars on Google").

## Notes
- Linux is case-sensitive: keep file names and links identical in case.
- `pp.htm` / `term.htm` are redirect stubs for old URLs from the previous ASP.NET site.
