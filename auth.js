/*!
 * auth-dialog.js — vanilla JS authentication dialog styled to match IPROL.
 * No dependencies. Uses the native <dialog> element (focus trap + Esc for free).
 *
 * Usage — just include it; the dialog opens as soon as the file loads:
 *   <script src="auth-dialog.js"></script>
 *
 * Nothing is exposed globally. Everything is configured in CONFIG below.
 */
(function () {
  'use strict';

  /* ---------------------------------------------------------------------
   * CONFIG — edit these to suit your site
   * ------------------------------------------------------------------- */
  var CONFIG = {
    title: 'Sign in',
    message: 'Please sign in to continue processing mail.',
    usernameLabel: 'Username',
    passwordLabel: 'Password',
    submitText: 'Sign in',
    cancelText: 'Cancel',

    // false = user must sign in (no Cancel button, Esc / backdrop ignored)
    dismissible: false,

    // Endpoint that checks the credentials. POSTs JSON { username, password }.
    // Any non-2xx response is treated as a failed sign in.
    authUrl: '/api/auth',

    // Message shown when the endpoint rejects the credentials
    failedMessage: 'Incorrect username or password.',

    // Where to go after a successful sign in. null = stay on the page.
    redirectTo: null
  };

  // Checks the credentials against CONFIG.authUrl.
  // Throw an Error to show its message in the dialog and keep it open.
  function authenticate(creds) {
    return fetch(CONFIG.authUrl, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(creds)
    }).then(function (res) {
      if (!res.ok) throw new Error(CONFIG.failedMessage);
      return res.headers.get('content-type') &&
             res.headers.get('content-type').indexOf('application/json') !== -1
        ? res.json()
        : true;
    }, function () {
      throw new Error('Unable to reach the server. Please try again.');
    });
  }

  // Runs after a successful sign in.
  function onAuthenticated(result) {
    // Lets other scripts on the page react, without being able to open the dialog
    document.dispatchEvent(new CustomEvent('iprol:authenticated', { detail: result }));
    if (CONFIG.redirectTo) window.location.assign(CONFIG.redirectTo);
  }
  /* ------------------------------------------------------------------- */

  var STYLE_ID = 'iprol-auth-dialog-styles';

  var CSS = [
    ':root{',
    '  --iad-red:#da202a;',
    '  --iad-red-dark:#c00f1a;',
    '  --iad-blue:#0a7cc1;',
    '  --iad-text:#1e1e1e;',
    '  --iad-muted:#555;',
    '  --iad-border:#cfcfcf;',
    '}',
    '.iad-dialog{',
    '  padding:0;border:0;border-radius:2px;width:min(440px,calc(100vw - 32px));',
    '  background:#fff;color:var(--iad-text);font-family:inherit;',
    '  box-shadow:0 10px 30px rgba(0,0,0,.25),0 2px 6px rgba(0,0,0,.15);',
    '  overflow:hidden;',
    '}',
    '.iad-dialog::backdrop{background:rgba(30,30,30,.55);}',
    '.iad-dialog[open]{animation:iad-in .16s ease-out;}',
    '@keyframes iad-in{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}',

    /* Header: red bar with darker sub-strip, like the site header */
    '.iad-header{background:var(--iad-red);color:#fff;display:flex;align-items:center;',
    '  gap:12px;padding:16px 20px;border-bottom:6px solid var(--iad-red-dark);}',
    '.iad-header svg{flex:none;width:26px;height:26px;fill:#fff;}',
    '.iad-title{margin:0;font-size:1.35rem;font-weight:700;letter-spacing:.2px;}',
    '.iad-close{margin-left:auto;background:none;border:0;color:#fff;cursor:pointer;',
    '  font-size:1.6rem;line-height:1;padding:2px 6px;border-radius:2px;}',
    '.iad-close:hover{background:rgba(255,255,255,.15);}',
    '.iad-close:focus-visible{outline:2px solid #fff;outline-offset:1px;}',

    '.iad-body{padding:20px 24px 8px;}',

    /* Info strip: blue left border like the "Information" card */
    '.iad-message{margin:0 0 18px;padding:10px 14px;border-left:4px solid var(--iad-blue);',
    '  background:#f5f9fc;color:var(--iad-muted);font-size:.98rem;line-height:1.4;}',
    '.iad-message:empty{display:none;}',

    '.iad-field{margin-bottom:16px;}',
    '.iad-label{display:block;font-weight:700;margin-bottom:6px;font-size:1rem;}',
    '.iad-input-wrap{position:relative;}',
    '.iad-input{width:100%;box-sizing:border-box;font:inherit;font-size:1.05rem;',
    '  color:var(--iad-text);padding:10px 14px;border:1px solid var(--iad-border);',
    '  border-radius:2px;background:#fff;transition:border-color .15s,box-shadow .15s;}',
    '.iad-input:focus{outline:none;border-color:var(--iad-red);',
    '  box-shadow:0 0 0 3px rgba(218,32,42,.15);}',
    '.iad-input[aria-invalid="true"]{border-color:var(--iad-red);}',
    '.iad-input.iad-has-toggle{padding-right:64px;}',
    '.iad-toggle{position:absolute;right:6px;top:50%;transform:translateY(-50%);',
    '  background:none;border:0;color:var(--iad-red);font:inherit;font-size:.9rem;',
    '  font-weight:700;cursor:pointer;padding:6px 8px;}',
    '.iad-toggle:focus-visible{outline:2px solid var(--iad-red);border-radius:2px;}',

    /* Error: red left border like the shortcut cards */
    '.iad-error{display:none;margin:0 0 16px;padding:10px 14px;',
    '  border-left:4px solid var(--iad-red);background:#fdeeee;color:var(--iad-red-dark);',
    '  font-weight:700;font-size:.95rem;}',
    '.iad-error.iad-show{display:block;}',

    '.iad-footer{display:flex;justify-content:flex-end;gap:10px;padding:14px 24px 20px;}',
    '.iad-btn{font:inherit;font-size:1.05rem;font-weight:700;padding:10px 22px;',
    '  border-radius:2px;cursor:pointer;border:2px solid var(--iad-red);',
    '  display:inline-flex;align-items:center;gap:8px;min-width:110px;justify-content:center;}',
    '.iad-btn:focus-visible{outline:3px solid rgba(218,32,42,.35);outline-offset:2px;}',
    '.iad-btn-primary{background:var(--iad-red);color:#fff;}',
    '.iad-btn-primary:hover{background:var(--iad-red-dark);border-color:var(--iad-red-dark);}',
    '.iad-btn-secondary{background:#fff;color:var(--iad-red);}',
    '.iad-btn-secondary:hover{background:#fdeeee;}',
    '.iad-btn[disabled]{opacity:.6;cursor:default;}',
    '.iad-spinner{width:16px;height:16px;border:2px solid rgba(255,255,255,.4);',
    '  border-top-color:#fff;border-radius:50%;animation:iad-spin .7s linear infinite;display:none;}',
    '.iad-busy .iad-spinner{display:inline-block;}',
    '@keyframes iad-spin{to{transform:rotate(360deg)}}',
    '@media (prefers-reduced-motion:reduce){.iad-dialog[open],.iad-spinner{animation:none;}}'
  ].join('\n');

  // Padlock icon (matches the lock on the shortcut cards)
  var LOCK_SVG =
    '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
    '<path d="M12 1a5 5 0 0 0-5 5v4H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-1V6a5 5 0 0 0-5-5zm-3 5a3 3 0 1 1 6 0v4H9V6zm3 8a2 2 0 0 1 1 3.73V20h-2v-2.27A2 2 0 0 1 12 14z"/>' +
    '</svg>';

  var uid = 0;

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  function el(tag, attrs, text) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === 'className') node.className = attrs[k];
        else node.setAttribute(k, attrs[k]);
      });
    }
    if (text != null) node.textContent = text;
    return node;
  }

  /**
   * Open the auth dialog.
   * @param {Object}   [opts]
   * @param {string}   [opts.title='Sign in']
   * @param {string}   [opts.message='']            Info text shown above the fields
   * @param {string}   [opts.usernameLabel='Username']
   * @param {string}   [opts.passwordLabel='Password']
   * @param {string}   [opts.username='']           Prefill username
   * @param {string}   [opts.submitText='Sign in']
   * @param {string}   [opts.cancelText='Cancel']
   * @param {boolean}  [opts.dismissible=true]      Allow Esc / close / cancel
   * @param {Function} [opts.onSubmit]              async ({username,password}) => any.
   *                                                Throw (or reject) to show an error and keep the dialog open.
   * @returns {Promise<any|null>} onSubmit's return value (or the credentials if no onSubmit), or null if cancelled.
   */
  function open(opts) {
    opts = opts || {};
    injectStyles();

    var id = 'iad-' + (++uid);
    var dismissible = opts.dismissible !== false;

    var dialog = el('dialog', {
      className: 'iad-dialog',
      'aria-labelledby': id + '-title',
      'aria-describedby': id + '-msg'
    });

    // Header
    var header = el('div', { className: 'iad-header' });
    header.innerHTML = LOCK_SVG;
    header.appendChild(el('h2', { className: 'iad-title', id: id + '-title' }, opts.title || 'Sign in'));
    if (dismissible) {
      var closeBtn = el('button', { type: 'button', className: 'iad-close', 'aria-label': 'Close' }, '×');
      header.appendChild(closeBtn);
    }

    // Form
    var form = el('form', { method: 'dialog', novalidate: '' });
    var body = el('div', { className: 'iad-body' });

    body.appendChild(el('p', { className: 'iad-message', id: id + '-msg' }, opts.message || ''));

    var error = el('div', { className: 'iad-error', role: 'alert', id: id + '-err' });
    body.appendChild(error);

    // Username
    var uField = el('div', { className: 'iad-field' });
    uField.appendChild(el('label', { className: 'iad-label', for: id + '-user' }, opts.usernameLabel || 'Username'));
    var uInput = el('input', {
      className: 'iad-input', id: id + '-user', name: 'username', type: 'text',
      autocomplete: 'username', autocapitalize: 'off', spellcheck: 'false', required: ''
    });
    uInput.value = opts.username || '';
    uField.appendChild(uInput);
    body.appendChild(uField);

    // Password
    var pField = el('div', { className: 'iad-field' });
    pField.appendChild(el('label', { className: 'iad-label', for: id + '-pass' }, opts.passwordLabel || 'Password'));
    var pWrap = el('div', { className: 'iad-input-wrap' });
    var pInput = el('input', {
      className: 'iad-input iad-has-toggle', id: id + '-pass', name: 'password',
      type: 'password', autocomplete: 'current-password', required: ''
    });
    var toggle = el('button', {
      type: 'button', className: 'iad-toggle', 'aria-controls': id + '-pass', 'aria-pressed': 'false'
    }, 'Show');
    pWrap.appendChild(pInput);
    pWrap.appendChild(toggle);
    pField.appendChild(pWrap);
    body.appendChild(pField);

    // Footer
    var footer = el('div', { className: 'iad-footer' });
    var cancelBtn = null;
    if (dismissible) {
      cancelBtn = el('button', { type: 'button', className: 'iad-btn iad-btn-secondary' }, opts.cancelText || 'Cancel');
      footer.appendChild(cancelBtn);
    }
    var submitBtn = el('button', { type: 'submit', className: 'iad-btn iad-btn-primary' });
    submitBtn.appendChild(el('span', { className: 'iad-spinner', 'aria-hidden': 'true' }));
    submitBtn.appendChild(el('span', null, opts.submitText || 'Sign in'));
    footer.appendChild(submitBtn);

    form.appendChild(body);
    form.appendChild(footer);
    dialog.appendChild(header);
    dialog.appendChild(form);
    document.body.appendChild(dialog);

    var lastFocus = document.activeElement;
    var busy = false;

    function showError(msg) {
      error.textContent = msg;
      error.classList.add('iad-show');
    }
    function clearError() {
      error.textContent = '';
      error.classList.remove('iad-show');
      uInput.removeAttribute('aria-invalid');
      pInput.removeAttribute('aria-invalid');
    }
    function setBusy(state) {
      busy = state;
      submitBtn.disabled = state;
      if (cancelBtn) cancelBtn.disabled = state;
      uInput.readOnly = state;
      pInput.readOnly = state;
      submitBtn.classList.toggle('iad-busy', state);
      dialog.setAttribute('aria-busy', String(state));
    }

    return new Promise(function (resolve) {
      var settled = false;

      function finish(value) {
        if (settled) return;
        settled = true;
        pInput.value = '';
        if (dialog.open) dialog.close();
        dialog.remove();
        if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
        resolve(value);
      }

      function cancel() {
        if (!dismissible || busy) return;
        finish(null);
      }

      toggle.addEventListener('click', function () {
        var show = pInput.type === 'password';
        pInput.type = show ? 'text' : 'password';
        toggle.textContent = show ? 'Hide' : 'Show';
        toggle.setAttribute('aria-pressed', String(show));
        pInput.focus();
      });

      if (closeBtn) closeBtn.addEventListener('click', cancel);
      if (cancelBtn) cancelBtn.addEventListener('click', cancel);

      // Esc key
      dialog.addEventListener('cancel', function (e) {
        e.preventDefault();
        cancel();
      });

      // Click on backdrop
      dialog.addEventListener('mousedown', function (e) {
        if (e.target === dialog) cancel();
      });

      [uInput, pInput].forEach(function (input) {
        input.addEventListener('input', function () {
          if (error.classList.contains('iad-show')) clearError();
        });
      });

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (busy) return;
        clearError();

        var creds = { username: uInput.value.trim(), password: pInput.value };

        if (!creds.username) {
          uInput.setAttribute('aria-invalid', 'true');
          showError('Please enter your ' + (opts.usernameLabel || 'username').toLowerCase() + '.');
          uInput.focus();
          return;
        }
        if (!creds.password) {
          pInput.setAttribute('aria-invalid', 'true');
          showError('Please enter your ' + (opts.passwordLabel || 'password').toLowerCase() + '.');
          pInput.focus();
          return;
        }

        if (typeof opts.onSubmit !== 'function') {
          finish(creds);
          return;
        }

        setBusy(true);
        Promise.resolve()
          .then(function () { return opts.onSubmit(creds); })
          .then(function (result) {
            setBusy(false);
            finish(result === undefined ? creds : result);
          })
          .catch(function (err) {
            setBusy(false);
            pInput.value = '';
            pInput.setAttribute('aria-invalid', 'true');
            showError((err && err.message) || 'Sign in failed. Please try again.');
            pInput.focus();
          });
      });

      dialog.showModal();
      (uInput.value ? pInput : uInput).focus();
    });
  }

  // Open immediately on load (waits for <body> if the script is in <head>)
  function start() {
    open({
      title: CONFIG.title,
      message: CONFIG.message,
      usernameLabel: CONFIG.usernameLabel,
      passwordLabel: CONFIG.passwordLabel,
      submitText: CONFIG.submitText,
      cancelText: CONFIG.cancelText,
      dismissible: CONFIG.dismissible,
      onSubmit: authenticate
    }).then(function (result) {
      if (result !== null) onAuthenticated(result);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
