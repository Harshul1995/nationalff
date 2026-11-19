/* Contact + newsletter forms. Static hosting has no backend, so we post to FormSubmit,
   which emails the enquiry. First-ever submission needs a one-time activation click
   in the inbox (see README). */
(function () {
  'use strict';
  var FS = 'https://formsubmit.co/ajax/newnational_furnishing@yahoo.com';
  var FAIL = 'Sorry, we could not send your message. Please call us on +91 98252 90860 or +91 99989 70508.';
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
      var g = new FormData(f);
      g.delete('bot-field'); g.delete('_next');
      g.set('_captcha', 'false'); g.set('_template', 'table');
      g.set('_subject', isContact ? 'New enquiry - National Foam & Fabrics website' : 'Newsletter sign-up - National Foam & Fabrics');
      var em = f.querySelector('[name=email]'); if (em && em.value) g.set('_replyto', em.value);
      var ctl = window.AbortController ? new AbortController() : null;
      var to = setTimeout(function () { if (ctl) ctl.abort(); }, 20000);
      fetch(FS, { method: 'POST', headers: { Accept: 'application/json' }, body: g, signal: ctl ? ctl.signal : undefined })
        .then(function (r) {
          return r.json().catch(function () { return {}; }).then(function (d) {
            if (!r.ok || !(d.success === true || d.success === 'true')) {
              console.error('FormSubmit rejected the message:', r.status, d);   /* e.g. "needs Activation" */
              throw new Error('fs');
            }
          });
        })
        .then(function () { f.reset(); say(true, okMsg); })
        .catch(function (e) {
          if (e && e.message !== 'fs') console.error('Form send failed:', e);
          say(false, FAIL);
          if (!isContact || !st) return;
          /* Never lose a lead: offer the same enquiry, pre-filled, on WhatsApp. The form is not reset, so values are intact. */
          function v(n) { var x = f.querySelector('[name=' + n + ']'); return x ? x.value : ''; }
          var txt = 'Hello, I am ' + v('name') + '. ' + (v('interest') ? 'Interested in: ' + v('interest') + '. ' : '') + v('message') +
                    (v('phone') ? ' Phone: ' + v('phone') + '.' : '') + (v('email') ? ' Email: ' + v('email') : '');
          var a = document.createElement('a');
          a.href = 'https://wa.me/919825290860?text=' + encodeURIComponent(txt);
          a.target = '_blank'; a.rel = 'noopener'; a.textContent = 'Send this enquiry on WhatsApp instead';
          a.style.cssText = 'display:inline-block;margin-top:8px;font-weight:700;text-decoration:underline';
          st.appendChild(document.createElement('br')); st.appendChild(a);
        })
        .then(function () { clearTimeout(to); done(); });
    });
  });
})();
