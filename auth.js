/*!
 * auth-dialog.js — IPROL sign-in popup (display only, no network logic).
 * Styles applied via element.style (CSSOM) so a strict style-src CSP can't
 * strip them, and so host-page CSS can't override them. Logs for debugging.
 */
(function () {
  'use strict';
  console.log('[auth] 1. script started');

  try {
    if (document.getElementById('iad')) { console.log('[auth] already present'); return; }

    // Object.assign(el.style, {...}) uses CSSOM setters — NOT blocked by CSP style-src
    var css = function (el, o) { Object.assign(el.style, o); return el; };

    var RED = '#da202a', RED_D = '#c00f1a', BLUE = '#0a7cc1';

    /* Backdrop (plain div, dims the page; dialog sits above it in the top layer) */
    var back = css(document.createElement('div'), {
      position: 'fixed', inset: '0', background: 'rgba(0,0,0,.7)',
      backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', zIndex: '2147483646'
    });
    back.id = 'iad-back';
    document.body.appendChild(back);

    /* Dialog */
    var dlg = document.createElement('dialog');
    dlg.id = 'iad';
    css(dlg, {
      padding: '0', border: '0', borderRadius: '2px', width: 'min(440px, calc(100vw - 32px))',
      maxWidth: 'calc(100vw - 32px)', background: '#fff', color: '#1e1e1e',
      fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '16px',
      boxShadow: '0 10px 30px rgba(0,0,0,.35)', zIndex: '2147483647'
    });
    console.log('[auth] 2. elements building');

    /* Header */
    var head = css(document.createElement('div'), {
      background: RED, color: '#fff', display: 'flex', alignItems: 'center', gap: '12px',
      padding: '16px 20px', borderBottom: '6px solid ' + RED_D, boxSizing: 'border-box'
    });
    var svgNS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', '26'); svg.setAttribute('height', '26');  // sized via attrs, not CSS
    svg.setAttribute('fill', '#fff');
    css(svg, { flex: 'none' });
    var path = document.createElementNS(svgNS, 'path');
    path.setAttribute('d', 'M12 1a5 5 0 0 0-5 5v4H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-1V6a5 5 0 0 0-5-5zm-3 5a3 3 0 1 1 6 0v4H9V6z');
    svg.appendChild(path);
    var h2 = document.createElement('h2');
    h2.textContent = 'Sign in';
    css(h2, { margin: '0', fontSize: '1.35rem', fontWeight: '700', color: '#fff' });
    head.appendChild(svg); head.appendChild(h2);

    /* Form + body */
    var form = document.createElement('form');
    var body = css(document.createElement('div'), { padding: '20px 24px 8px', boxSizing: 'border-box' });

    var msg = document.createElement('p');
    msg.textContent = 'Your session has expired, please login to continue';
    css(msg, {
      margin: '0 0 18px', padding: '10px 14px', borderLeft: '4px solid ' + BLUE,
      background: '#f5f9fc', color: '#555', fontSize: '.98rem', lineHeight: '1.4'
    });

    function field(labelText, type) {
      var wrap = document.createElement('div');
      var label = document.createElement('label');
      label.textContent = labelText;
      css(label, { display: 'block', fontWeight: '700', margin: '0 0 6px' });
      var input = document.createElement('input');
      input.type = type;
      css(input, {
        width: '100%', boxSizing: 'border-box', font: 'inherit', fontSize: '1.05rem',
        padding: '10px 14px', border: '1px solid #cfcfcf', borderRadius: '2px', margin: '0 0 16px'
      });
      input.addEventListener('focus', function () {
        css(input, { borderColor: RED, outline: 'none', boxShadow: '0 0 0 3px rgba(218,32,42,.15)' });
      });
      input.addEventListener('blur', function () {
        css(input, { borderColor: '#cfcfcf', boxShadow: 'none' });
      });
      wrap.appendChild(label); wrap.appendChild(input);
      return { wrap: wrap, input: input };
    }

    var u = field('Username', 'text');
    var p = field('Password', 'password');
    body.appendChild(msg); body.appendChild(u.wrap); body.appendChild(p.wrap);

    /* Footer */
    var foot = css(document.createElement('div'), {
      display: 'flex', justifyContent: 'flex-end', padding: '14px 24px 20px', boxSizing: 'border-box'
    });
    var go = document.createElement('button');
    go.type = 'submit'; go.textContent = 'Sign in';
    css(go, {
      font: 'inherit', fontSize: '1.05rem', fontWeight: '700', padding: '10px 22px',
      borderRadius: '2px', cursor: 'pointer', border: '2px solid ' + RED,
      background: RED, color: '#fff', minWidth: '110px'
    });
    go.addEventListener('mouseenter', function () { css(go, { background: RED_D, borderColor: RED_D }); });
    go.addEventListener('mouseleave', function () { css(go, { background: RED, borderColor: RED }); });
    foot.appendChild(go);

    form.appendChild(body); form.appendChild(foot);
    dlg.appendChild(head); dlg.appendChild(form);
    document.body.appendChild(dlg);
    console.log('[auth] 3. dialog added to page');

    console.log('[auth] 4. typeof showModal =', typeof dlg.showModal);
    if (typeof dlg.showModal === 'function') {
      dlg.showModal();
      console.log('[auth] 5. showModal() called, open =', dlg.open);
    } else {
      css(dlg, { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' });
      dlg.setAttribute('open', '');
      console.log('[auth] 5. no <dialog> support — fallback positioning used');
    }

    function cleanup() { dlg.remove(); back.remove(); }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      console.log('[auth] submit — username =', u.input.value);
      // no network logic yet; sign-in call goes here later
    });

    u.input.focus();
    console.log('[auth] 6. done — styled popup should be visible');
  } catch (err) {
    console.log('[auth] ERROR:', err && err.message, err);
  }
})();
