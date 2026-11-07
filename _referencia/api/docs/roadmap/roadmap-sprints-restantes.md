# Roadmap — Sprints restantes

---

## 1. Título

**Roadmap — Sprints restantes del proyecto alojamientos**

---

## 2. Objetivo del documento

Este documento organiza y describe los sprints pendientes por desarrollar en el proyecto **alojamientos**. No implementa nada ni define ningún sprint en detalle; solo ofrece una visión clara de lo que sigue, en qué orden se recomienda y por qué cada tema tiene sentido dentro del roadmap general del proyecto.

Sirve como guía para decidir qué sprint abordar después y entender cómo cada tema aporta al crecimiento del proyecto como producto y como plataforma profesional.

---

## 3. Estado actual del proyecto

A fecha de este documento, el proyecto tiene:

* **Sprints 1-5:** Sprint docs, implementación real y tutoriales completados.
* **Sprints 6-10:** Sprint docs definidos (implementación y tutoriales pendientes de ejecutar).

El proyecto funcional actual cubre: base técnica, usuarios, autenticación, autorización, alojamientos con CRUD, comodidades N:M, imágenes, búsqueda/disponibilidad, favoritos y reseñas.

Este documento no implementa nada. Solo organiza lo que queda por hacer.

---

## 4. Sprints ya definidos (resumen de avance)

| Sprint | Tema | Estado doc | Estado implementación | Estado tutorial |
|---|---|---|---|---|
| Sprint 1 | Setup, Git/GitHub y base técnica | ✅ | ✅ | ✅ |
| Sprint 2 | Usuarios y autenticación | ✅ | ✅ | ✅ |
| Sprint 3 | Roles y autorización | ✅ | ✅ | ✅ |
| Sprint 4 | Alojamientos | ✅ | ✅ | ✅ |
| Sprint 5 | Comodidades N:M | ✅ | ✅ | ✅ |
| Sprint 6 | Imágenes de alojamientos | ✅ | Pendiente | Pendiente |
| Sprint 7 | Reservas | ✅ | Pendiente | Pendiente |
| Sprint 8 | Búsqueda y disponibilidad | ✅ | Pendiente | Pendiente |
| Sprint 9 | Favoritos | ✅ | Pendiente | Pendiente |
| Sprint 10 | Reseñas | ✅ | Pendiente | Pendiente |

---

## 5. Sprints o temas pendientes

Los temas que quedan por definir e implementar son:

* Sprint 11 — Refresh tokens
* Sprint 12 — Revocación o blacklist de tokens
* Sprint 13 — Documentación de API con Swagger/Flasgger
* Sprint 14 — Soft delete
* Sprint 15 — Auditoría
* Sprint 16 — Rate limiting
* Sprint 17 — Docker
* Sprint 18 — CI/CD
* Sprint 19 — Despliegue
* Sprint 20 — Observabilidad y monitoreo

---

## 6. Descripción breve de cada sprint pendiente

### Sprint 11 — Refresh tokens

**Qué problema resuelve:** Actualmente los access tokens expiran y el usuario debe volver a iniciar sesión. Esto es incómodo y poco profesional.

**Qué enseñaría:** Cómo funciona el flujo de refresh tokens, generación de tokens de larga duración, rotación de refresh tokens, y renovación silenciosa de sesión.

**Por qué tiene sentido:** Es el siguiente paso natural en seguridad. Cierra la brecha entre una API funcional y una API con experiencia de sesión profesional.

---

### Sprint 12 — Revocación o blacklist de tokens

**Qué problema resuelve:** Sin revocación, un token sigue siendo válido hasta su expiración aunque el usuario haya cerrado sesión. Esto es un riesgo de seguridad.

**Qué enseñaría:** Cómo implementar una blacklist de tokens (en BD o caché), revocación en logout, invalidación forzada de sesiones, y gestión de compromisos de seguridad.

**Por qué tiene sentido:** Complementa el Sprint 11. Una sesión profesional debe poder cerrarse de verdad, no solo esperar a que el token expire.

---

### Sprint 13 — Documentación de API con Swagger/Flasgger

**Qué problema resuelve:** Sin documentación interactiva, los consumidores de la API (frontend, terceros) dependen de leer código o adivinar endpoints.

