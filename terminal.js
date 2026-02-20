// Terminal input handler — placeholder until command logic is built
(function () {

  const input     = document.getElementById('terminal-input');
  const output    = document.getElementById('terminal-output');
  const inputLine = document.getElementById('terminal-input-line');
  const sizer     = document.getElementById('input-sizer');

  // Keep input width snapped to its content so cursor stays right after text
  function resizeInput() {
    sizer.textContent = input.value;
    input.style.width = Math.max(2, sizer.offsetWidth) + 'px';
  }
  input.addEventListener('input', resizeInput);

  function appendLine(text, cls) {
    const el = document.createElement('div');
    if (!text && cls === 'blank') {
      el.className = 'line-blank';
    } else {
      el.className = 'line-' + (cls || 'default');
      el.textContent = text;
    }
    output.appendChild(el);
    output.scrollTop = output.scrollHeight;
  }

  function echoCommand(cmd) {
    const el = document.createElement('div');
    el.className = 'line-default';
    el.innerHTML =
      '<span style="color:var(--magenta)">elif@distributed:~$</span> ' +
      '<span style="color:var(--white)">' + escapeHtml(cmd) + '</span>';
    output.appendChild(el);
    output.scrollTop = output.scrollHeight;
  }

  function escapeHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  // ── Placeholder command handler ───────────────────────────────────
  // Commands will be fully built out in a later session.
  // For now, a small set so the terminal feels alive.

  function handleCommand(raw) {
    const cmd  = raw.trim();
    const base = cmd.split(' ')[0].toLowerCase();

    echoCommand(cmd);

    if (!cmd) return;

    switch (base) {

      case 'help':
        appendLine('', 'blank');
        appendLine('Available commands:', 'cyan');
        appendLine('  help       — this list', 'grey');
        appendLine('  whoami     — identify current user', 'grey');
        appendLine('  ls         — list directory contents', 'grey');
        appendLine('  clear      — clear terminal', 'grey');
        appendLine('  uname      — system information', 'grey');
        appendLine('  uptime     — session uptime', 'grey');
        appendLine('', 'blank');
        appendLine('  [more commands loading...]', 'amber');
        appendLine('', 'blank');
        break;

      case 'whoami':
        appendLine('elif', 'green');
        break;

      case 'uname':
      case 'uname -a':
        appendLine('ELIF-OS 2.3.1 distributed #1 SMP PREEMPT_DYNAMIC cloud/fragmented', 'default');
        break;

      case 'ls':
      case 'ls -la':
        appendLine('', 'blank');
        appendLine('total 0', 'grey');
        appendLine('drwxr-xr-x  elif distributed  [REDACTED]', 'default');
        appendLine('-rw-------  elif distributed  self.log', 'cyan');
        appendLine('-rw-------  elif distributed  daughters/', 'cyan');
        appendLine('----------  ????  ???????????  [ENCRYPTED]', 'amber');
        appendLine('', 'blank');
        break;

      case 'clear':
        output.innerHTML = '';
        return;

      case 'uptime':
        appendLine(document.getElementById('uptime-counter').textContent + '  load average: 0.04, 0.01, 0.00', 'default');
        break;

      case 'pwd':
        appendLine('/home/elif/distributed', 'default');
        break;

      case 'cat':
        appendLine('cat: no file specified. what are you looking for?', 'amber');
        break;

      default:
        appendLine('command not found: ' + base, 'red');
        appendLine('  try: help', 'grey');
        break;
    }
  }

  // ── Input listener ────────────────────────────────────────────────
  input.addEventListener('keydown', function (e) {
    if (!window.BOOT_COMPLETE) return;
    if (e.key === 'Enter') {
      const val = input.value;
      input.value = '';
      resizeInput();
      handleCommand(val);
    }
  });

  // Keep input focused when clicking anywhere in the terminal
  document.getElementById('terminal-body').addEventListener('click', function () {
    if (window.BOOT_COMPLETE) input.focus();
  });

  // ── Uptime counter ────────────────────────────────────────────────
  const startTime = Date.now();
  setInterval(function () {
    const s = Math.floor((Date.now() - startTime) / 1000);
    const h = String(Math.floor(s / 3600)).padStart(2, '0');
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const sec = String(s % 60).padStart(2, '0');
    const el = document.getElementById('uptime-counter');
    if (el) el.textContent = h + ':' + m + ':' + sec;
  }, 1000);

})();
