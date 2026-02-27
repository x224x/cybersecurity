/* ================================================================
   DATA.JS — Fuente de datos compartida
   ================================================================
   ⚠️  EDITA SOLO ESTE ARCHIVO para añadir writeups o casos forenses.
   Los cambios aparecerán automáticamente en:
     ✓ writeups.html  → tabla de máquinas
     ✓ forensics.html → tarjetas de casos
     ✓ Terminal interactiva → ls ~/writeups, ls ~/forensics, cat ...
   ================================================================ */

/* ────────────────────────────────────────────────────────────────
   WRITEUPS — añade un objeto por cada máquina resuelta
   ──────────────────────────────────────────────────────────────── */
window.MACHINES = [

  {
    name:       'Puppy',
    difficulty: 'medium',
    os:         'windows',
    platform:   'htb',
    pdf:        'writeups/puppy.pdf',   // null si no hay PDF todavía
    tools: [
      'Nmap', 'NetExec', 'Dig', 'Rpcclient',
      'impacket-GetNPUsers', 'impacket-GetUserSPNs',
      'Smbmap', 'BloodHound', 'Docker', 'net rpc',
      'KeePassXC', 'John the Ripper', 'keepass4brute',
      'LDAP', 'Evil-WinRM', 'WinPEAS', 'impacket-dpapi'
    ],
    techniques: [
      'Enumeration DNS, SMB, Kerberos, LDAP',
      'Net rpc (add group / change password)',
      'Abuse Generic Write & GenericAll rights',
      'Abuse DPAPI',
      'Dump Domain Hashes'
    ]
  },

  // ── Descomenta y edita para añadir más máquinas ──────────────
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


/* ────────────────────────────────────────────────────────────────
   CASOS FORENSES
   ──────────────────────────────────────────────────────────────── */
window.FORENSIC_CASES = [

  {
    filename: 'Volcado_Memoria_Windows.pdf',
    label:    'Volcado Memoria de Windows',
    pdf:      'forensic/Volcado Memoria de Windows.pdf',
  },
  {
    filename: 'Analisis_Firmware_IoT.pdf',
    label:    'Análisis Firmware IoT',
    pdf:      'forensic/Analisis Firmware IoT.pdf',
  },
  {
    filename: 'Analisis_iOS_13.4.1.pdf',
    label:    'Análisis iOS 13.4.1',
    pdf:      'forensic/Proyecto Analisis Sistema Operativo IOS.pdf',
  },
  {
    filename: 'Integridad_Pendrive.pdf',
    label:    'Integridad Pendrive',
    pdf:      'forensic/Integridad Pendrive.pdf',
  },

];
