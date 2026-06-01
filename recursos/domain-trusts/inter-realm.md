#### 🌐 Kerberos entre distintos reinos

```
  REINO: dragon.com                          REINO: phoenix.com
  ═════════════════                          ══════════════════

  [Cliente: merlin]   [KDC dragon]           [KDC phoenix]
         │                 │                       │
         │                 │                       │
         │  ┌─────────────────────────────────┐    │
         │  │  PASO 0: merlin ya tiene su TGT │    │
         │  │  (obtenido al hacer login en    │    │
         │  │   dragon.com normalmente)       │    │
         │  └─────────────────────────────────┘    │
         │                 │                       │
         │                 │                       │
         │──1. TGS-REQ────>│                       │
         │  ┌────────────┐ │                       │
         │  │ TGT normal │ │                       │
         │  │ realm =    │ │                       │
         │  │ phoenix.com│ │                       │
         │  │ sname =    │ │                       │
         │  │ servidor/  │ │                       │
         │  │ phoenix.com│ │                       │
         │  └────────────┘ │                       │
         │                 │                       │
         │                 │ "El servicio pedido   │
         │                 │  está en phoenix.com, │
         │                 │  no aquí..."          │
         │                 │                       │
         │                 │ Busca cuenta PHOENIX$ │
         │                 │ y usa su password     │
         │                 │ (= inter-realm key)   │
         │                 │ para cifrar el TGT    │
         │                 │                       │
         │<─2. TGT inter───│                       │
         │     reino       │                       │
         │  ┌────────────┐ │                       │
         │  │ realm =    │ │                       │
         │  │ dragon.com │ │                       │
         │  │ sname =    │ │                       │
         │  │ krbtgt/    │ │                       │
         │  │ phoenix.com│ │                       │
         │  │ cifrado con│ │                       │
         │  │ inter-realm│ │                       │
         │  │    key     │ │                       │
         │  └────────────┘ │                       │
         │                 │                       │
         │──3. TGS-REQ────────────────────────────>│
         │  ┌────────────┐                         │
         │  │TGT inter-  │                         │
         │  │reino       │          "Descifro con  │
         │  │(referral)  │           mi copia de   │
         │  └────────────┘           inter-realm   │
         │                           key (en TDO)  │
         │                           y verifico..."│
         │                                         │
         │<─4. Ticket de servicio final────────────│
         │  ┌────────────┐                         │
         │  │ Ticket para│                         │
         │  │ servidor/  │                         │
         │  │ phoenix.com│                         │
         │  └────────────┘                         │
         │                                         │
         v
  [Accede al servicio en phoenix.com] +
```

---

#### 🏗️ Trust Accounts: estructura

```
╔══════════════════════════════╗     ╔══════════════════════════════╗
║       REINO: dragon.com      ║     ║       REINO: phoenix.com     ║
║                              ║     ║                              ║
║  KDC / AD                    ║     ║  KDC / AD                    ║
║  ┌──────────────────────┐    ║     ║  ┌──────────────────────┐    ║
║  │ krbtgt               │    ║     ║  │ krbtgt               │    ║
║  │ merlin               │    ║     ║  │ aria                 │    ║
║  │ ...                  │    ║     ║  │ ...                  │    ║
║  │                      │    ║     ║  │                      │    ║
║  │ PHOENIX$             │<───╬─────╬──┤ DRAGON$              │    ║
║  │ (trust account)      │    ║     ║  │ (trust account)      │    ║
║  └──────────────────────┘    ║     ║  └──────────────────────┘    ║
║                              ║     ║                              ║
╚══════════════════════════════╝     ╚══════════════════════════════╝

  Cada reino registra al otro           Cada uno representa al TGS
  como principal especial               del reino opuesto
```

---

#### 🔑 ¿Dónde vive la clave inter-reino?

```
╔══════════════════════╗                  ╔════════════════════════╗
║      dragon.com      ║                  ║      phoenix.com       ║
║                      ║                  ║                        ║
║  Trust Account:      ║                  ║  TDO (Trust Domain     ║
║  ┌────────────────┐  ║                  ║  Object):              ║
║  │   PHOENIX$     │  ║                  ║  ┌──────────────────┐  ║
║  │                │  ║   misma clave    ║  │  dragon.com TDO  │  ║
║  │  password  =   │  ║ <══════════════> ║  │                  │  ║
║  │ [inter-realm   │  ║                  ║  │  inter-realm key │  ║
║  │    key]        │  ║                  ║  │  almacenada aquí │  ║
║  └────────────────┘  ║                  ║  └──────────────────┘  ║
╚══════════════════════╝                  ╚════════════════════════╝

   ^ La clave ES la                         ^ La clave está en
   "contraseña" de                           el objeto TDO
   la cuenta PHOENIX$
```

#### 🔍 Consulta LDAP: encontrar Trust Accounts

```
(samAccountType=805306370) --attributes samAccountName
```

```
┌─────────────────────────────────────────────────────────┐
│  Desde dragon.com            Desde phoenix.com          │
│                                                         │
│  ┌─────────────────────┐    ┌─────────────────────┐     │
│  │ Binding to dragon   │    │ Binding to phoenix  │     │
│  │ KDC...              │    │ KDC...              │     │
│  │                     │    │                     │     │
│  │ sAMAccountName:     │    │ sAMAccountName:     │     │
│  │                     │    │                     │     │
│  │    PHOENIX$  <───┐  │    │  ┌───> DRAGON$      │     │
│  └─────────────────────┘    └─────────────────────┘     │
│                    │              │                     │
│                    └──────────────┘                     │
│              cada dominio ve al otro                    │
└─────────────────────────────────────────────────────────┘
```

La lógica es siempre la misma: **cada dominio registra una trust account con el nombre del dominio opuesto**. Por eso la consulta desde cada lado devuelve un resultado diferente: estás viendo el reflejo del otro reino en tu propio AD.
