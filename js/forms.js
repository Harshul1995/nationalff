/* Contact + newsletter forms (static site, no backend).
   Delivery goes ONLY to the Yahoo inbox below.
   Option A (recommended): EmailJS sends through the Yahoo account itself. Fill in the three values below.
   Option B (automatic backup): FormSubmit, which needs a one-time activation email. */
(function () {
  'use strict';
  var TO = 'newnational_furnishing@yahoo.com';
  var EMAILJS = { service: '', template: '', key: '' };   /* <- paste Service ID, Template ID, Public Key from EmailJS */
  var EJ_URL = 'https://api.emailjs.com/api/v1.0/email/send';
  var FS = 'https://formsubmit.co/ajax/' + TO;
  var FAIL = 'Sorry, we could not send your message. Please call us on +91 98252 90860 or +91 99989 70508.';

  function post(url, opts, ms) {
    var ctl = window.AbortController ? new AbortController() : null;
    var to = setTimeout(function () { if (ctl) ctl.abort(); }, ms || 20000);
    opts.signal = ctl ? ctl.signal : undefined;
    return fetch(url, opts).then(function (r) { clearTimeout(to); return r; }, function (e) { clearTimeout(to); throw e; });
  }
  function val(f, n) { var x = f.querySelector('[name=' + n + ']'); return x ? x.value : ''; }
  function subjectFor(isContact) { return isContact ? 'New enquiry - National Foam & Fabrics website' : 'Newsletter sign-up - National Foam & Fabrics'; }

  function sendEmailJS(f, isContact) {
    var params = { subject: subjectFor(isContact), name: val(f, 'name') || '(newsletter sign-up)', email: val(f, 'email'), reply_to: val(f, 'email'),
                   phone: val(f, 'phone') || '-', interest: val(f, 'interest') || '-', message: isContact ? val(f, 'message') : 'Newsletter sign-up' };
    return post(EJ_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ service_id: EMAILJS.service, template_id: EMAILJS.template, user_id: EMAILJS.key, template_params: params }) })
      .then(function (r) {
        if (r.ok) return;
        return r.text().then(function (t) { console.error('EmailJS rejected the message:', r.status, t); throw new Error('ej'); });
      });
  }
  function sendFormSubmit(f, isContact) {
    var g = new FormData(f);
    g.delete('bot-field'); g.delete('_next');
    g.set('_captcha', 'false'); g.set('_template', 'table'); g.set('_subject', subjectFor(isContact));
    var em = val(f, 'email'); if (em) g.set('_replyto', em);
    return post(FS, { method: 'POST', headers: { Accept: 'application/json' }, body: g }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) {
        if (!r.ok || !(d.success === true || d.success === 'true')) { console.error('FormSubmit rejected the message:', r.status, d); throw new Error('fs'); }
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
      var useEJ = EMAILJS.service && EMAILJS.template && EMAILJS.key;
      var p = useEJ ? sendEmailJS(f, isContact).catch(function () { return sendFormSubmit(f, isContact); }) : sendFormSubmit(f, isContact);
      p.then(function () { f.reset(); say(true, okMsg); })
        .catch(function (e) {
          if (e && e.message !== 'fs' && e.message !== 'ej') console.error('Form send failed:', e);
          say(false, FAIL);
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
