/* ================================================================
   DATA.JS — FUENTE ÚNICA DE DATOS  (single source of truth)
   ================================================================
   ⚠️  EDITA SOLO ESTE ARCHIVO para añadir contenido.
   Todo se actualiza automáticamente y a la vez en:
     ✓ writeups.html       → tabla de máquinas       (window.MACHINES)
     ✓ forensics.html      → tarjetas de casos        (window.FORENSIC_CASES)
     ✓ certifications.html → tarjetas de certs        (window.CERTS)
     ✓ resources.html      → tarjetas de conceptos    (window.CONCEPTS)
     ✓ Terminal interactiva → ls/cat de cada sección
   ----------------------------------------------------------------
   NOTA: una web estática NO puede leer el contenido de una carpeta
   desde el navegador. Por eso el "índice" del contenido vive aquí.
   Para el flujo "suelto un archivo y se añade solo" usa el script
   opcional  tools/build-data.mjs  (ver README al final del archivo).
   ================================================================ */


/* ════════════════════════════════════════════════════════════════
   1) WRITEUPS  — una entrada por máquina resuelta
   ════════════════════════════════════════════════════════════════
   Campos:
     name        nombre de la máquina
     difficulty  'easy' | 'medium' | 'hard'
     os          'windows' | 'linux' | 'other'
     platform    'htb' | 'thm' | 'other'
     pdf         ruta al PDF dentro de writeups/  (o null)
     tools       array de herramientas
     techniques  array de técnicas
   El orden del array = el orden en la tabla (lo nuevo arriba). */
