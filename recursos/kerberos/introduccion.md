Kerberos es el protocolo de autenticación por defecto en Active Directory desde Windows Server 2000 (sustituyó a NTLM). Su idea central: el cliente nunca envía la contraseña por la red. En su lugar, una autoridad central de confianza —el **KDC**— emite *tickets* cifrados que prueban la identidad del usuario. Kerberos asume que la red es hostil (los paquetes pueden leerse, modificarse y reproducirse), por eso todo se apoya en criptografía de clave compartida.

#### Componentes que hay que tener claros

- **KDC (Key Distribution Center).** Es la fuente de confianza. En un dominio Windows lo ejecuta el Controlador de Dominio, porque guarda en AD todos los principales y sus hashes. Tiene dos subcomponentes: el **AS** (Authentication Server) y el **TGS** (Ticket Granting Server).
- **TGT (Ticket Granting Ticket).** El ticket "maestro" que recibes tras autenticarte. Sirve para pedir tickets de servicio sin volver a meter la contraseña (esto es el single sign-on). Va cifrado con la clave de la cuenta `krbtgt`.
- **Service Ticket (TGS).** Ticket para acceder a un servicio concreto. Va cifrado con el secreto de la cuenta que ejecuta ese servicio.
- **SPN (Service Principal Name).** Identificador único de un servicio, con formato `class/instance:port` (ej. `cifs/server-files.dragon.com`).
- **PAC (Privileged Attribute Certificate).** Estructura que el DC mete dentro del ticket con los datos de autorización del usuario (RID, grupos, UAC...). Permite al servicio saber qué permisos tienes sin volver a consultar AD.

---

#### El flujo completo

El proceso se divide en tres intercambios. Casi todos los ataques de Kerberos abusan de un punto concreto de este flujo, así que conviene tenerlo claro:

```
   CLIENTE                          KDC                         SERVICIO
  (attacker)                  (dragon-dc)                  (server-files)
      │                            │                             │
      │  1. AS-REQ                 │                             │
      │   (timestamp cifrado con   │                             │
      │    el hash del usuario)    │                             │
      │ ──────────────────────────►                             │
      │                            │                             │
      │  2. AS-REP                 │                             │
      │   (TGT + clave de sesión)  │                             │
      │ ◄──────────────────────────                             │
      │                            │                             │
      │  3. TGS-REQ                │                             │
      │   (TGT + SPN destino +     │                             │
      │    autenticador)           │                             │
      │ ──────────────────────────►                             │
      │                            │                             │
      │  4. TGS-REP                │                             │
      │   (ticket de servicio)     │                             │
      │ ◄──────────────────────────                             │
      │                            │                             │
      │  5. AP-REQ (ticket de servicio + autenticador)          │
      │ ────────────────────────────────────────────────────────►
      │                            │                             │
      │  6. AP-REP (solo si se pide autenticación mutua)        │
      │ ◄────────────────────────────────────────────────────────
      │                            │                             │
```

#### 1-2 · AS Exchange (obtener el TGT)

Cuando el usuario inicia sesión y no tiene TGT, el cliente manda un **AS-REQ** al KDC con el nombre del principal, el reino (dominio), el servicio destino (siempre `krbtgt` para un TGT) y los tipos de cifrado que soporta.

Por defecto las cuentas exigen **preautenticación**: el cliente cifra una marca de tiempo con el hash de su contraseña. El KDC la descifra con la copia del hash que tiene en AD; si cuadra, asume que eres tú (nadie más conoce la contraseña) y responde con un **AS-REP** que contiene el TGT y una clave de sesión.

Un detalle clave: el TGT lleva dentro una copia de la clave de sesión cifrada con el secreto del KDC (el hash de `krbtgt`). Otra copia va cifrada con el secreto del usuario en el AS-REP. El cliente descifra **su** copia y guarda TGT + clave; el TGT en sí no puede abrirlo, porque no conoce el secreto del KDC.

#### 3-4 · TGS Exchange (obtener un ticket de servicio)

Con el TGT, el cliente pide tickets de servicio. Manda un **TGS-REQ** con el SPN destino (ej. `cifs/server-files.dragon.com`), el TGT y un *autenticador* cifrado con la clave de sesión. Ese autenticador es lo que demuestra que la petición viene del dueño legítimo del TGT y no de alguien que lo interceptó.

El KDC usa el hash de `krbtgt` para abrir el TGT, saca la clave de sesión, descifra el autenticador y, si todo cuadra, busca el SPN en AD y emite un **TGS-REP** con el ticket de servicio (cifrado con el secreto de la cuenta del servicio) y una nueva clave de sesión de servicio. El KDC **no** comprueba si tienes permiso sobre el servicio: eso lo decide el propio servicio después.

#### 5-6 · AP Exchange (usar el ticket en el servicio)

El cliente presenta el ticket de servicio al servicio en un **AP-REQ** (normalmente embebido en el protocolo del servicio, p. ej. dentro del Session Setup de SMB), junto a otro autenticador. El servicio descifra el ticket con su propio secreto, saca la clave de sesión de servicio y valida el autenticador. Si el cliente pidió autenticación mutua, el servicio responde con un **AP-REP**.

Superar esta validación solo prueba **identidad**, no **autorización**. El servicio aún aplica sus propios controles de acceso (por ejemplo, la DACL de un recurso SMB) usando los grupos que vienen en el PAC.
