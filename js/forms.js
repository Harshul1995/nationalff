/* Contact + newsletter forms (static site, no backend). Everything is delivered ONLY to TO (Yahoo).
   The site tries these in order and stops at the first that works:
     1. Google Apps Script  (recommended - see tools/apps-script-mailer.gs and README)
     2. EmailJS             (optional)
     3. FormSubmit          (needs a one-time activation email)
   If all fail the visitor gets a pre-filled WhatsApp link, so no enquiry is lost.
   Debug: open the site with ?debug=1 at the end of the address - the real error is shown under the form. */
(function () {
  'use strict';
  var TO = 'newnational_furnishing@yahoo.com';
  var APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyE_Dh7rlZxezghLY6tMvsVT_4WS6wniQgH9Q1rDjUVtNs3lk2788VrYMcR_CQhPaOVlQ/exec';                                 /* <- paste the Apps Script "Web app" URL (https://script.google.com/macros/s/.../exec) */
  var EMAILJS = { service: '', template: '', key: '' };     /* <- optional: EmailJS Service ID, Template ID, Public Key */
  var EJ_URL = 'https://api.emailjs.com/api/v1.0/email/send';
  var FS = 'https://formsubmit.co/ajax/' + TO;
  var FAIL = 'Sorry, we could not send your message. Please call us on +91 98252 90860 or +91 99989 70508.';
  var DEBUG = /[?&]debug=1/.test(location.search);

  function post(url, opts, ms) {
    var ctl = window.AbortController ? new AbortController() : null;
    var to = setTimeout(function () { if (ctl) ctl.abort(); }, ms || 20000);
    opts.signal = ctl ? ctl.signal : undefined;
    return fetch(url, opts).then(function (r) { clearTimeout(to); return r; }, function (e) { clearTimeout(to); throw e; });
  }
  function val(f, n) { var x = f.querySelector('[name=' + n + ']'); return x ? x.value : ''; }
  function subjectFor(isContact) { return isContact ? 'New enquiry - National Foam & Fabrics website' : 'Newsletter sign-up - National Foam & Fabrics'; }
  function fields(f, isContact) {
    return { subject: subjectFor(isContact), name: val(f, 'name') || '(newsletter sign-up)', email: val(f, 'email'), reply_to: val(f, 'email'),
             phone: val(f, 'phone') || '-', interest: val(f, 'interest') || '-', message: isContact ? val(f, 'message') : 'Newsletter sign-up' };
  }

  /* each sender returns a promise; it rejects with Error(reason) on any failure */
  function sendAppsScript(f, isContact, log) {
    var p = fields(f, isContact); p.type = isContact ? 'contact' : 'newsletter';
    return post(APPS_SCRIPT_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(p) })
      .then(function (r) { return r.json(); })
      .then(function (d) { if (!d || d.ok !== true) throw new Error('script said: ' + JSON.stringify(d)); });
  }
  function sendEmailJS(f, isContact, log) {
    return post(EJ_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ service_id: EMAILJS.service, template_id: EMAILJS.template, user_id: EMAILJS.key, template_params: fields(f, isContact) }) })
      .then(function (r) { if (r.ok) return; return r.text().then(function (t) { throw new Error('HTTP ' + r.status + ' ' + t); }); });
  }
  function sendFormSubmit(f, isContact, log) {
    var g = new FormData(f);
    g.delete('bot-field'); g.delete('_next');
    g.set('_captcha', 'false'); g.set('_template', 'table'); g.set('_subject', subjectFor(isContact));
    var em = val(f, 'email'); if (em) g.set('_replyto', em);
    return post(FS, { method: 'POST', headers: { Accept: 'application/json' }, body: g }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) {
        if (!r.ok || !(d.success === true || d.success === 'true')) throw new Error('HTTP ' + r.status + ' ' + JSON.stringify(d));
      });
    });
  }

  var forms = document.querySelectorAll('form[data-nrh]');
  Array.prototype.forEach.call(forms, function (f) {
    f.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (!f.checkValidity()) { f.reportValidity(); return; }
      var isContact = f.getAttribute('name') === 'contact';
      var btn = f.querySelector('button[type=submit],input[type=submit]');
      var st = f.querySelector('.nrh-status');
      var label = btn ? (btn.tagName === 'INPUT' ? btn.value : btn.textContent) : '';
      function setBtn(t) { if (!btn) return; if (btn.tagName === 'INPUT') btn.value = t; else btn.textContent = t; }
      function say(ok, m) { if (!st) return; st.className = 'nrh-status ' + (ok ? 'ok' : 'err'); st.textContent = m; }
      function done() { if (btn) { btn.disabled = false; setBtn(label); } }
      var okMsg = isContact ? 'Thank you! Your message has been sent. We will get back to you shortly.' : 'Thank you for subscribing!';
      var hp = f.querySelector('[name=bot-field]');
      if (hp && hp.value) { f.reset(); say(true, okMsg); return; }          /* bot: pretend success */
      if (btn) { btn.disabled = true; setBtn('Sending\u2026'); }
      say(true, '');

      var chain = [];
      if (APPS_SCRIPT_URL) chain.push(['Google Apps Script', sendAppsScript]);
      if (EMAILJS.service && EMAILJS.template && EMAILJS.key) chain.push(['EmailJS', sendEmailJS]);
      chain.push(['FormSubmit', sendFormSubmit]);
      var errors = [];
      function run(i) {
        return chain[i][1](f, isContact).then(function () { if (DEBUG) console.log('Sent via', chain[i][0]); }, function (e) {
          var msg = chain[i][0] + ': ' + (e && e.message ? e.message : e); errors.push(msg); console.error('Send failed -', msg);
          if (i + 1 < chain.length) return run(i + 1);
          throw e;
        });
      }
      run(0).then(function () { f.reset(); say(true, okMsg); })
        .catch(function () {
          say(false, FAIL);
          if (st && DEBUG) { var pre = document.createElement('div'); pre.style.cssText = 'font:12px/1.4 monospace;color:#444;margin-top:8px;text-align:left;white-space:pre-wrap'; pre.textContent = 'DEBUG\n' + errors.join('\n'); st.appendChild(pre); }
          if (!isContact || !st) return;
          /* Never lose a lead: offer the same enquiry, pre-filled, on WhatsApp. The form is not reset, so values are intact. */
          var txt = 'Hello, I am ' + val(f, 'name') + '. ' + (val(f, 'interest') ? 'Interested in: ' + val(f, 'interest') + '. ' : '') + val(f, 'message') +
                    (val(f, 'phone') ? ' Phone: ' + val(f, 'phone') + '.' : '') + (val(f, 'email') ? ' Email: ' + val(f, 'email') : '');
          var a = document.createElement('a');
          a.href = 'https://wa.me/919825290860?text=' + encodeURIComponent(txt);
          a.target = '_blank'; a.rel = 'noopener'; a.textContent = 'Send this enquiry on WhatsApp instead';
          a.style.cssText = 'display:inline-block;margin-top:8px;font-weight:700;text-decoration:underline';
          st.appendChild(document.createElement('br')); st.appendChild(a);
        })
        .then(done);
    });
  });
})();