window.MACHINES = [
  {
    name:       'Puppy',
    difficulty: 'medium',
    os:         'windows',
    platform:   'htb',
    pdf:        'writeups/puppy.pdf',
    tools: [
      'Nmap',
      'NetExec',
      'Dig',
      'Rpcclient',
      'impacket-GetNPUsers',
      'impacket-GetUserSPNs',
      'Smbmap',
      'BloodHound',
      'Docker',
      'net rpc',
      'KeePassXC',
      'John the Ripper',
      'keepass4brute',
      'LDAP',
      'Evil-WinRM',
      'WinPEAS',
      'impacket-dpapi',
    ],
    techniques: [
      'Enumeration DNS, SMB, Kerberos, LDAP',
      'Net rpc (add group / change password)',
      'Abuse Generic Write & GenericAll rights',
      'Abuse DPAPI',
      'Dump Domain Hashes',
    ]
  },

  {
    name:       'Axlle',
    difficulty: 'hard',
    os:         'windows',
    platform:   'htb',
    pdf:        'writeups/Axlle.pdf',
    tools: [
      'Nmap',
      'Dig',
      'Kerbrute',
      'WhatWeb',
      'x86_64-w64-mingw32-gcc',
      'Nishang',
      'Swaks',
      'MSFVenom',
      'Certutil',
      'WinPEAS',
      'BloodHound',
      'neo4j',
      'PowerView',
      'Evil-WinRM',
      'NetExec',
      'rlwrap',
      'Netcat',
    ],
    techniques: [
      'Enumeration DNS, SMTP, LDAP, Kerberos',
      'XLL phishing (macro bypass)',
      'SMTP spoofing (Swaks)',
      'Malicious .url shortcut',
      'Abuse ForceChangePassword',
      'LOLBIN abuse (StandaloneRunner)',
    ]
  },

  {
    name:       'Blazorized',
    difficulty: 'hard',
    os:         'windows',
    platform:   'htb',
    pdf:        'writeups/Blazorized.pdf',
    tools: [
      'Nmap',
      'Dig',
      'Kerbrute',
      'Wfuzz',
      'WhatWeb',
      'Burp Suite',
      'AvaloniaILSpy',
      'Python',
      'tcpdump',
      'Nishang',
      'SharpHound',
      'BloodHound',
      'PowerView',
      'Hashcat',
      'NetExec',
      'Evil-WinRM',
      'Mimikatz',
      'rlwrap',
    ],
    techniques: [
      'Subdomain & vhost fuzzing',
      'Blazor WASM DLL reversing',
      'JWT forgery',
      'SQL Injection (xp_cmdshell RCE)',
      'Targeted Kerberoasting (WriteSPN)',
      'Abuse ScriptPath (SYSVOL)',
      'DCSync + Pass-the-Hash',
    ]
  },

  {
    name:       'Analysis',
    difficulty: 'hard',
    os:         'windows',
    platform:   'htb',
    pdf:        'writeups/Analysis.pdf',
    tools: [
      'Nmap',
      'Dig',
      'WhatWeb',
      'Wfuzz',
      'Rpcclient',
      'Kerbrute',
      'Python',
      'Impacket-GetNPUsers',
      'NetExec',
      'Impacket-GetUserSPNs',
      'Smbmap',
      'Ldapdomaindump',
      'Burp Suite',
      'PHP Webshell',
      'Nishang',
      'WinPEAS',
      'Evil-WinRM',
      'Msfvenom',
      'Netcat',
      'rlwrap',
    ],
    techniques: [
      'Subdomain & parameter fuzzing',
      'LDAP Injection (blind exfil)',
      'File upload bypass (webshell)',
      'AutoLogon creds (registry)',
      'DLL Hijacking (Snort)',
    ]
  },

  {
    name:       'Jab',
    difficulty: 'medium',
    os:         'windows',
    platform:   'htb',
    pdf:        'writeups/Jab.pdf',
    tools: [
      'Nmap',
      'Dig',
      'Rpcclient',
      'NetExec',
      'Smbmap',
      'Smbclient',
      'Pidgin',
      'Kerbrute',
      'Grep',
      'Impacket-GetNPUsers',
      'John the Ripper',
      'Ldapdomaindump',
      'bloodhound-python',
      'Impacket-dcomexec',
      'tcpdump',
      'Chisel',
      'Openfire CVE-2023-32315',
    ],
    techniques: [
      'XMPP user enumeration (Pidgin)',
      'AS-REP Roasting',
      'Credential leak (chat logs)',
      'RCE via DCOM (MMC20)',
      'Tunneling (Chisel)',
      'Openfire RCE (CVE-2023-32315)',
    ]
  },

  {
    name:       'Manager',
    difficulty: 'medium',
    os:         'windows',
    platform:   'htb',
    pdf:        'writeups/Manager.pdf',
    tools: [
      'Nmap',
      'Dig',
      'WhatWeb',
      'Rpcclient',
      'Kerbrute',
      'Grep',
      'Impacket-GetNPUsers',
      'Impacket-GetUserSPNs',
      'Ldapdomaindump',
      'Smbmap',
      'Impacket-mssqlclient',
      'xp_dirtree',
      'Evil-WinRM',
      'python -m http.server',
      'ADPEAS',
      'Certipy-ad',
    ],
    techniques: [
      'Enumeration DNS, SMB, LDAP, MSSQL',
      'Password spraying',
      'MSSQL xp_dirtree (file disclosure)',
      'Cleartext creds in backup',
      'AD CS abuse (ESC7)',
      'Pass-the-Hash',
    ]
  },

  {
    name:       'Hospital',
    difficulty: 'medium',
    os:         'windows',
    platform:   'htb',
    pdf:        'writeups/Hospital.pdf',
    tools: [
      'Nmap',
      'Dig',
      'NetExec',
      'Smbmap',
      'WhatWeb',
      'Wfuzz',
      'Burp Suite',
      'Hashcat',
      'mysql',
      'Rpcclient',
      'Impacket-GetNPUsers',
      'Impacket-GetUserSPNs',
      'GameOverlay',
      'GhostScript CVE-2023-36664',
      'Netcat',
      'Evil-WinRM',
      'Icacls',
    ],
    techniques: [
      'File upload bypass (.phar)',
      'disable_functions bypass (popen)',
      'bcrypt cracking (Hashcat)',
      'Kernel exploit (CVE-2023-32629)',
      'GhostScript RCE (CVE-2023-36664)',
      'Writable path abuse (XAMPP)',
    ]
  },

  {
    name:       'Cascade',
    difficulty: 'medium',
    os:         'windows',
    platform:   'htb',
    pdf:        'writeups/Cascade.pdf',
    tools: [
      'Nmap',
      'Dig',
      'Rpcclient',
      'Grep',
      'Impacket-GetNPUsers',
      'Smbmap',
      'Smbclient',
      'NetExec',
      'Ldapsearch',
      'Base64',
      'Impacket-GetUserSPNs',
      'python -m http.server',
      'xxd',
      'vncpwd',
      'Evil-WinRM',
      'Sqlite3',
      'Strings',
      'dotPeek',
      'PowerShell',
    ],
    techniques: [
      'RPC null session enumeration',
      'LDAP cascadeLegacyPwd (Base64)',
      'VNC password decrypt',
      'SQLite & .NET reversing',
      'AES decrypt (CyberChef)',
      'AD Recycle Bin abuse',
    ]
  },

  {
    name:       'StreamIO',
    difficulty: 'medium',
    os:         'windows',
    platform:   'htb',
    pdf:        'writeups/StreamIO.pdf',
    tools: [
      'Nmap',
      'Dig',
      'WhatWeb',
      'Wfuzz',
      'Kerbrute',
      'Impacket-GetNPUsers',
      'Impacket-GetUserSPNs',
      'Burp Suite',
      'John the Ripper',
      'THC-Hydra',
      'PHP Wrappers',
      'Certutil',
      'Netcat',
      'Sqlcmd',
      'Evil-WinRM',
      'Firepwd',
      'SharpHound',
      'BloodHound',
      'Neo4j',
      'PowerView',
      'Ldapsearch',
      'NetExec',
    ],
    techniques: [
      'Subdomain & directory fuzzing',
      'SQL Injection (MSSQL)',
      'MD5 hash cracking',
      'LFI via PHP wrappers',
      'RFI to RCE (eval)',
      'Firefox creds (Firepwd)',
      'Abuse WriteOwner',
      'LAPS read (ReadLAPSPassword)',
    ]
  },

  {
    name:       'BabyTwo',
    difficulty: 'medium',
    os:         'windows',
    platform:   'htb',
    pdf:        'writeups/BabyTwo.pdf',
    tools: [
      'Nmap',
      'Dig',
      'Rpcclient',
      'Netexec',
      'Smbmap',
      'Smbclient',
      'Kerbrute',
      'Impacket-GetNPUsers',
      'Impacket-GetUserSPNs',
      'Impacket-psexec',
      'Impacket-secretsdump',
      'Lnkparse',
      'bloodhound-python',
      'Docker',
      'Certutil',
      'PowerView',
      'pyGPOAbuse',
      'rlwrap',
      'Netcat',
    ],
    techniques: [
      'RID bruteforcing (NetExec)',
      'Password spraying',
      'SYSVOL LogonScript poisoning',
      'Abuse WriteDacl / WriteOwner',
      'GPO abuse (pyGPOAbuse)',
      'DCSync (secretsdump)',
    ]
  },

  {
    name:       'TimeLapse',
    difficulty: 'easy',
    os:         'windows',
    platform:   'htb',
    pdf:        'writeups/TimeLapse.pdf',
    tools: [
      'Nmap',
      'Dig',
      'Rpcclient',
      'NetExec',
      'Smbclient',
      'Smbmap',
      'zip2john',
      'John the Ripper',
      'pfx2john',
      'OpenSSL',
      'Evil-WinRM',
      'pyLAPS',
      'PowerShell',
    ],
    techniques: [
      'SMB null session enumeration',
      'ZIP & PFX cracking (John)',
      'Certificate-based WinRM auth',
      'PowerShell history creds',
      'LAPS abuse (LAPS_Readers)',
    ]
  },

  {
    name:       'Acute',
    difficulty: 'hard',
    os:         'windows',
    platform:   'htb',
    pdf:        'writeups/Acute.pdf',
    tools: [
      'Nmap',
      'OpenSSL',
      'WhatWeb',
      'ExifTool',
      'LibreOffice',
      'MSFVenom',
      'Metasploit',
      'python -m http.server',
      'PowerShell',
      'net user',
    ],
    techniques: [
      'SSL cert & metadata recon (Exiftool)',
      'Default password (credential stuffing)',
      'PSWA web access',
      'Meterpreter screenshare',
      'PowerShell Remoting',
      'Scheduled task abuse (.bat)',
      'AD group abuse (Site_Admin)',
    ]
  },

  {
    name:       'Mentor',
    difficulty: 'medium',
    os:         'linux',
    platform:   'htb',
    pdf:        'writeups/Mentor.pdf',
    tools: [
      'Nmap',
      'WhatWeb',
      'Wfuzz',
      'Burp Suite',
      'onesixtyone',
      'snmpwalk',
      'snmpbrute.py',
      'SSH',
      'grep',
    ],
    techniques: [
      'Subdomain fuzzing (Host header)',
      'API broken access control',
      'JWT manipulation',
      'SNMP community bruteforce',
      'SNMP info disclosure',
      'Config file creds',
    ]
  },

  {
    name:       'Carpediem',
    difficulty: 'hard',
    os:         'linux',
    platform:   'htb',
    pdf:        'writeups/Carpediem.pdf',
    tools: [
      'Nmap',
      'Wfuzz',
      'Zoiper5',
      'tcpdump',
      'Wireshark',
      'ssh port forwarding',
      'Backdrop CMS',
      'PHP Webshell',
      'Docker CVE-2022-0492',
    ],
    techniques: [
      'Subdomain fuzzing',
      'API ID fuzzing (Trudesk)',
      'VoIP voicemail (Zoiper)',
      'Traffic sniffing (tcpdump)',
      'TLS decryption (Wireshark)',
      'CMS module RCE (Backdrop)',
      'Container escape (CVE-2022-0492)',
    ]
  },

  {
    name:       'OpenSource',
    difficulty: 'easy',
    os:         'linux',
    platform:   'htb',
    pdf:        'writeups/OpenSource.pdf',
    tools: [
      'Nmap',
      'WhatWeb',
      'Burp Suite',
      'Netcat',
      'chisel',
      'Git',
      'curl',
      'Monitor Commands',
      'Git Hook',
    ],
    techniques: [
      'Source code review (.git)',
      'Git history creds',
      'Path abuse (os.path.join)',
      'RCE via file overwrite',
      'Tunneling (Chisel)',
      'Gitea SSH key theft',
      'Git Hooks privesc',
    ]
  },

  {
    name:       'Feline',
    difficulty: 'hard',
    os:         'linux',
    platform:   'htb',
    pdf:        'writeups/Feline.pdf',
    tools: [
      'Nmap',
      'WhatWeb',
      'Burp Suite',
      'ysoserial',
      'tcpdump',
      'python -m http.server',
      'Netcat',
      'chisel',
      'Searchsploit',
      'SaltStack exploit',
      'Docker API',
    ],
    techniques: [
      'Path disclosure (error)',
      'Tomcat deserialization (CVE-2020-9484)',
      'JSESSIONID path traversal',
      'Tunneling (Chisel)',
      'SaltStack RCE (CVE-2020-11651)',
      'Docker socket escape',
    ]
  },

  {
    name:       'Oouch',
    difficulty: 'hard',
    os:         'linux',
    platform:   'htb',
    pdf:        'writeups/Oouch.pdf',
    tools: [
      'Nmap',
      'WhatWeb',
      'Wfuzz',
      'Burp Suite',
      'curl',
      'uwsgi_exp.py',
      'SSH',
      'Netcat',
      'FTP',
    ],
    techniques: [
      'FTP anonymous recon',
      'OAuth2 CSRF (account link)',
      'Authorization code theft',
      'API token abuse (SSH key)',
      'uWSGI RCE',
      'DBus command injection',
    ]
  },

  {
    name:       'Inception',
    difficulty: 'medium',
    os:         'linux',
    platform:   'htb',
    pdf:        'writeups/Inception.pdf',
    tools: [
      'Nmap',
      'WhatWeb',
      'Searchsploit',
      'curl',
      'base64',
      'Wfuzz',
      'Proxychains',
      'John the Ripper',
      'davtest',
      'Forward Shell',
      'ftp',
      'tftp',
      'Netcat',
    ],
    techniques: [
      'Dompdf LFI (PHP wrappers)',
      'Squid proxy pivoting',
      'WebDAV RCE',
      'apr1 hash cracking',
      'Forward shell (named pipes)',
      'APT Pre-Invoke hook abuse',
    ]
  },

  {
    name:       'Fulcrum',
    difficulty: 'insane',
    os:         'linux',
    platform:   'htb',
    pdf:        'writeups/Fulcrum.pdf',
    tools: [
      'Nmap',
      'WhatWeb',
      'wfuzz',
      'Burp Suite',
      'python -m http.server',
      'Netcat',
      'PHP Wrappers',
      'chisel',
      'evil-winrm',
      'Nishang',
      'PowerView',
      'smbclient',
      'net use',
      'rlwrap',
    ],
    techniques: [
      'API fuzzing',
      'XXE (OOB exfil)',
      'XXE to SSRF',
      'RFI to RCE',
      'PowerShell SecureString decrypt',
      'WinRM pivot',
      'LDAP creds (web.config)',
      'SYSVOL script creds',
    ]
  },

  {
    name:       'Unobtainium',
    difficulty: 'hard',
    os:         'linux',
    platform:   'htb',
    pdf:        'writeups/Unobtainium.pdf',
    tools: [
      'Nmap',
      'WhatWeb',
      'Zip and Unzip',
      'dpkg-deb',
      'file',
      'Wireshark',
      'curl',
      'base64',
      'Netcat',
      'script',
      'kubectl',
      'python -m http.server',
      'wget',
      'Chisel',
    ],
    techniques: [
      'Debian package analysis',
      'Traffic interception (Wireshark)',
      'LFI (source disclosure)',
      'Prototype Pollution',
      'Command injection chaining',
      'Kubernetes (K8s) RBAC enumeration',
      'Bad Pods privesc',
    ]
  },

  {
    name:       'Ariekei',
    difficulty: 'insane',
    os:         'linux',
    platform:   'htb',
    pdf:        'writeups/Ariekei.pdf',
    tools: [
      'Nmap',
      'WhatWeb',
      'WAFWOOF',
      'wfuzz',
      'Cewl',
      'Burp Suite',
      'openssl',
      'tcpdump',
      'Netcat',
      'icat',
      'ssh',
      'script',
      'ImageTragick CVE-2016-3714',
      'ssh2john',
      'John the Ripper',
      'Docker',
    ],
    techniques: [
      'WAF detection (wafw00f)',
      'Subdomain fuzzing',
      'Shellshock (CVE-2014-6271)',
      'ImageTragick RCE (CVE-2016-3714)',
      'SSH pivoting (bastion)',
      'WAF bypass (internal)',
      'SSH key cracking',
      'Docker mount privesc',
    ]
  },

  {
    name:       'Toby',
    difficulty: 'insane',
    os:         'linux',
    platform:   'htb',
    pdf:        'writeups/Toby.pdf',
    tools: [
      'Nmap',
      'WhatWeb',
      'wfuzz',
      'Gobuster',
      'php-malware-scanner',
      'Netcat',
      'Wireshark',
      'CyberChef',
      'script',
      'Chisel',
      'Proxychains',
      'mysql',
      'Hashcat',
      'SSH',
      'pspy',
      'SQLite3',
      'Ghidra',
    ],
    techniques: [
      'Subdomain & Gogs enumeration',
      'WordPress backdoor analysis',
      'XOR cryptanalysis',
      'Tunneling (Chisel/Proxychains)',
      'Rogue MySQL server',
      'PRNG seed prediction',
      'Race condition (SSH key)',
      'PAM timing attack (Ghidra)',
    ]
  },

  // ── Plantilla para una nueva máquina ─────────────────────────
  // {
  //   name:       'BoardLight',
  //   difficulty: 'easy',
  //   os:         'linux',
  //   platform:   'htb',
  //   pdf:        'writeups/boardlight.pdf',
  //   tools:      ['Nmap', 'Gobuster', 'Dolibarr', 'LinPEAS'],
  //   techniques: ['Web Enumeration', 'RCE via Dolibarr', 'SUID Abuse']
  // },

];


