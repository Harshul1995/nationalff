/* National Foam & Fabrics - website form mailer (Google Apps Script).
   Receives the website's enquiry and emails it ONLY to the Yahoo address below. */
var TO = 'newnational_furnishing@yahoo.com';

function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents);
    var email = String(d.email || '').slice(0, 200);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return out({ ok: false, error: 'invalid email' });
    var isContact = d.type === 'contact';
    var subject = isContact ? 'New enquiry - National Foam & Fabrics website' : 'Newsletter sign-up - National Foam & Fabrics';
    var body = (isContact
      ? 'Name: ' + clean(d.name, 100) + '\nEmail: ' + email + '\nPhone: ' + clean(d.phone, 40) +
        '\nInterested in: ' + clean(d.interest, 100) + '\n\nMessage:\n' + clean(d.message, 3000)
      : 'New newsletter sign-up\nEmail: ' + email) + '\n\n-- sent from nationalrexine.in';
    MailApp.sendEmail({ to: TO, subject: subject, body: body, replyTo: email, name: 'National Foam & Fabrics website' });
    return out({ ok: true });
  } catch (err) {
    return out({ ok: false, error: String(err) });
  }
}
function clean(s, n) { return String(s == null ? '' : s).slice(0, n); }
function out(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

/* Run this once from the editor (Run button) to grant permission and to send yourself a test email. */
function testSend() { MailApp.sendEmail(TO, 'Test from website mailer', 'If you can read this, the mailer works.'); }
