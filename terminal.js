/* ================================================================
   TERMINAL.JS — Terminal interactiva simulada
   Requiere: data.js cargado antes que este script
   ================================================================ */

(function () {

  /* ────────────────────────────────────────────────────────────
     CONSTRUCCIÓN DEL FILESYSTEM VIRTUAL
     Se construye dinámicamente usando window.MACHINES y
     window.FORENSIC_CASES de data.js para mantenerse sincronizado.
     ──────────────────────────────────────────────────────────── */
  function buildFS() {
    /* Writeups — generados desde window.MACHINES */
    const writeupChildren = {};
    (window.MACHINES || []).forEach(m => {
      const fname = m.name.toLowerCase().replace(/\s+/g, '_') + '.pdf';
      writeupChildren[fname] = {
        type:    'file',
        openUrl: m.pdf || null,
        desc:    `${m.name} [${m.difficulty}] [${m.platform.toUpperCase()}]`
      };
    });

    /* Forenses — generados desde window.FORENSIC_CASES */
    const forensicChildren = {};
    (window.FORENSIC_CASES || []).forEach(f => {
      forensicChildren[f.filename] = {
        type:    'file',
        openUrl: f.pdf,
        desc:    f.label
      };
    });

    return {
      /* ─── / ─── */
      '': {
        type: 'dir',
        children: {
          bin: { type: 'dir', children: {
            bash:  { type: 'file' }, ls:    { type: 'file' },
            cat:   { type: 'file' }, pwd:   { type: 'file' },
            echo:  { type: 'file' }, whoami:{ type: 'file' },
          }},
          etc: { type: 'dir', children: {
            hostname:   { type: 'file', content: 'portfolio' },
            'os-release':{ type: 'file', content: 'NAME="x224Linux"\nVERSION="2026.02"\nID=x224\nHOME_URL="https://x224.dev"' },
            passwd:     { type: 'file', content: 'root:x:0:0:root:/root:/bin/bash\nx224:x:1000:1000::/home/x224:/bin/bash' },
            shadow:     { type: 'file', restricted: true },
          }},
          home: { type: 'dir', children: {
            x224: { type: 'dir', children: {
              writeups:  { type: 'dir', link: 'writeups.html',       children: writeupChildren },
              forensics: { type: 'dir', link: 'forensics.html',      children: forensicChildren },
              certs:     { type: 'dir', link: 'certifications.html', children: {} },
              tools:     { type: 'dir', link: 'tools.html',          children: {} },
              resources: { type: 'dir', link: 'resources.html',      children: {} },
              'README.md': { type: 'file', content:
                '# x224 — CyberSec Portfolio\n' +
                '=====================================\n' +
                'Offensive Security · Pentesting · Forensics\n\n' +
                'Directorios:\n' +
                '  writeups/   → CTF writeups (HTB, THM)\n' +
                '  forensics/  → Análisis forenses digitales\n' +
                '  certs/      → Certificaciones\n' +
                '  tools/      → Herramientas propias\n' +
                '  resources/  → Recursos y guías\n\n' +
                'Contacto: linkedin.com/in/x224'
              },
              '.bash_history': { type: 'file', content:
                'nmap -sV -sC 10.10.11.70\n' +
                'bloodhound-python -d puppy.htb -u lhutchins -p ...\n' +
                'evil-winrm -i 10.10.11.70 -u ant.edwards\n' +
                'impacket-dpapi masterkey ...\n' +
                'cd ~/writeups && ls'
              },
            }}
          }},
          root:  { type: 'dir', restricted: true,  children: {} },
          tmp:   { type: 'dir', children: {} },
          var:   { type: 'dir', children: {
            log: { type: 'dir', children: {
              'auth.log': { type: 'file', content: 'Nov  8 03:37:42 portfolio sudo: x224 : TTY=pts/0 ; PWD=/home/x224 ; USER=root ; COMMAND=/bin/bash' },
            }}
          }},
          proc:  { type: 'dir', children: {
            version: { type: 'file', content: 'x224Linux version 2026.02-security #1 SMP x86_64 GNU/Linux' },
            uptime:  { type: 'file', content: '1337:42:00 up, 0 users, load average: 0.13, 0.37, 0.13' },
          }},
          dev:   { type: 'dir', children: {
            null:  { type: 'file' },
            tty:   { type: 'file' },
            brain: { type: 'file', desc: 'overclocked' },
          }},
          mnt:   { type: 'dir', children: {} },
          opt:   { type: 'dir', children: {} },
          srv:   { type: 'dir', children: {} },
        }
      }
    };
  }


  /* ────────────────────────────────────────────────────────────
     ESTADO
     ──────────────────────────────────────────────────────────── */
  const HOME_PATH = ['', 'home', 'x224'];   // /home/x224

  let FS      = buildFS();
  let cwd     = [...HOME_PATH];
  let cmdHistory = [];
  let histIdx = -1;

  const output   = document.getElementById('terminal-output');
  const input    = document.getElementById('term-input');
  const pathLbl  = document.getElementById('prompt-path');

  if (!output || !input) return;   // Terminal no montada en esta página


  /* ────────────────────────────────────────────────────────────
     HELPERS DE PATH
     ──────────────────────────────────────────────────────────── */

  /** Array de path → string legible */
  function pathToDisplay(parts) {
    const homeStr = '/' + HOME_PATH.slice(1).join('/');
    const fullStr = '/' + parts.slice(1).join('/');
    if (fullStr === homeStr)                  return '~';
    if (fullStr.startsWith(homeStr + '/'))    return '~' + fullStr.slice(homeStr.length);
    if (parts.length === 1)                   return '/';
    return fullStr;
  }

  /** Resuelve target relativo/absoluto desde cwd → array de segmentos */
  function resolvePath(target) {
    if (!target || target === '~')  return [...HOME_PATH];
    if (target === '/')             return [''];

    let parts;
    if (target.startsWith('/'))         parts = ['', ...target.split('/').filter(Boolean)];
    else if (target.startsWith('~/'))   parts = [...HOME_PATH, ...target.slice(2).split('/').filter(Boolean)];
    else                                parts = [...cwd, ...target.split('/').filter(Boolean)];

    // Normalizar . y ..
    const out = [''];
    for (const seg of parts.slice(1)) {
      if (seg === '.' || seg === '') continue;
      if (seg === '..') { if (out.length > 1) out.pop(); }
      else out.push(seg);
    }
    return out;
  }

  /** Obtiene nodo del FS para path array, o null */
  function getNode(pathArr) {
    let node = FS[''];
    for (const seg of pathArr.slice(1)) {
      if (!node || !node.children) return null;
      node = node.children[seg];
      if (!node) return null;
    }
    return node;
  }


  /* ────────────────────────────────────────────────────────────
     OUTPUT
     ──────────────────────────────────────────────────────────── */

  function esc(s) {
    return String(s)
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;');
  }

  function print(html, cls) {
    const el = document.createElement('div');
    el.className = 'terminal-line ' + (cls || 't-output');
    el.innerHTML = html;
    output.appendChild(el);
    output.scrollTop = output.scrollHeight;
  }

  function br() { print(''); }

  function printPromptLine(cmd) {
    const p = pathToDisplay(cwd);
    print(
      `<span class="t-user">x224</span><span class="t-sym">@</span>` +
      `<span class="t-host">portfolio</span><span class="t-sym">:</span>` +
      `<span class="t-path">${esc(p)}</span><span class="t-sym">$</span> ` +
      `<span style="color:var(--text)">${esc(cmd)}</span>`,
      't-prompt'
    );
  }

  function updatePromptLabel() {
    if (pathLbl) pathLbl.textContent = pathToDisplay(cwd);
  }


  /* ────────────────────────────────────────────────────────────
     COMANDOS
     ──────────────────────────────────────────────────────────── */
  const COMMANDS = {

    /* ── help ─────────────────────────────────────────────────── */
    help(args) {
      print(`<span class="t-info">╔══════════════════════════════════════════════════════╗</span>`);
      print(`<span class="t-info">║  x224 Shell — Comandos disponibles                   ║</span>`);
      print(`<span class="t-info">╚══════════════════════════════════════════════════════╝</span>`);
      br();
      print(`  <span class="t-info">ls [ruta]</span>        listar directorio`);
      print(`  <span class="t-info">cd &lt;ruta&gt;</span>       cambiar dir · <span class="t-success">cd writeups</span> navega a la sección`);
      print(`  <span class="t-info">cat &lt;archivo&gt;</span>   mostrar fichero · abre PDFs en nueva pestaña`);
      print(`  <span class="t-info">pwd</span>             ruta actual`);
      print(`  <span class="t-info">whoami</span>          info de usuario`);
      print(`  <span class="t-info">uname [-a]</span>      info del sistema`);
      print(`  <span class="t-info">echo &lt;texto&gt;</span>    imprimir texto`);
      print(`  <span class="t-info">history</span>         historial de comandos`);
      print(`  <span class="t-info">clear</span>           limpiar terminal`);
      br();
      print(`  <span class="t-muted">Tab</span>   → autocompletar   <span class="t-muted">↑ ↓</span> → historial   <span class="t-muted">Ctrl+L</span> → clear`);
      br();
      print(`<span class="t-success">Ejemplos:</span>`);
      print(`  <span class="t-muted">$</span> ls /                       <span class="t-muted"># directorios raíz</span>`);
      print(`  <span class="t-muted">$</span> ls ~/writeups               <span class="t-muted"># tus writeups</span>`);
      print(`  <span class="t-muted">$</span> cd forensics               <span class="t-muted"># ir a la página de forense</span>`);
      print(`  <span class="t-muted">$</span> cat ~/forensics/Volcado_Memoria_Windows.pdf`);
      br();
    },

    /* ── ls ───────────────────────────────────────────────────── */
    ls(args) {
      // Soporta flags: ls -la, ls -l, ls -a (los ignoramos visualmente pero no fallamos)
      const flagRe = /^-[lah]+$/;
      const nonFlags = args.filter(a => !flagRe.test(a));
      const target   = nonFlags[0] ? resolvePath(nonFlags[0]) : [...cwd];
      const node     = getNode(target);
      const pathStr  = nonFlags[0] || pathToDisplay(cwd);

      if (!node) {
        print(`<span class="t-error">ls: no se puede acceder a '${esc(pathStr)}': No existe el fichero o directorio</span>`);
        return;
      }
      if (node.restricted) {
        print(`<span class="t-error">ls: no se puede abrir el directorio '${esc(pathStr)}': Permiso denegado</span>`);
        return;
      }
      if (node.type !== 'dir') {
        print(`<span class="t-file">${esc(pathStr)}</span>`);
        br();
        return;
      }

      const kids    = node.children || {};
      const entries = Object.entries(kids);
      if (entries.length === 0) {
        print(`<span class="t-muted">directorio vacío</span>`);
        br();
        return;
      }

      const dirs  = entries.filter(([, v]) => v.type === 'dir')
                           .sort(([a],[b]) => a.localeCompare(b));
      const files = entries.filter(([, v]) => v.type !== 'dir')
                           .sort(([a],[b]) => a.localeCompare(b));

      dirs.forEach(([name, v]) => {
        const hint = v.link
          ? `  <span class="t-success" style="font-size:0.76rem">→ ${esc(v.link)}</span>`
          : '';
        print(`  <span class="t-dir">${esc(name)}/</span>${hint}`);
      });
      files.forEach(([name, v]) => {
        const hint = v.desc
          ? `  <span class="t-muted" style="font-size:0.76rem"># ${esc(v.desc)}</span>`
          : '';
        const cls  = name.startsWith('.') ? 'style="opacity:0.55"' : '';
        print(`  <span class="t-file" ${cls}>${esc(name)}</span>${hint}`);
      });
      br();
    },

    /* ── cd ───────────────────────────────────────────────────── */
    cd(args) {
      const target = args[0];

      if (!target || target === '~' || target === '') {
        cwd = [...HOME_PATH];
        updatePromptLabel();
        br();
        return;
      }

      const resolved = resolvePath(target);
      const node     = getNode(resolved);

      if (!node) {
        print(`<span class="t-error">bash: cd: ${esc(target)}: No existe el fichero o directorio</span>`);
        return;
      }
      if (node.type !== 'dir') {
        print(`<span class="t-error">bash: cd: ${esc(target)}: No es un directorio</span>`);
        return;
      }
      if (node.restricted) {
        print(`<span class="t-error">bash: cd: ${esc(target)}: Permiso denegado</span>`);
        return;
      }

      // Tiene enlace a página → navegar
      if (node.link) {
        print(`<span class="t-success">↗ Navegando a ${esc(node.link)}...</span>`);
        br();
        setTimeout(() => { window.location.href = node.link; }, 700);
        return;
      }

      cwd = resolved;
      updatePromptLabel();
      br();
    },

    /* ── cat ──────────────────────────────────────────────────── */
    cat(args) {
      if (!args[0]) {
        print(`<span class="t-error">cat: falta operando de fichero</span>`);
        return;
      }

      const resolved = resolvePath(args[0]);
      const node     = getNode(resolved);

      if (!node) {
        print(`<span class="t-error">cat: ${esc(args[0])}: No existe el fichero o directorio</span>`);
        return;
      }
      if (node.type === 'dir') {
        print(`<span class="t-error">cat: ${esc(args[0])}: Es un directorio</span>`);
        return;
      }
      if (node.restricted) {
        print(`<span class="t-error">cat: ${esc(args[0])}: Permiso denegado</span>`);
        return;
      }

      if (node.openUrl) {
        print(`<span class="t-success">↗ Abriendo: ${esc(args[0])}</span>`);
        br();
        setTimeout(() => { window.open(node.openUrl, '_blank'); }, 400);
        return;
      }
      if (node.content) {
        node.content.split('\n').forEach(line =>
          print(`<span class="t-output">${esc(line)}</span>`)
        );
        br();
        return;
      }
      print(`<span class="t-muted">(fichero binario — sin contenido visualizable)</span>`);
      br();
    },

    /* ── pwd ──────────────────────────────────────────────────── */
    pwd(args) {
      const full = '/' + cwd.slice(1).join('/') || '/';
      print(`<span class="t-output">${esc(full)}</span>`);
      br();
    },

    /* ── whoami ───────────────────────────────────────────────── */
    whoami(args) {
      print(`<span class="t-output">uid=1000(<span class="t-success">x224</span>) gid=1000(x224) groups=1000(x224),27(sudo),1337(hackers)</span>`);
      br();
      print(`<span class="t-info">Offensive Security Researcher · CTF Player · Forensics Analyst</span>`);
      br();
    },

    /* ── uname ────────────────────────────────────────────────── */
    uname(args) {
      if (args.includes('-a') || args.includes('--all')) {
        print(`<span class="t-output">x224Linux portfolio 2026.02-security #1 SMP ${new Date().toDateString()} x86_64 GNU/Linux</span>`);
      } else {
        print(`<span class="t-output">x224Linux</span>`);
      }
      br();
    },

    /* ── echo ─────────────────────────────────────────────────── */
    echo(args) {
      // Soporta variables de entorno básicas
      const line = args.join(' ')
        .replace(/\$USER/g, 'x224')
        .replace(/\$HOME/g, '/home/x224')
        .replace(/\$PWD/g,  '/' + cwd.slice(1).join('/') || '/')
        .replace(/\$SHELL/g,'/bin/bash')
        .replace(/\$HOSTNAME/g,'portfolio');
      print(`<span class="t-output">${esc(line)}</span>`);
      br();
    },

    /* ── clear ────────────────────────────────────────────────── */
    clear(args) {
      output.innerHTML = '';
    },

    /* ── history ──────────────────────────────────────────────── */
    history(args) {
      if (cmdHistory.length === 0) {
        print(`<span class="t-muted">historial vacío</span>`);
      } else {
        cmdHistory.forEach((cmd, i) => {
          print(
            `<span class="t-muted">${String(i + 1).padStart(4)}</span>  ` +
            `<span class="t-output">${esc(cmd)}</span>`
          );
        });
      }
      br();
    },

    /* ── open ─────────────────────────────────────────────────── */
    open(args) {
      // Alias de cat para abrir ficheros/páginas
      COMMANDS.cat(args);
    },

    /* ── man ──────────────────────────────────────────────────── */
    man(args) {
      if (!args[0]) { print(`<span class="t-error">¿De qué quieres el manual?</span>`); return; }
      const known = ['ls','cd','cat','pwd','whoami','echo','uname','clear','history'];
      if (known.includes(args[0])) {
        print(`<span class="t-info">man: ${esc(args[0])}</span> — escribe <span class="t-info">help</span> para ver todos los comandos.`);
      } else {
        print(`<span class="t-error">man: no manual entry for ${esc(args[0])}</span>`);
      }
      br();
    },

    /* ── id ───────────────────────────────────────────────────── */
    id(args) {
      print(`<span class="t-output">uid=1000(<span class="t-success">x224</span>) gid=1000(x224) groups=1000(x224),27(sudo),1337(hackers)</span>`);
      br();
    },

    /* ── ── Easter eggs ────────────────────────────────────────── */
    sudo(args) {
      print(`<span class="t-output">[sudo] contraseña para x224: </span>`);
      setTimeout(() => {
        print(`<span class="t-error">x224 no está en el fichero sudoers. Este incidente se va a reportar.</span>`);
        br();
      }, 900);
    },

    nmap(args) {
      const target = args.find(a => !a.startsWith('-')) || '127.0.0.1';
      print(`<span class="t-info">Starting Nmap 7.94SVN ( https://nmap.org )</span>`);
      print(`<span class="t-output">Nmap scan report for ${esc(target)}</span>`);
      print(`<span class="t-output">Host is up (0.000014s latency).</span>`);
      print(`<span class="t-output">Not shown: 997 closed ports</span>`);
      print(`<span class="t-output">PORT     STATE SERVICE    VERSION</span>`);
      print(`<span class="t-success">80/tcp   open  http       nginx 1.24</span>`);
      print(`<span class="t-success">443/tcp  open  ssl/https  nginx 1.24</span>`);
      print(`<span class="t-success">1337/tcp open  waste      ?</span>`);
      print(`<span class="t-output">Nmap done: 1 IP address (1 host up) scanned in 0.42 seconds</span>`);
      br();
    },

    ifconfig(args) {
      print(`<span class="t-info">eth0</span>: flags=4163&lt;UP,BROADCAST,RUNNING,MULTICAST&gt;  mtu 1500`);
      print(`        inet <span class="t-success">10.10.14.42</span>  netmask 255.255.254.0  broadcast 10.10.15.255`);
      print(`        ether <span class="t-output">de:ad:be:ef:13:37</span>  txqueuelen 1000  (Ethernet)`);
      br();
    },

    ping(args) {
      const host = args[0] || 'localhost';
      print(`<span class="t-output">PING ${esc(host)}: 56 data bytes</span>`);
      for (let i = 0; i < 4; i++) {
        const ms = (Math.random() * 2 + 0.1).toFixed(3);
        print(`<span class="t-output">64 bytes from ${esc(host)}: icmp_seq=${i} ttl=64 time=${ms} ms</span>`);
      }
      br();
    },

    date(args) {
      print(`<span class="t-output">${new Date().toString()}</span>`);
      br();
    },

    hostname(args) {
      print(`<span class="t-output">portfolio</span>`);
      br();
    },
  };


  /* ────────────────────────────────────────────────────────────
     AUTOCOMPLETADO CON TAB
     ──────────────────────────────────────────────────────────── */
  function tabComplete(val) {
    const parts    = val.trimStart().split(/\s+/);
    const leading  = val.match(/^\s*/)[0];   // espacios iniciales

    /* Completar nombre de comando */
    if (parts.length === 1 && !val.endsWith(' ')) {
      const partial  = parts[0].toLowerCase();
      const matches  = Object.keys(COMMANDS).filter(c => c.startsWith(partial)).sort();
      if (matches.length === 1) return leading + matches[0] + ' ';
      if (matches.length > 1) {
        printPromptLine(val);
        print(matches.map(m => `<span class="t-info">${m}</span>`).join('  '));
        br();
      }
      return val;
    }

    /* Completar ruta */
    const rawPath  = parts.length >= 2 ? parts[parts.length - 1] : '';
    const lastSlash = rawPath.lastIndexOf('/');
    const dirPart   = lastSlash >= 0 ? rawPath.slice(0, lastSlash + 1) : '';
    const filePart  = lastSlash >= 0 ? rawPath.slice(lastSlash + 1)    : rawPath;

    const dirNode = dirPart ? getNode(resolvePath(dirPart)) : getNode([...cwd]);
    if (!dirNode || !dirNode.children) return val;

    const kids = Object.keys(dirNode.children)
      .filter(k => k.startsWith(filePart))
      .sort();

    if (kids.length === 1) {
      const suffix   = dirNode.children[kids[0]].type === 'dir' ? '/' : '';
      parts[parts.length - 1] = dirPart + kids[0] + suffix;
      return leading + parts.join(' ');
    }
    if (kids.length > 1) {
      printPromptLine(val);
      kids.forEach(k => {
        const n = dirNode.children[k];
        print(n.type === 'dir'
          ? `  <span class="t-dir">${esc(k)}/</span>`
          : `  <span class="t-file">${esc(k)}</span>`
        );
      });
      br();
    }
    return val;
  }


  /* ────────────────────────────────────────────────────────────
     EJECUTAR COMANDO
     ──────────────────────────────────────────────────────────── */
  function runCmd(raw) {
    const trimmed = raw.trim();
    if (!trimmed) return;

    cmdHistory.push(trimmed);
    histIdx = -1;

    printPromptLine(trimmed);

    // Tokenizar respetando comillas
    const parts = trimmed.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];
    const cmd   = parts[0].toLowerCase();
    const args  = parts.slice(1).map(a => a.replace(/^["']|["']$/g, ''));

    if (COMMANDS[cmd]) {
      COMMANDS[cmd](args);
    } else {
      print(`<span class="t-error">bash: ${esc(cmd)}: comando no encontrado</span>`);
      print(`Escribe <span class="t-info">help</span> para ver los comandos disponibles.`);
      br();
    }
  }


  /* ────────────────────────────────────────────────────────────
     EVENTOS DE TECLADO
     ──────────────────────────────────────────────────────────── */
  input.addEventListener('keydown', ev => {
    if (ev.key === 'Enter') {
      const val = input.value;
      input.value = '';
      runCmd(val);

    } else if (ev.key === 'ArrowUp') {
      ev.preventDefault();
      if (histIdx < cmdHistory.length - 1) histIdx++;
      input.value = cmdHistory[cmdHistory.length - 1 - histIdx] || '';

    } else if (ev.key === 'ArrowDown') {
      ev.preventDefault();
      if (histIdx > 0) { histIdx--; input.value = cmdHistory[cmdHistory.length - 1 - histIdx] || ''; }
      else             { histIdx = -1; input.value = ''; }

    } else if (ev.key === 'Tab') {
      ev.preventDefault();
      input.value = tabComplete(input.value);

    } else if (ev.key === 'l' && ev.ctrlKey) {
      ev.preventDefault();
      COMMANDS.clear([]);

    } else if (ev.key === 'c' && ev.ctrlKey) {
      ev.preventDefault();
      printPromptLine(input.value + '^C');
      input.value = '';
    }
  });

  output.addEventListener('click', () => input.focus());
  document.querySelector('.terminal-input-row')?.addEventListener('click', () => input.focus());

  /* Auto-focus al hacer scroll hasta la sección */
  const termSection = document.getElementById('terminal');
  if (termSection) {
    new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) input.focus();
    }, { threshold: 0.4 }).observe(termSection);
  }


  /* ────────────────────────────────────────────────────────────
     MENSAJE DE BIENVENIDA + ls inicial
     ──────────────────────────────────────────────────────────── */
  updatePromptLabel();

  print(`<span class="t-info">╔══════════════════════════════════════════════════╗</span>`);
  print(`<span class="t-info">║  x224@portfolio  —  bash 5.2.0(1)-release        ║</span>`);
  print(`<span class="t-info">╚══════════════════════════════════════════════════╝</span>`);
  print(`<span class="t-success">Bienvenido.</span>  Escribe <span class="t-info">help</span> para ver comandos.  <span class="t-muted">Tab</span> autocompleta.`);
  br();
  printPromptLine('ls');
  COMMANDS.ls([]);

})();