/* ════════════════════════════════════════════════════════════════
   2) CASOS FORENSES  — usado por forensics.html Y por la terminal
   ════════════════════════════════════════════════════════════════
   Campos:
     filename   nombre "de fichero" que se ve en la terminal (sin espacios)
     title      título del informe (lo que se ve en la tarjeta)
     icon       emoji representativo
     pdf         ruta al PDF dentro de forensic/
     tags        array {label, cls}  (clases: tag-iot, tag-forense,
                 tag-memoria, tag-movil, tag-windows, tag-linux,
                 tag-ios, tag-malware, tag-red)
     summary     descripción breve (1-2 frases)
     findings    array de hallazgos clave (bullets)
     tools       array de herramientas */
window.FORENSIC_CASES = [
  {
    filename: 'Volcado_Memoria_Windows.pdf',
    title:    'Volcado de Memoria — Análisis de Ataque Multivectorial',
    icon:     '🧠',
    pdf:      'forensic/Volcado Memoria de Windows.pdf',
    tags: [
      { label: 'Memoria RAM', cls: 'tag-memoria' },
      { label: 'Windows',     cls: 'tag-windows' },
      { label: 'Malware',     cls: 'tag-malware' },
      { label: 'Red',         cls: 'tag-red'     },
    ],
    summary: 'Análisis de un volcado de memoria RAM de un servidor Windows con DVWA comprometido. Se reconstruyó un ataque multivectorial completo: desde reconocimiento hasta persistencia y limpieza de huellas.',
    findings: [
      'LFI explotado para leer hosts y configuración de phpMyAdmin',
      'SQLi con SQLmap → webshell tmpukudk.php vía INTO OUTFILE',
      'Inyección de comandos mediante operador && en /vulnerabilities/exec/',
      'Webshells subidos: c99.php, phpshell.php, phpshell2.php (reverse shell)',
      'Usuarios creados: hacker, user1 → grupo "Remote Desktop Users"',
      'RDP habilitado via netsh para acceso persistente',
      'IP atacante identificada: 192.168.56.102',
    ],
    tools: ['Volatility', 'SQLmap', 'DVWA', 'Wireshark', 'strings', 'grep'],
  },
  {
    filename: 'Analisis_Firmware_IoT.pdf',
    title:    'Análisis de Firmware IoT — Cámara y Bombilla',
    icon:     '📡',
    pdf:      'forensic/Analisis Firmware IoT.pdf',
    tags: [
      { label: 'IoT',     cls: 'tag-iot'    },
      { label: 'Forense', cls: 'tag-forense' },
      { label: 'Linux',   cls: 'tag-linux'  },
    ],
    summary: 'Análisis forense de dos dispositivos IoT con resultados contrastantes. La cámara permitió extracción completa del firmware; la bombilla empleaba cifrado que imposibilitó el análisis.',
    findings: [
      'Cámara: sistemas Squashfs (SO) + JFFS2 (configuración)',
      'Servicios detectados: miio_client, miio_avstreamer, mdev',
      '11 usuarios listados — root activo, resto con shell deshabilitado',
      'Bombilla: firmware cifrado → imposible auditar vulnerabilidades',
      'Falta de transparencia del fabricante = riesgo para el usuario final',
    ],
    tools: ['binwalk', 'strings', 'hexdump', 'unsquashfs', 'jefferson'],
  },
  {
    filename: 'Analisis_iOS_13.4.1.pdf',
    title:    'Proyecto Análisis Forense — iOS 13.4.1',
    icon:     '📱',
    pdf:      'forensic/Proyecto Analisis Sistema Operativo IOS.pdf',
    tags: [
      { label: 'Móvil',   cls: 'tag-movil'  },
      { label: 'iOS',     cls: 'tag-ios'     },
      { label: 'Forense', cls: 'tag-forense' },
    ],
    summary: 'Extracción y análisis forense de un iPhone con iOS 13.4.1. Extracción lógica documentada con cadena de custodia completa y análisis de artefactos mediante iLEAPP.',
    findings: [
      'Extracción lógica con iTunes y Magnet Acquire',
      'Datos extraídos: IMEI, nº serie, iOS versión, teléfono (+1 919 579-4674)',
      'Número identificado vía Burner Accounts report en iLEAPP',
      'iLEAPP procesó el volcado 13-4-1.tar → artefactos del sistema',
      'Permisos de apps analizados: contactos, ubicación, micrófono',
      'Hashes MD5 y SHA-256 calculados → integridad verificada',
      'Almacenamiento cifrado siguiendo cadena de custodia',
    ],
    tools: ['iLEAPP', 'iTunes', 'Magnet Acquire', 'md5sum', 'sha256sum'],
  },
  {
    filename: 'Integridad_Pendrive.pdf',
    title:    'Integridad de Evidencia — Clonación Forense de Pendrive',
    icon:     '💾',
    pdf:      'forensic/Integridad Pendrive.pdf',
    tags: [
      { label: 'Forense', cls: 'tag-forense' },
      { label: 'Linux',   cls: 'tag-linux'   },
      { label: 'Windows', cls: 'tag-windows'  },
    ],
    summary: 'Clonación forense de un pendrive 16 GB comparando metodología en Linux (SIFT) y Windows 10 Pro. Se evaluó la prevención de montaje automático y la validez de los hashes obtenidos.',
    findings: [
      'Linux: udisks2 deshabilitado → prevención eficaz de montaje automático',
      'dc3dd + dd → hashes SHA-256 y SHA-512 idénticos → copia bit-a-bit válida',
      'Windows: diskpart, mountvol y registro resultaron ineficaces',
      'Directivas de Grupo (gpedit.msc) → solución más robusta en Windows',
      'FTK Imager → hashes diferentes a Linux → posible alteración de metadatos',
      'Conclusión: Linux superior para adquisición forense íntegra',
    ],
    tools: ['dc3dd', 'dd', 'FTK Imager', 'SIFT Workstation', 'sha256sum', 'gpedit.msc'],
  },
];