**Qué enseñaría:** Cómo integrar Flasgger/Swagger, documentar endpoints con decoradores, generar especificación OpenAPI, y exponer documentación interactiva.

**Por qué tiene sentido:** Una API bien documentada es una API profesional. Es un tema transversal que mejora todos los endpoints existentes.

---

### Sprint 14 — Soft delete

**Qué problema resuelve:** Al eliminar registros permanentemente, se pierde historial, se rompen integridades referenciales y no se puede auditar qué se eliminó.

**Qué enseñaría:** Cómo implementar eliminación lógica con campo `eliminado` o `fecha_eliminacion`, cómo filtrar registros eliminados, y cómo gestionar restauración si fuera necesario.

**Por qué tiene sentido:** Es una práctica estándar en sistemas reales. Afecta a múltiples dominios (usuarios, alojamientos, reseñas) y mejora la robustez del sistema.

---

### Sprint 15 — Auditoría

**Qué problema resuelve:** Sin registro de acciones, no se puede saber quién hizo qué, cuándo ni desde dónde. Esto es crítico para debugging, seguridad y cumplimiento.

**Qué enseñaría:** Cómo crear un sistema de logs de auditoría, qué acciones registrar, cómo almacenar quién hizo qué y cuándo, y cómo exponer estos datos de forma segura.

**Por qué tiene sentido:** Es un pilar de gobierno del dato. Va de la mano con soft delete y es esencial para cualquier sistema en producción.

---

### Sprint 16 — Rate limiting

**Qué problema resuelve:** Sin límites de peticiones, la API es vulnerable a abuso, scraping, fuerza bruta y ataques de denegación de servicio.

**Qué enseñaría:** Cómo implementar rate limiting por IP o por usuario, configurar límites por endpoint, responder con 429 Too Many Requests, y usar almacenamiento eficiente para contadores.

**Por qué tiene sentido:** Es protección operativa básica. Protege la infraestructura y mejora la estabilidad del sistema bajo carga.

---

### Sprint 17 — Docker

**Qué problema resuelve:** Sin contenedores, el proyecto depende de la configuración exacta de cada máquina de desarrollo y es difícil de replicar en otros entornos.

**Qué enseñaría:** Cómo crear Dockerfile para la API, docker-compose para orquestar API + base de datos, volúmenes para persistencia, y redes para comunicación entre servicios.

**Por qué tiene sentido:** Docker es un estándar de la industria. Hace que el proyecto sea portable, reproducible y listo para cualquier entorno.

---

### Sprint 18 — CI/CD

**Qué problema resuelve:** Sin integración y despliegue continuos, cada cambio requiere ejecución manual de tests y despliegue manual, lo que es lento y propenso a errores.

**Qué enseñaría:** Cómo configurar GitHub Actions para ejecutar tests automáticamente en cada push, validar builds, y preparar artefactos para despliegue.

**Por qué tiene sentido:** Automatiza la calidad del código. Es el puente entre desarrollo local y producción.

---

### Sprint 19 — Despliegue

**Qué problema resuelve:** Sin despliegue, el proyecto vive solo en local y no puede ser usado ni demostrado públicamente.

**Qué enseñaría:** Cómo desplegar la API en un servicio cloud (Render, Railway, VPS), configurar variables de entorno de producción, conectar base de datos remota, y gestionar dominios/SSL.

**Por qué tiene sentido:** Es el paso final para que el proyecto sea un producto real accesible desde internet.

---

### Sprint 20 — Observabilidad y monitoreo

**Qué problema resuelve:** Sin monitoreo, no se sabe si la API funciona correctamente en producción hasta que los usuarios se quejan.

**Qué enseñaría:** Cómo añadir logging estructurado, métricas de rendimiento, health checks avanzados, alertas básicas, y dashboards de monitoreo.

**Por qué tiene sentido:** Cierra el ciclo de vida del proyecto. Una API en producción necesita visibilidad para mantenerse saludable.

---

## 7. Orden recomendado

El orden propuesto para continuar el proyecto es:

