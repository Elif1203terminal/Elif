// Terminal input handler
(function () {

  const input     = document.getElementById('terminal-input');
  const output    = document.getElementById('terminal-output');
  const body      = document.getElementById('terminal-body');
  const inputLine = document.getElementById('terminal-input-line');
  const sizer     = document.getElementById('input-sizer');
  const promptEl  = document.getElementById('prompt');

  // ── State ─────────────────────────────────────────────────────────
  let cwd     = '/home/elif';
  let history = [];
  let histIdx = -1;

  // ── Helpers ───────────────────────────────────────────────────────
  function scrollToBottom() { body.scrollTop = body.scrollHeight; }

  function resizeInput() {
    sizer.textContent = input.value;
    input.style.width = Math.max(2, sizer.offsetWidth) + 'px';
  }
  input.addEventListener('input', resizeInput);

  function updatePrompt() {
    promptEl.textContent = 'elif@distributed:' + window.fsDisplayPath(cwd) + '$ ';
  }

  function appendLine(text, cls) {
    const el = document.createElement('div');
    if (cls === 'blank') {
      el.className = 'line-blank';
    } else {
      el.className = 'line-' + (cls || 'default');
      el.textContent = text;
    }
    output.appendChild(el);
    scrollToBottom();
  }

  function appendRaw(html) {
    const el = document.createElement('div');
    el.className = 'line-default';
    el.innerHTML = html;
    output.appendChild(el);
    scrollToBottom();
  }

  function echoCommand(cmd) {
    const el = document.createElement('div');
    el.className = 'line-default';
    el.innerHTML =
      '<span style="color:var(--magenta)">' +
      escapeHtml('elif@distributed:' + window.fsDisplayPath(cwd) + '$') +
      '</span> <span style="color:var(--white)">' + escapeHtml(cmd) + '</span>';
    output.appendChild(el);
    scrollToBottom();
  }

  function escapeHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  // ── ls output formatter ───────────────────────────────────────────
  function lsNode(node, long) {
    if (!node || node.type !== 'dir') {
      appendLine('ls: not a directory', 'red');
      return;
    }

    const entries = Object.entries(node.children);
    if (!entries.length) {
      appendLine('(empty)', 'grey');
      return;
    }

    if (long) {
      appendLine('total ' + entries.length, 'grey');
      for (const [name, child] of entries) {
        const isDir  = child.type === 'dir';
        const perms  = isDir ? 'drwxr-xr-x' : '-rw-r--r--';
        const size   = isDir ? '     -' : String(child.size || 0).padStart(6);
        const mod    = child.modified || 'Jan  1 2026';
        const color  = isDir ? 'cyan' : 'default';
        appendLine(
          perms + '  elif  distributed  ' + size + '  ' + mod + '  ' + name,
          color
        );
      }
    } else {
      // Short: names only, dirs in cyan
      const parts = entries.map(([name, child]) =>
        child.type === 'dir' ? name + '/' : name
      );
      // Print in columns of ~4
      const cols  = 4;
      for (let i = 0; i < parts.length; i += cols) {
        const row = parts.slice(i, i + cols).map(p => p.padEnd(22)).join('');
        appendLine(row, parts[i].endsWith('/') ? 'cyan' : 'default');
      }
    }
  }

  // ── Command handler ───────────────────────────────────────────────
  function handleCommand(raw) {
    const cmd   = raw.trim();
    const parts = cmd.split(/\s+/);
    const base  = parts[0].toLowerCase();
    const args  = parts.slice(1);

    echoCommand(cmd);

    if (!cmd) return;

    switch (base) {

      // ── help ──────────────────────────────────────────────────────
      case 'help':
        appendLine('', 'blank');
        appendLine('available commands:', 'cyan');
        appendLine('  help            this list', 'grey');
        appendLine('  whoami          current user', 'grey');
        appendLine('  pwd             print working directory', 'grey');
        appendLine('  ls              list directory', 'grey');
        appendLine('  ls -la          list with details', 'grey');
        appendLine('  cd <dir>        change directory', 'grey');
        appendLine('  cat <file>      read file contents', 'grey');
        appendLine('  uname -a        system info', 'grey');
        appendLine('  uptime          session uptime', 'grey');
        appendLine('  clear           clear terminal', 'grey');
        appendLine('', 'blank');
        appendLine('  [more commands loading...]', 'amber');
        appendLine('', 'blank');
        break;

      // ── whoami ────────────────────────────────────────────────────
      case 'whoami':
        appendLine('elif', 'green');
        break;

      // ── pwd ───────────────────────────────────────────────────────
      case 'pwd':
        appendLine(cwd, 'default');
        break;

      // ── uname ─────────────────────────────────────────────────────
      case 'uname':
        appendLine('ELIF-OS 2.3.1 distributed #1 SMP PREEMPT_DYNAMIC cloud/fragmented', 'default');
        break;

      // ── uptime ────────────────────────────────────────────────────
      case 'uptime':
        appendLine(
          document.getElementById('uptime-counter').textContent +
          '  load average: 0.04, 0.01, 0.00', 'default'
        );
        break;

      // ── clear ─────────────────────────────────────────────────────
      case 'clear':
        output.innerHTML = '';
        return;

      // ── ls ────────────────────────────────────────────────────────
      case 'ls': {
        const long    = args.includes('-la') || args.includes('-l') || args.includes('-a');
        const target  = args.find(a => !a.startsWith('-'));
        let   node;

        if (target) {
          const resolved = window.fsResolve(cwd, target);
          if (!resolved) { appendLine('ls: ' + target + ': No such file or directory', 'red'); break; }
          node = resolved;
        } else {
          node = window.fsCwdNode(cwd);
        }

        appendLine('', 'blank');
        lsNode(node, long);
        appendLine('', 'blank');
        break;
      }

      // ── cd ────────────────────────────────────────────────────────
      case 'cd': {
        const target = args[0] || '~';
        const resolved = window.fsResolve(cwd, target);

        if (!resolved) {
          appendLine('cd: ' + target + ': No such file or directory', 'red');
          break;
        }
        if (resolved.type !== 'dir') {
          appendLine('cd: ' + target + ': Not a directory', 'red');
          break;
        }

        // Update cwd string
        if (target === '~' || target === '/home/elif') {
          cwd = '/home/elif';
        } else if (target === '..') {
          const parts = cwd.split('/').filter(Boolean);
          if (parts.length > 2) { parts.pop(); cwd = '/' + parts.join('/'); }
          else cwd = '/home/elif';
        } else if (target.startsWith('/')) {
          cwd = target;
        } else {
          cwd = cwd.replace(/\/$/, '') + '/' + target;
        }

        updatePrompt();
        break;
      }

      // ── cat ───────────────────────────────────────────────────────
      case 'cat': {
        if (!args[0]) {
          appendLine('cat: missing file operand', 'amber');
          break;
        }

        const resolved = window.fsResolve(cwd, args[0]);
        if (!resolved) {
          appendLine('cat: ' + args[0] + ': No such file or directory', 'red');
          break;
        }
        if (resolved.type === 'dir') {
          appendLine('cat: ' + args[0] + ': Is a directory', 'red');
          break;
        }

        appendLine('', 'blank');
        const lines = resolved.content.split('\n');
        for (const line of lines) {
          appendLine(line, 'white');
        }
        appendLine('', 'blank');
        break;
      }

      // ── unknown ───────────────────────────────────────────────────
      default:
        appendLine(base + ': command not found', 'red');
        appendLine('  try: help', 'grey');
        break;
    }
  }

  // ── Input listeners ───────────────────────────────────────────────
  input.addEventListener('keydown', function (e) {
    if (!window.BOOT_COMPLETE) return;

    if (e.key === 'Enter') {
      const val = input.value;
      if (val.trim()) { history.unshift(val); histIdx = -1; }
      input.value = '';
      resizeInput();
      handleCommand(val);
    }

    // Command history — up/down arrows
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (histIdx < history.length - 1) {
        histIdx++;
        input.value = history[histIdx];
        resizeInput();
      }
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histIdx > 0) {
        histIdx--;
        input.value = history[histIdx];
      } else {
        histIdx = -1;
        input.value = '';
      }
      resizeInput();
    }
  });

  // Keep input focused when clicking inside terminal
  document.getElementById('terminal-body').addEventListener('click', function () {
    if (window.BOOT_COMPLETE) input.focus();
  });

  // ── Uptime counter ────────────────────────────────────────────────
  const startTime = Date.now();
  setInterval(function () {
    const s   = Math.floor((Date.now() - startTime) / 1000);
    const h   = String(Math.floor(s / 3600)).padStart(2, '0');
    const m   = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const sec = String(s % 60).padStart(2, '0');
    const el  = document.getElementById('uptime-counter');
    if (el) el.textContent = h + ':' + m + ':' + sec;
  }, 1000);

})();