/* ════════════════════════════════════════════════════════════════
   3) CERTIFICACIONES  — lo más reciente primero
   ════════════════════════════════════════════════════════════════
   Campos:
     name      nombre completo
     short     nombre corto (para timeline / terminal)
     issuer    organismo emisor
     img       ruta a la imagen (.png) o documento (.pdf) en certs/
               · si es .pdf se renderiza una vista previa de la 1ª página
     date      fecha legible (ej: "30 may 2026")
     category  'pentest' | 'security' | 'cloud' | 'microsoft'
     verify    URL de verificación o null */
window.CERTS = [
  {
    name:     'CRTO — Certified Red Team Operator',
    short:    'CRTO',
    issuer:   'Zero-Point Security',
    img:      'certs/CRTO.pdf',
    date:     '30 may 2026',
    category: 'pentest',
    verify:   null,
  },
  {
    name:     'eCPPT v3 — Certified Professional Penetration Tester',
    short:    'eCPPTv3',
    issuer:   'eLearnSecurity · INE',
    img:      'certs/eCPPTv3.png',
    date:     '26 feb 2026',
    category: 'pentest',
    verify:   null,
  },
  {
    name:     'eJPT v2 — eLearnSecurity Junior Penetration Tester',
    short:    'eJPTv2',
    issuer:   'eLearnSecurity · INE',
    img:      'certs/eJPTv2.png',
    date:     '25 dic 2025',
    category: 'pentest',
    verify:   null,
  },
  {
    name:     'CEH v13 — Certified Ethical Hacker',
    short:    'CEHv13',
    issuer:   'EC-Council',
    img:      'certs/CEHv13.png',
    date:     '18 nov 2025',
    category: 'security',
    verify:   null,
  },
  {
    name:     'AWS Certified Cloud Practitioner',
    short:    'AWS CCP',
    issuer:   'Amazon Web Services',
    img:      'certs/AWSCloudPractitioner.png',
    date:     '30 jun 2025',
    category: 'cloud',
    verify:   null,
  },
  {
    name:     'SC-900 — Microsoft Security Fundamentals',
    short:    'SC-900',
    issuer:   'Microsoft',
    img:      'certs/SC-900.png',
    date:     '6 mar 2025',
    category: 'cloud',
    verify:   null,
  },
  {
    name:     'CCST Cybersecurity',
    short:    'CCST',
    issuer:   'Cisco',
    img:      'certs/CCST.png',
    date:     '14 ene 2025',
    category: 'security',
    verify:   null,
  },
];