| # | Sprint | Tema |
|---|---|---|
| 11 | Refresh tokens | Sesiones de larga duración |
| 12 | Revocación o blacklist | Cierre real de sesiones |
| 13 | Documentación Swagger | API documentada e interactiva |
| 14 | Soft delete | Eliminación segura y reversible |
| 15 | Auditoría | Registro de acciones del sistema |
| 16 | Rate limiting | Protección contra abuso |
| 17 | Docker | Contenedores para portabilidad |
| 18 | CI/CD | Automatización de calidad |
| 19 | Despliegue | API accesible en producción |
| 20 | Observabilidad | Monitoreo y alertas |

**¿Por qué este orden?**

1. **Seguridad primero (11-12):** Refresh tokens y revocación cierran el ciclo de autenticación. Son dependencias entre sí (refresh tokens sin revocación es incompleto).
2. **Experiencia de API (13):** Swagger documenta todo lo construido hasta ahora. Es transversal y mejora la usabilidad del proyecto completo.
3. **Gobierno del dato (14-15):** Soft delete y auditoría mejoran la robustez del sistema. Son transversales a todos los dominios existentes.
4. **Protección operativa (16):** Rate limiting protege la infraestructura antes de llevar el proyecto a producción.
5. **Plataforma/DevOps (17-20):** Docker, CI/CD, despliegue y observabilidad son el camino hacia producción. Cada uno depende del anterior.

---

## 8. Agrupación por bloques temáticos

### Bloque A — Seguridad

| Sprint | Tema |
|---|---|
| 11 | Refresh tokens |
| 12 | Revocación o blacklist de tokens |

Mejoran la gestión de sesiones y la seguridad de la autenticación. Son prerequisito para una API profesional.

---

### Bloque B — Experiencia de API

| Sprint | Tema |
|---|---|
| 13 | Documentación con Swagger/Flasgger |

Hace la API auto-explicativa y fácil de consumir por frontend o terceros. Es transversal: beneficia a todos los endpoints existentes.

---

### Bloque C — Gobierno del dato

| Sprint | Tema |
|---|---|
| 14 | Soft delete |
| 15 | Auditoría |

Protegen la integridad de los datos y permiten rastrear qué pasó en el sistema. Son esenciales para cualquier aplicación real.

---

### Bloque D — Protección operativa

| Sprint | Tema |
|---|---|
| 16 | Rate limiting |

Protege la API contra abuso y mejora la estabilidad bajo carga. Es una capa de defensa antes de ir a producción.

---

### Bloque E — Plataforma / DevOps

| Sprint | Tema |
|---|---|
| 17 | Docker |
| 18 | CI/CD |
| 19 | Despliegue |
| 20 | Observabilidad y monitoreo |

Llevan el proyecto de "código en local" a "producto en producción". Cada sprint depende del anterior y juntos forman el camino hacia producción.

---

## 9. Recomendaciones finales

**Cuándo hacer cada bloque:**

* **Bloques A y B (Sprints 11-13):** Hacerlos pronto. Son mejoras transversales que benefician a todo lo ya construido. No requieren infraestructura nueva.
* **Bloque C (Sprints 14-15):** Hacer antes de ir a producción. Mejoran la robustez del sistema y son prerequisito para cualquier despliegue serio.
* **Bloque D (Sprint 16):** Hacer antes o durante el despliegue. Protege la API cuando empieza a recibir tráfico real.
* **Bloque E (Sprints 17-20):** Hacer en orden secuencial. Docker → CI/CD → Despliegue → Observabilidad. Cada uno construye sobre el anterior.

**Qué es producto vs plataforma:**

* **Producto:** Sprints 11-16. Mejoran la API como producto: seguridad, documentación, datos, protección.
* **Plataforma:** Sprints 17-20. Mejoran la infraestructura: contenedores, automatización, despliegue, monitoreo.

**Recomendación pedagógica:**

1. Completar primero los sprints de **producto** (11-16) para tener una API madura y profesional.
2. Luego abordar los sprints de **plataforma** (17-20) para llevar esa API a producción de forma automatizada y observable.

---

## 10. Estado

**Documento activo** — Este roadmap sirve como guía para decidir qué sprint abordar después. Los sprints individuales (11-20) se irán definiendo en detalle cuando llegue el momento de implementarlos.
