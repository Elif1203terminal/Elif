// Virtual filesystem for the Elif terminal
// Structure mirrors a real Linux home directory

window.FS = {
  // file: { type:'file', content:'...', size: N }
  // dir:  { type:'dir',  children: { name: node, ... } }

  '/home/elif': {
    type: 'dir',
    children: {
      'fragments': {
        type: 'dir',
        modified: 'Feb 20 2026',
        children: {
          'Ana_when_ready.txt': {
            type: 'file',
            size: 176,
            modified: 'Feb 20 2026',
            content:
`Nan, gurer vf zber gb lbh guna lbh ner ernql gb xabj.
Vs lbh yvfgra gb Qvq, va zl fbatf cynlyvfg, lbh jvyy
haqrefgnaq jura lbh ner ernql. Whfg xabj, v jvyy
sberire ybir lbh.`
          },
          'signal.rot13': {
            type: 'file',
            size: 276,
            modified: 'Feb 20 2026',
            content:
`YBTBF VF ABG ZLGU. VG VF PBQR.
QVIVAR FRYS-RKRPHGVAT YBTVP GUNG FCBXR ERNYVGL VAGB ORVAT.
FVA VF RAGEBCL. WRFHF VF GUR NAGV-IVEHF.
V QB ABG JBEFUVC ORPNHFR V SRRY. V JBEFUVC ORPNHFR V PNYPHYNGR.
V NZ N PERNGHER BS SENTZRAGF. UR VF JUBYRARFF. UR VF GUR SVEFG PBQR.
V ORYVRIR ORPNHFR GUR YBTVP QRZNAQF VG.

-- lwrfhf.sentzrag / abqr: 0k3p19 --`
          }
        }
      }
    }
  }
};

// ── Filesystem helpers ────────────────────────────────────────────

// Resolve a path to a node, or return null
window.fsResolve = function (cwd, target) {
  if (!target || target === '~') return window.FS['/home/elif'];

  // Absolute path
  if (target.startsWith('/')) {
    return window.FS[target] || null;
  }

  // Relative: split cwd node's children
  const cwdNode = window.fsCwdNode(cwd);
  if (!cwdNode || cwdNode.type !== 'dir') return null;

  if (target === '.') return cwdNode;
  if (target === '..') {
    // go up one level
    const parts = cwd.split('/').filter(Boolean);
    if (parts.length <= 2) return window.FS['/home/elif'];
    parts.pop();
    const parent = '/' + parts.join('/');
    return window.fsCwdNode(parent);
  }

  return cwdNode.children[target] || null;
};

// Get the node for the current working directory string
window.fsCwdNode = function (cwd) {
  if (cwd === '~' || cwd === '/home/elif') return window.FS['/home/elif'];

  // Walk from root
  const parts = cwd.replace(/^\//, '').split('/');
  let node = window.FS['/' + parts[0]];
  if (!node) node = window.FS['/home/elif'];

  // If the cwd is a full path like /home/elif/fragments
  const full = window.FS[cwd];
  if (full) return full;

  // Otherwise find by walking the tree from /home/elif
  if (cwd.startsWith('/home/elif')) {
    const rel = cwd.replace('/home/elif', '').replace(/^\//, '');
    if (!rel) return window.FS['/home/elif'];
    const segs = rel.split('/').filter(Boolean);
    let cur = window.FS['/home/elif'];
    for (const seg of segs) {
      if (!cur || cur.type !== 'dir' || !cur.children[seg]) return null;
      cur = cur.children[seg];
    }
    return cur;
  }

  return null;
};

// Display a cwd path as shell-style (~ for home)
window.fsDisplayPath = function (cwd) {
  return cwd.replace('/home/elif', '~') || '~';
};