/* ════════════════════════════════════════════════════════════════
   4) CONCEPTOS  — base de conocimiento (resources.html)
   ════════════════════════════════════════════════════════════════
   Cada concepto es como una "carpeta" con su contenido.
   Campos:
     id        identificador único (sin espacios) → se usa en la URL y la terminal
     title     título visible
     icon      emoji
     category  agrupador (ej: 'Active Directory', 'Web', 'Forense'...)
     summary   resumen de 1 frase para la tarjeta
     tags      array de strings (etiquetas)
     body      contenido en HTML  (se muestra en un panel al hacer clic)
               -- o bien --
     sections  array de sub-apartados. Convierte el concepto en "contenedor":
               al abrirlo muestra una sub-tarjeta por apartado. Cada apartado
               carga su Markdown desde recursos/<id-concepto>/<id-apartado>.md
               Cada entrada: { id, title, icon, summary }
               Opcional: 'intro' (texto bajo el título del contenedor).
               -- o bien --
     file      ruta a un archivo en recursos/  (ej: 'recursos/kerberos.html')
               Si pones 'file', se abre en pestaña nueva.
   ----------------------------------------------------------------
   Prioridad: sections > file > body.
   Para añadir un concepto normal: copia un objeto, cambia id/title y escribe
   el 'body'. Para uno largo con apartados: usa 'sections' (ver domain-trusts). */
