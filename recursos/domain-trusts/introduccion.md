#### 📋 Tipos de confianza

```
┌─────────────────┬────────────┬─────────────┬──────────────────────────────┐
│ Tipo            │ Dirección  │ Transitiva  │ Cuándo se crea               │
├─────────────────┼────────────┼─────────────┼──────────────────────────────┤
│ Parent/Child    │ Dos vías   │ Sí          │ Al añadir dominio hijo       │
│ Tree-Root       │ Dos vías   │ Sí          │ Al añadir árbol al bosque    │
│ External        │ Una o dos  │ No          │ Entre dominios distintos     │
│ Forest          │ Una o dos  │ Sí          │ Entre bosques distintos      │
└─────────────────┴────────────┴─────────────┴──────────────────────────────┘
```

---

#### 🔁 Transitiva vs No transitiva

```
        TRANSITIVA                    NO TRANSITIVA
                                    
  A ◄──► B ◄──► C                  A ◄──► B ◄──► C
  A ◄──────────► C                  A x──────────► C
  (implícita)                        (no existe)
```

---

#### ➡️ Dirección de la confianza

```
  Desde Domain A:  trust INBOUND   ──►  accede a recursos de B +
  Desde Domain C:  trust OUTBOUND  ◄──  no puede acceder a A   x
```

```
┌─────────────────────────────────────────────────────┐
│  !  Las confianzas de dos vías en AD son            │
│  simplemente dos confianzas de una vía opuestas     │
└─────────────────────────────────────────────────────┘
```

---

#### 🗄️ TDO (Trusted Domain Object)

Cada confianza se almacena como un objeto TDO en AD. El PDC del dominio trusting renueva la password del TDO cada 30 días.

```
ldapsearch (objectClass=trustedDomain)
```

Atributos importantes:

```
┌────────────────┬──────────────────────────────────────────────┐
│ trustDirection │ 0 = disabled                                 │
│                │ 1 = inbound                                  │
│                │ 2 = outbound                                 │
│                │ 3 = bidireccional                            │
├────────────────┼──────────────────────────────────────────────┤
│ trustAttributes│ 1  = no transitiva                           │
│                │ 4  = SID filtering activo                    │
│                │ 8  = transitiva entre bosques                │
│                │ 32 = entre dominios del mismo bosque         │
│                │ 64 = entre bosques distintos + SID filtering │
└────────────────┴──────────────────────────────────────────────┘
```

---

#### 🔒 Límites de seguridad

```
┌─────────────────────────────────────────────────────┐
│  El límite de seguridad existe a nivel de BOSQUE    │
│  NO a nivel de dominio                              │
│                                                     │
│  → Un Domain Admin de un hijo PUEDE acceder         │
│    a datos de otros dominios del mismo bosque       │
│                                                     │
│  → Por eso el ataque child→forest root es posible   │
└─────────────────────────────────────────────────────┘
```
