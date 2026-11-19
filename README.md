# National Foam & Fabrics – nationalrexine.in

Static site served by GitHub Pages (custom domain via `CNAME`).

## Contact + newsletter forms -> Yahoo inbox only
Enquiries go to `newnational_furnishing@yahoo.com` and nowhere else (`js/forms.js`).

**Recommended: EmailJS (sends through the Yahoo account itself, no activation email)**
1. Yahoo Account Security -> turn on 2-step verification -> *Generate app password* (name it "website").
2. emailjs.com -> sign up -> Email Services -> Add New Service -> Yahoo -> enter the Yahoo address + app password -> Create. Copy the **Service ID**.
3. Email Templates -> Create New Template:
   - To Email: `newnational_furnishing@yahoo.com`  | Reply To: `{{reply_to}}`  | Subject: `{{subject}}`
   - Content:
     ```
     Name: {{name}}
     Email: {{email}}
     Phone: {{phone}}
     Interested in: {{interest}}

     {{message}}
     ```
   Copy the **Template ID**.
4. Account -> General -> copy the **Public Key**.
5. In `js/forms.js` fill `EMAILJS = { service: '...', template: '...', key: '...' }`, commit, push, send a test.

**Backup (automatic): FormSubmit.** Used when EmailJS is not filled in or fails. It needs a one-time activation
email sent to the Yahoo inbox (check spam); until activated it rejects messages.
If both fail, the visitor sees a pre-filled "Send on WhatsApp" link, so no enquiry is lost.
Debug: open the browser console (F12) and submit - the exact error is printed.

## Instagram feed (optional)
`.github/workflows/update-live-data.yml` runs every 6 hours and writes `data/instagram-feed.json`.
Add the repo secret `BEHOLD_FEED_URL` (behold.so feed) in GitHub -> Settings -> Secrets and variables -> Actions.
Without it the Instagram section stays hidden. The Google rating card is static text ("Rated 5 stars on Google").

## Notes
- Linux is case-sensitive: keep file names and links identical in case.
- `pp.htm` / `term.htm` are redirect stubs for old URLs from the previous ASP.NET site.