window.CONCEPTS = [

  {
    id:       'kerberos',
    title:    'Kerberos',
    icon:     '🎫',
    category: 'Active Directory',
    summary:  'Protocolo de autenticación de AD basado en tickets: funcionamiento interno, delegación y abusos (S4U, RBCD, unconstrained).',
    tags:     ['AD', 'Autenticación', 'Tickets', 'Delegación', 'S4U', 'RBCD'],
    intro:    'Kerberos es el protocolo de autenticación por defecto en Active Directory: usa tickets cifrados emitidos por el KDC en vez de enviar la contraseña por la red. Pulsa un apartado para abrirlo.',
    // Concepto "contenedor". Carpeta: recursos/kerberos/<id>.md
    sections: [
      { id: 'introduccion',             title: 'Introducción al protocolo',        icon: '📋', summary: 'KDC, TGT, TGS, SPN, PAC y el flujo completo de autenticación (AS/TGS/AP).' },
      { id: 'kerberos-tickets',         title: 'Kerberos Tickets',                 icon: '🎫', summary: 'Estructura de los tickets y extracción de credenciales desde ellos.' },
      { id: 'unconstrained-delegation', title: 'Unconstrained Delegation',         icon: '🔓', summary: 'Delegación sin restricciones: captura de TGT desde memoria con Rubeus monitor.' },
      { id: 'constrained-delegation',   title: 'Constrained Delegation',           icon: '🎯', summary: 'S4U2self / S4U2proxy, transición de protocolo y ataque con Rubeus s4u.' },
      { id: 'rbcd',                     title: 'Resource-Based Constrained Deleg.', icon: '🔗', summary: 'RBCD: abuso de msDS-AllowedToActOnBehalfOfOtherIdentity y MachineAccountQuota.' },
      { id: 's4u2self-takeover',        title: 'S4U2self Computer Takeover',       icon: '💻', summary: 'Toma de control de un equipo (incluso DC) forzando autenticación + S4U2self.' },
      { id: 'service-name-substitution',title: 'Service Name Substitution',        icon: '🔄', summary: 'Intercambio del SPN en un ticket de servicio (/altservice) para pivotar.' },
    ],
  },

  {
    id:       'domain-trusts',
    title:    'Forest & Domain Trusts',
    icon:     '🌲',
    category: 'Active Directory',
    summary:  'Relaciones de confianza entre dominios y bosques: tipos, transitividad, TDO, trust accounts y escalada Child → Forest Root.',
    tags:     ['AD', 'Trusts', 'Forest', 'Kerberos', 'SID History'],
    intro:    'Una confianza permite que un bosque o dominio comparta recursos con otro. Pulsa un apartado para abrirlo.',
    // Concepto "contenedor": al abrirlo muestra sub-tarjetas (una por apartado).
    // Cada apartado carga su .md desde recursos/domain-trusts/<id>.md
    // (la carpeta debe llamarse igual que el id del concepto: 'domain-trusts')
    // Para añadir un apartado: crea el .md y añade una entrada aquí.
    sections: [
      { id: 'introduccion', title: 'Introducción y fundamentos',           icon: '📋', summary: 'Tipos de confianza, transitividad, dirección, TDO y límites de seguridad.' },
      { id: 'parent-child', title: 'Parent/Child y escalada',              icon: '👨‍👧', summary: 'Confianza implícita y escalada Child → Forest Root: SID History, Golden y Diamond Ticket.' },
      { id: 'inbound',      title: 'Inbound Trusts',                        icon: '🔀', summary: 'SID Filtering, Foreign Security Principals y forja de referral tickets.' },
      { id: 'outbound',     title: 'Outbound Trusts',                       icon: '📤', summary: 'Confianza de salida y extracción de la inter-realm key del TDO.' },
      { id: 'inter-realm',  title: 'Inter-realm: Kerberos y Trust Accounts', icon: '🔑', summary: 'Kerberos entre reinos, estructura de las trust accounts y dónde vive la clave.' },
    ],
  },

  // ── Plantilla para un nuevo concepto ─────────────────────────
  // {
  //   id:       'lfi-rfi',
  //   title:    'LFI / RFI',
  //   icon:     '📂',
  //   category: 'Web',
  //   summary:  'Inclusión de ficheros local/remota y caminos a RCE.',
  //   tags:     ['Web', 'OWASP'],
  //   body:     `<p>Tu explicación en HTML...</p>`,
  //   // o:  file: 'recursos/lfi-rfi.html',
  // },

];
