/*!
 * auth-dialog.js — vanilla JS sign-in dialog, IPROL styled.
 * Opens as soon as it runs. No dependencies, nothing global.
 *
 * Paste it as an INLINE script so .html()/.innerHTML runners execute it:
 *   el.innerHTML = '<script>' + fileContents + '<' + '/script>';
 * or load the file normally with a created <script> element.
 */
(function () {
  'use strict';

  var CONFIG = {
    title: 'Sign in',
    message: 'Please sign in to continue processing mail.',
    authUrl: '/api/auth',               // POSTed { username, password }
    failedMessage: 'Incorrect username or password.',
    redirectTo: null,                   // URL to go to after sign in, or null
    dismissible: false                  // true = allow Cancel / Esc
  };

  // Don't open twice if the snippet gets injected again
  if (document.getElementById('iad')) return;

  var CSS =
    '#iad{padding:0;border:0;border-radius:2px;width:min(440px,calc(100vw - 32px));' +
    'background:#fff;color:#1e1e1e;font-family:inherit;box-shadow:0 10px 30px rgba(0,0,0,.25)}' +
    '#iad::backdrop{background:rgba(30,30,30,.55)}' +
    '#iad .h{background:#da202a;color:#fff;display:flex;align-items:center;gap:12px;' +
    'padding:16px 20px;border-bottom:6px solid #c00f1a}' +
    '#iad .h svg{width:26px;height:26px;fill:#fff}' +
    '#iad h2{margin:0;font-size:1.35rem;font-weight:700}' +
    '#iad .x{margin-left:auto;background:none;border:0;color:#fff;cursor:pointer;font-size:1.6rem;line-height:1}' +
    '#iad .b{padding:20px 24px 8px}' +
    '#iad .msg{margin:0 0 18px;padding:10px 14px;border-left:4px solid #0a7cc1;background:#f5f9fc;color:#555}' +
    '#iad label{display:block;font-weight:700;margin:0 0 6px}' +
    '#iad input{width:100%;box-sizing:border-box;font:inherit;font-size:1.05rem;padding:10px 14px;' +
    'border:1px solid #cfcfcf;border-radius:2px;margin-bottom:16px}' +
    '#iad input:focus{outline:none;border-color:#da202a;box-shadow:0 0 0 3px rgba(218,32,42,.15)}' +
    '#iad .err{display:none;margin:0 0 16px;padding:10px 14px;border-left:4px solid #da202a;' +
    'background:#fdeeee;color:#c00f1a;font-weight:700}' +
    '#iad .err.on{display:block}' +
    '#iad .f{display:flex;justify-content:flex-end;gap:10px;padding:14px 24px 20px}' +
    '#iad button.btn{font:inherit;font-size:1.05rem;font-weight:700;padding:10px 22px;border-radius:2px;' +
    'cursor:pointer;border:2px solid #da202a;min-width:110px}' +
    '#iad .go{background:#da202a;color:#fff}#iad .go:hover{background:#c00f1a}' +
    '#iad .cancel{background:#fff;color:#da202a}' +
    '#iad button[disabled]{opacity:.6;cursor:default}';

  var LOCK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1a5 5 0 0 0-5 5v4H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-1V6a5 5 0 0 0-5-5zm-3 5a3 3 0 1 1 6 0v4H9V6z"/></svg>';

  var style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  var dlg = document.createElement('dialog');
  dlg.id = 'iad';
  dlg.innerHTML =
    '<div class="h">' + LOCK + '<h2>' + CONFIG.title + '</h2>' +
      (CONFIG.dismissible ? '<button type="button" class="x" aria-label="Close">×</button>' : '') +
    '</div>' +
    '<form>' +
      '<div class="b">' +
        '<p class="msg">' + CONFIG.message + '</p>' +
        '<div class="err" role="alert"></div>' +
        '<label for="iad-u">Username</label>' +
        '<input id="iad-u" name="username" type="text" autocomplete="username" required>' +
        '<label for="iad-p">Password</label>' +
        '<input id="iad-p" name="password" type="password" autocomplete="current-password" required>' +
      '</div>' +
      '<div class="f">' +
        (CONFIG.dismissible ? '<button type="button" class="btn cancel">Cancel</button>' : '') +
        '<button type="submit" class="btn go">Sign in</button>' +
      '</div>' +
    '</form>';
  document.body.appendChild(dlg);

  var form = dlg.querySelector('form');
  var user = dlg.querySelector('#iad-u');
  var pass = dlg.querySelector('#iad-p');
  var err  = dlg.querySelector('.err');
  var go   = dlg.querySelector('.go');
  var busy = false;

  function fail(msg) { err.textContent = msg; err.classList.add('on'); }

  function close() {
    pass.value = '';
    if (dlg.open) dlg.close();
    dlg.remove();
    style.remove();
  }

  if (CONFIG.dismissible) {
    dlg.querySelector('.x').onclick = close;
    dlg.querySelector('.cancel').onclick = close;
    dlg.addEventListener('cancel', function (e) { e.preventDefault(); close(); });
  } else {
    dlg.addEventListener('cancel', function (e) { e.preventDefault(); });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (busy) return;
    err.classList.remove('on');

    var creds = { username: user.value.trim(), password: pass.value };
    if (!creds.username || !creds.password) { fail('Please enter your username and password.'); return; }

    busy = true;
    go.disabled = true;
    go.textContent = 'Signing in…';

    fetch(CONFIG.authUrl, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(creds)
    }).then(function (res) {
      if (!res.ok) throw new Error(CONFIG.failedMessage);
      document.dispatchEvent(new CustomEvent('iprol:authenticated'));
      if (CONFIG.redirectTo) { window.location.assign(CONFIG.redirectTo); return; }
      close();
    }).catch(function (ex) {
      busy = false;
      go.disabled = false;
      go.textContent = 'Sign in';
      pass.value = '';
      fail(ex.message || 'Sign in failed. Please try again.');
      pass.focus();
    });
  });

  dlg.showModal();
  user.focus();
})();
