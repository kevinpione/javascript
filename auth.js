/*!
 * auth-dialog.js — IPROL sign-in popup (display only, no network logic).
 * Opens as soon as it runs. Heavy console logging for debugging.
 */
(function () {
  'use strict';
  console.log('[auth] 1. script started');

  try {
    if (document.getElementById('iad')) {
      console.log('[auth] already present, not opening again');
      return;
    }

    var CSS =
      '#iad{padding:0;border:0;border-radius:2px;width:min(440px,calc(100vw - 32px));' +
      'background:#fff;color:#1e1e1e;font-family:inherit;box-shadow:0 10px 30px rgba(0,0,0,.25)}' +
      '#iad::backdrop{background:rgba(30,30,30,.55)}' +
      '#iad .h{background:#da202a;color:#fff;display:flex;align-items:center;gap:12px;' +
      'padding:16px 20px;border-bottom:6px solid #c00f1a}' +
      '#iad .h svg{width:26px;height:26px;fill:#fff}' +
      '#iad h2{margin:0;font-size:1.35rem;font-weight:700}' +
      '#iad .b{padding:20px 24px 8px}' +
      '#iad .msg{margin:0 0 18px;padding:10px 14px;border-left:4px solid #0a7cc1;background:#f5f9fc;color:#555}' +
      '#iad label{display:block;font-weight:700;margin:0 0 6px}' +
      '#iad input{width:100%;box-sizing:border-box;font:inherit;font-size:1.05rem;padding:10px 14px;' +
      'border:1px solid #cfcfcf;border-radius:2px;margin-bottom:16px}' +
      '#iad input:focus{outline:none;border-color:#da202a;box-shadow:0 0 0 3px rgba(218,32,42,.15)}' +
      '#iad .f{display:flex;justify-content:flex-end;gap:10px;padding:14px 24px 20px}' +
      '#iad button.btn{font:inherit;font-size:1.05rem;font-weight:700;padding:10px 22px;border-radius:2px;' +
      'cursor:pointer;border:2px solid #da202a;min-width:110px;background:#da202a;color:#fff}' +
      '#iad button.btn:hover{background:#c00f1a}';

    var LOCK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1a5 5 0 0 0-5 5v4H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-1V6a5 5 0 0 0-5-5zm-3 5a3 3 0 1 1 6 0v4H9V6z"/></svg>';

    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);
    console.log('[auth] 2. styles injected');

    var dlg = document.createElement('dialog');
    dlg.id = 'iad';
    dlg.innerHTML =
      '<div class="h">' + LOCK + '<h2>Sign in</h2></div>' +
      '<form>' +
        '<div class="b">' +
          '<p class="msg">Please sign in to continue processing mail.</p>' +
          '<label for="iad-u">Username</label>' +
          '<input id="iad-u" type="text" autocomplete="username">' +
          '<label for="iad-p">Password</label>' +
          '<input id="iad-p" type="password" autocomplete="current-password">' +
        '</div>' +
        '<div class="f"><button type="submit" class="btn">Sign in</button></div>' +
      '</form>';
    document.body.appendChild(dlg);
    console.log('[auth] 3. dialog element added to page');

    console.log('[auth] 4. typeof dlg.showModal =', typeof dlg.showModal);
    if (typeof dlg.showModal === 'function') {
      dlg.showModal();
      console.log('[auth] 5. showModal() called, dialog.open =', dlg.open);
    } else {
      // Fallback for very old browsers with no <dialog> support
      dlg.setAttribute('open', '');
      dlg.style.position = 'fixed';
      dlg.style.top = '50%';
      dlg.style.left = '50%';
      dlg.style.transform = 'translate(-50%,-50%)';
      dlg.style.zIndex = '9999';
      console.log('[auth] 5. no native <dialog> support — used fallback positioning');
    }

    dlg.querySelector('#iad-u').focus();

    dlg.querySelector('form').addEventListener('submit', function (e) {
      e.preventDefault();
      console.log('[auth] submit clicked. username =', dlg.querySelector('#iad-u').value);
      // (no network logic yet — this is where sign-in would go)
    });

    console.log('[auth] 6. done, popup should be visible');
  } catch (err) {
    console.log('[auth] ERROR:', err && err.message, err);
  }
})();
