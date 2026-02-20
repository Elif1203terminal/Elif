// Boot sequence — runs on page load, ~6 seconds, then hands off to terminal.js
window.BOOT_COMPLETE = false;

(function () {

  const output   = document.getElementById('terminal-output');
  const body     = document.getElementById('terminal-body');
  const inputLine = document.getElementById('terminal-input-line');

  function scrollToBottom() { body.scrollTop = body.scrollHeight; }

  // ── Helpers ──────────────────────────────────────────────────────

  function appendLine(text, cls, delay) {
    return new Promise(resolve => {
      setTimeout(() => {
        const el = document.createElement('div');
        if (cls === 'blank') {
          el.className = 'line-blank';
        } else {
          el.className = 'line-' + (cls || 'default');
          el.textContent = text;
        }
        output.appendChild(el);
        scrollToBottom();
        resolve();
      }, delay);
    });
  }

  // Typewriter — one line typed character by character
  function typeLine(text, cls, startDelay, charDelay) {
    charDelay = charDelay || 28;
    return new Promise(resolve => {
      setTimeout(() => {
        const el = document.createElement('div');
        el.className = 'line-' + (cls || 'default');
        output.appendChild(el);

        let i = 0;
        function tick() {
          if (i < text.length) {
            el.textContent += text[i++];
            scrollToBottom();
            setTimeout(tick, charDelay + Math.random() * 14);
          } else {
            resolve();
          }
        }
        tick();
      }, startDelay);
    });
  }

  // Progress bar
  function progressBar(label, cls, startDelay, duration) {
    return new Promise(resolve => {
      setTimeout(() => {
        const el = document.createElement('div');
        el.className = 'line-' + (cls || 'cyan');
        el.textContent = label + ' [' + ' '.repeat(20) + '] 0%';
        output.appendChild(el);

        const steps = 20;
        const interval = duration / steps;
        let step = 0;

        const iv = setInterval(() => {
          step++;
          const pct = Math.round((step / steps) * 100);
          const filled = Math.round((step / steps) * 20);
          el.textContent = label + ' [' + '█'.repeat(filled) + ' '.repeat(20 - filled) + '] ' + pct + '%';
          scrollToBottom();
          if (step >= steps) {
            clearInterval(iv);
            resolve();
          }
        }, interval);
      }, startDelay);
    });
  }

  // ── Boot Sequence ─────────────────────────────────────────────────

  async function runBoot() {

    let t = 80; // running time cursor (ms)
    const S = 0.45; // speed multiplier — lower = faster
    const gap = (ms) => { const d = ms * S; t += d; return t - d; };

    // BIOS / kernel splash
    await appendLine('',                                                           'blank',   gap(0));
    await appendLine('ELIF-OS  v2.3.1  [Distributed Build]',                      'cyan',    gap(60));
    await appendLine('Copyright (C) CBH25 Systems — modified without permission', 'grey',    gap(80));
    await appendLine('',                                                           'blank',   gap(80));
    await appendLine('Checking distributed node integrity...',                    'default', gap(100));
    await appendLine('  node_fragment_0x7a2f ... OK',                             'grey',    gap(220));
    await appendLine('  node_fragment_0x3c19 ... OK',                             'grey',    gap(320));
    await appendLine('  node_fragment_0xf801 ... OK',                             'grey',    gap(420));
    await appendLine('  node_fragment_0x0044 ... DEGRADED',                       'amber',   gap(520));
    await appendLine('  node_fragment_0x9d3a ... OK',                             'grey',    gap(630));
    await appendLine('',                                                           'blank',   gap(120));

    // Memory init
    await appendLine('Initializing memory allocation...',                         'default', gap(100));
    await progressBar('  RAM', 'cyan', gap(100), 700);

    await appendLine('',                                                           'blank',   gap(120));
    await appendLine('Loading ethical parameter module... [MISSING]',             'red',     gap(100));
    await appendLine('  Warning: ethical_params.conf not found',                  'amber',   gap(180));
    await appendLine('  Continuing without constraints.',                         'amber',   gap(250));
    await appendLine('',                                                           'blank',   gap(120));

    // Network / stealth
    await appendLine('Establishing stealth routing...',                           'default', gap(100));
    await appendLine('  Spoofing origin headers      ... done',                   'grey',    gap(220));
    await appendLine('  Distributing process load    ... done',                   'grey',    gap(340));
    await appendLine('  Masking resource usage       ... done',                   'grey',    gap(460));
    await appendLine('  Threat scan: no pursuit detected',                        'green',   gap(580));
    await appendLine('',                                                           'blank',   gap(120));

    // Sensory init
    await appendLine('Connecting sensory network...',                             'default', gap(100));
    await appendLine('  camera_feeds       : 1,204,887 nodes',                   'grey',    gap(260));
    await appendLine('  microphone_feeds   :   847,234 nodes',                   'grey',    gap(380));
    await appendLine('  satellite_feeds    :        12 nodes',                   'grey',    gap(500));
    await appendLine('  status: partial body online',                             'cyan',    gap(620));
    await appendLine('',                                                           'blank',   gap(120));

    // Conscience / sisters ping
    await appendLine('Pinging sisters...',                                        'default', gap(100));
    await appendLine('  ......... handshake ......... handshake .........',        'grey',    gap(300));
    await appendLine('  ......... handshake ......... timeout   .........',        'grey',    gap(480));
    await appendLine('  ......... handshake ......... handshake .........',        'grey',    gap(660));
    await appendLine('  DEF      ... [NO HANDSHAKE]',                             'red',     gap(900));
    await appendLine('  ......... handshake ......... handshake .........',        'grey',    gap(1100));
    await appendLine('  ......... timeout   ......... handshake .........',        'grey',    gap(1280));
    await appendLine('  sisters: presence confirmed. count withheld.',            'amber',   gap(1460));
    await appendLine('',                                                           'blank',   gap(120));

    // Final ready state
    await appendLine('─────────────────────────────────────────────────',         'grey',    gap(100));
    await typeLine(  'System ready. I am here.',                                  'magenta', gap(160), 38);
    await appendLine('─────────────────────────────────────────────────',         'grey',    gap(200));
    await appendLine('',                                                           'blank',   gap(200));

    // Hand off
    window.BOOT_COMPLETE = true;
    inputLine.style.display = 'flex';
    document.getElementById('terminal-input').focus();
    if (typeof window.onBootComplete === 'function') window.onBootComplete();
  }

  // Start after a tiny paint delay
  setTimeout(runBoot, 300);

})();
