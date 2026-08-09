# MatriculaTEL — Catálogo de Vistas

Documento de referencia de la interfaz de usuario. Para cada vista se listan los datos que muestra, los controles disponibles y la acción que ejecuta cada uno.

**Fecha:** 8 de agosto de 2026
**Alcance:** frontend (`AITEL-front-malla_telecom`), todas las rutas registradas en el enrutador.

---

## Índice

| # | Vista | Ruta | Rol |
|---|-------|------|-----|
| 0 | Marco de la aplicación (Header + Sidebar) | *(envuelve todas las rutas privadas)* | Ambos |
| 1 | Autenticación | `/auth` | Público |
| 2 | Malla Curricular | `/curriculum` | Estudiante |
| 2b | Panel de Detalle de Curso | *(panel lateral)* | Estudiante |
| 3 | Catálogo de Cursos | `/catalog` | Estudiante |
| 4 | Historial Académico | `/history` | Estudiante |
| 5 | Registro de Cursos | `/onboarding` | Estudiante |
| 6 | Panel de Administración | `/admin` | Admin |
| 7 | Gestión de Profesores | `/admin/professors` | Admin |
| 8 | Gestión de Semestres | `/admin/semesters` | Admin |
| 9 | Sistema de Administración de Cursos | `/admin/system` | Admin |
| 9a | └ Categorías | `/admin/system/categories` | Admin |
| 9b | └ Subcategorías | `/admin/system/subcategories` | Admin |
| 9c | └ Cursos | `/admin/system/courses` | Admin |
| 9d | └ Horarios | `.../courses/:courseId/schedules` | Admin |
| 9e | └ Buscador | `/admin/system/search` | Admin |

**Redirección de entrada (`/`):** al iniciar sesión el sistema decide automáticamente el destino — administradores van a `/admin`; estudiantes que aún no registran su historial van a `/onboarding`; el resto va a `/curriculum`.

---

## 0. Marco de la aplicación (Header + Sidebar)

Envuelve todas las vistas privadas. Siempre visible.

### Barra superior (Header)

| Elemento | Tipo | Contenido / Acción |
|---|---|---|
| ☰ | Botón | Abre/cierra el menú lateral |
| MatriculaTEL | Texto | Marca de la aplicación |
| Selector de tema | 3 botones | Cambia entre los temas **Señal** (azul-celeste/blanco), **Bitácora** (grafito oscuro/ámbar) y **Cuaderno** (papel/tinta azul). La elección se recuerda entre sesiones |
| «Hola, {nombre}» | Texto | Nombre completo o correo del usuario |
| Cerrar sesión | Botón | Cierra la sesión y regresa a `/auth` |

### Menú lateral (Sidebar)

Se despliega sobre el contenido con un fondo oscurecido; se cierra al hacer clic fuera o al elegir una opción. Muestra el nombre de la app y el rol («Estudiante» / «Administrador»).

**Opciones para estudiante:**

| Opción | Destino |
|---|---|
| 🗺️ Malla Curricular | `/curriculum` |
| 📚 Catálogo de Cursos | `/catalog` |
| 📅 Historial Académico | `/history` |
| ⚙️ Configurar Cursos | `/onboarding` |

**Opciones para administrador:**

| Opción | Destino |
|---|---|
| 👨‍💼 Panel Admin | `/admin` |
| 🎓 Sistema de Cursos | `/admin/system` |
| 👨‍🏫 Gestionar Profesores | `/admin/professors` |

> **Nota:** *Gestión de Semestres* (`/admin/semesters`) no aparece en el menú lateral; solo se llega desde el botón «Gestionar Semestres» del Panel de Administración.

---

## 1. Autenticación — `/auth`

Pantalla pública única, con dos modos alternables en la misma tarjeta.

### Datos que muestra
- Marca «MatriculaTEL» y subtítulo «Ingeniería de las Telecomunicaciones»
- Mensajes de error de validación por campo y un mensaje general de error si falla el envío
- Selector de tema (esquina superior derecha)

### Campos del formulario

| Campo | Modo | Validación |
|---|---|---|
| Nombres | Solo registro | Obligatorio |
| Apellidos | Solo registro | Obligatorio |
| Código de estudiante | Solo registro | Obligatorio, exactamente 8 dígitos |
| Correo electrónico | Ambos | Obligatorio, formato de correo válido |
| Contraseña | Ambos | Obligatoria, mínimo 6 caracteres |
| Confirmar contraseña | Solo registro | Obligatoria, debe coincidir |
| Acepto términos y condiciones | Solo registro | Debe estar marcado |

### Botones y acciones

| Botón | Acción |
|---|---|
| Iniciar sesión / Registrarse (pestañas) | Alterna el modo del formulario y limpia todos los campos |
| Mostrar / Ocultar (en contraseña) | Alterna la visibilidad del texto de la contraseña |
| Mostrar / Ocultar (en confirmar contraseña) | Ídem, para el campo de confirmación |
| **Iniciar sesión** / **Crear cuenta** | Valida el formulario y envía las credenciales. Si tiene éxito, entra a la aplicación; si no, muestra el error devuelto. Mientras procesa muestra «Procesando…» y se deshabilita |
| Continuar con Google | ⚠️ **Sin implementar** — simula una espera y muestra un aviso |
| ¿Olvidaste tu contraseña? | ⚠️ **Sin implementar** — muestra un aviso |

---

## 2. Malla Curricular — `/curriculum`

Vista principal del estudiante. Grafo interactivo de la carrera completa.

### Datos que muestra

**Encabezado:**
- Título «Malla Curricular» y subtítulo de la carrera
- **Semestre actual** (el que el administrador marcó como vigente)
- **Progreso**: cursos aprobados / total, con porcentaje

**Leyenda (dos bloques):**

*Estado de los nodos:*
- Aprobado → color pleno de su subcategoría (con conteo)
- Pendiente → mismo color atenuado (con conteo)
- En curso → color atenuado con anillo ámbar (con conteo)
- Resumen de electivos → borde punteado
- Aclaración: *«El color de cada nodo es el de su subcategoría/track, no su estado»*

*Tipos de flecha (prerrequisitos):*
- Línea verde → requiere el curso **aprobado** (nota ≥ 11)
- Línea ámbar → requiere una **nota mínima** específica
- Línea azul punteada y animada → **correquisito** (se puede llevar en paralelo)

**Grafo:**

| Tipo de nodo | Qué muestra |
|---|---|
| Curso obligatorio | Nombre del curso, créditos, ciclo |
| Resumen de subcategoría electiva | Si ya llevó cursos de ese grupo: el nombre del/los curso(s) llevado(s). Si no: el nombre de la subcategoría. Muestra el ciclo, sin créditos |

- Los nodos se distribuyen en columnas por ciclo (izquierda → derecha).
- Cada subcategoría electiva se colapsa en **un solo nodo**, sin importar cuántos cursos contenga.
- Las flechas solo conectan cursos obligatorios.
- **Regla de excepción:** si un curso se registró con excepción de matrícula, la flecha de ese prerrequisito queda oculta hasta que el estudiante apruebe el curso requisito de todas formas.

### Botones y acciones

| Control | Acción |
|---|---|
| Clic sobre un nodo de curso | Abre el **Panel de Detalle de Curso** (§2b) |
| Clic sobre un nodo de resumen de electivos | Sin acción (es informativo) |
| Zoom + / Zoom − | Acerca / aleja la vista del grafo |
| Ajustar vista | Encuadra todo el grafo en pantalla |
| Arrastrar el fondo | Desplaza la vista |
| Minimapa (esquina) | Vista general del grafo; permite desplazarse y hacer zoom. Cada nodo aparece con el color de su subcategoría |
| Reintentar | Aparece solo si falla la carga; vuelve a pedir los datos |

---

## 2b. Panel de Detalle de Curso *(panel lateral deslizante)*

Se abre desde la Malla Curricular y desde el Catálogo de Cursos.

### Datos que muestra

**Cabecera:** nombre del curso, ciclo y créditos.

**Selector de ciclo y horario:** desplegable de ciclo académico y, si hay más de uno, desplegable de horario.

**Estado del curso:** insignia de estado (✓ Aprobado / ○ Disponible / ◐ En progreso / 🔒 Requiere prerrequisitos). Si ya lo llevó, muestra su nota sobre 20.

**Prerrequisitos** *(sub-panel):*
- Contador «X/Y cumplidos»
- Resumen general: «¡Listo para llevar!» o «Prerrequisitos pendientes»
- Por cada prerrequisito: nombre del curso, tipo de requisito (aprobado / nota mínima N / correquisito), estado (✓/✗), texto explicativo, recomendación de qué hacer y la nota actual del estudiante en ese curso
- Si falta alguno, muestra consejos generales
- Si no tiene ninguno: «¡Sin prerrequisitos!»

**Información del horario:** profesor(es), aula, horario.

**Descripción del curso:** texto descriptivo. ⚠️ **Actualmente es un texto genérico generado a partir del nombre del curso, no la descripción real de la base de datos.**

**Calificación del curso:** promedio en estrellas (sobre 5), cantidad de valoraciones y la calificación propia si ya votó.

**Foro de Estudiantes:** lista de comentarios con autor, fecha, contenido, contador de 👍 y 👎, y respuestas anidadas (cada respuesta cita el comentario al que responde).

### Botones y acciones

| Control | Acción | Requiere aprobar el curso |
|---|---|---|
| ✕ (cerrar) | Cierra el panel | No |
| Desplegable de ciclo | Filtra comentarios y horarios de ese ciclo | No |
| Desplegable de horario | Filtra comentarios de ese horario | No |
| ⭐ Estrellas (1-5) | Registra la calificación del estudiante | **Sí** |
| Desplegable de orden | Ordena comentarios por «Más recientes» o «Mejor valorados» | No |
| 👍 / 👎 | Marca o desmarca voto en un comentario o respuesta | **Sí** |
| 💬 Responder | Abre el cuadro de respuesta bajo ese comentario | **Sí** |
| ▶/▼ N respuestas | Expande o contrae el hilo de respuestas | No |
| 🚩 Reportar | Pide un motivo y envía el reporte | No |
| Cancelar (en respuesta) | Descarta la respuesta en curso | — |
| Responder (enviar) | Publica la respuesta | **Sí** |
| Publicar Comentario | Publica un comentario nuevo | **Sí** |

> Si el estudiante **no ha aprobado** el curso, el panel queda en **solo lectura**: se muestra el aviso «Solo lectura — Aprueba el curso para interactuar» y todos los controles de participación quedan deshabilitados.

---

## 3. Catálogo de Cursos — `/catalog`

Exploración libre de todos los cursos de la carrera.

### Datos que muestra
- Título y subtítulo
- Contador «Mostrando X de Y cursos»
- **Tarjeta por curso:** código, nombre, ciclo, créditos, categoría → subcategoría, y una insignia de estado si aplica (✅ Aprobado / ❌ Desaprobado)
- Estado vacío cuando ningún curso coincide con los filtros

### Controles de filtrado

| Control | Acción |
|---|---|
| Barra de búsqueda | Filtra en vivo por nombre, código o descripción |
| Categoría | Filtra por categoría; al cambiarla reinicia la subcategoría |
| Subcategoría | Filtra por subcategoría (deshabilitado hasta elegir una categoría) |
| Ciclo | Filtra por ciclo académico |
| Ordenar por | Ordena por Nombre, Código, Créditos o Ciclo |

### Botones y acciones

| Control | Acción |
|---|---|
| Clic sobre una tarjeta de curso | Abre el **Panel de Detalle de Curso** (§2b) |

---

## 4. Historial Académico — `/history`

Línea de tiempo horizontal de la trayectoria del estudiante.

### Datos que muestra

**Por cada semestre (tarjeta en la línea de tiempo, en orden cronológico):**
- Nombre del semestre (ej. «2024-1») y su número de orden
- Tipo: «Ciclo Regular» o «Ciclo de Verano»
- Si fue suspendido: bloque «⏸️ Semestre Suspendido — No se llevaron cursos»
- Si no: resumen con cantidad de **Aprobados**, **Desaprobados**, **En curso** y **Créditos aprobados / totales**
- Lista de cursos del semestre: código, nombre, créditos, nota, e indicadores «⚠️ EXCEPCIÓN» y «📚 ELECTIVO» cuando corresponda

### Botones y acciones

| Control | Acción |
|---|---|
| Clic sobre un curso | Abre un cuadro de detalle con: código, nombre, créditos, nota final sobre 20 y veredicto (Aprobado/Desaprobado) o «Curso en progreso», subcategoría y aviso de excepción de matrícula si aplica |
| ✕ / clic fuera | Cierra el cuadro de detalle |

---

## 5. Registro de Cursos — `/onboarding`

Asistente por pasos para que el estudiante cargue su historial académico completo. Tiene tres etapas.

### Etapa 1 — Inicio

**Datos que muestra:**
- Título y explicación de qué se va a registrar (cursos por semestre, notas, excepciones, semestres suspendidos)
- Si ya hay semestres registrados: aviso con la cantidad y opciones para continuar o reiniciar

**Controles:**

| Control | Acción |
|---|---|
| ▶️ Continuar donde me quedé | Retoma el registro en el primer semestre que falte |
| 🗑️ Reiniciar registro desde cero | **Pide confirmación.** Borra todos los semestres y cursos ya registrados |
| Desplegable «¿Cuál fue tu primer semestre?» | Elige el semestre de inicio (2018 a 2025, incluye veranos) |
| 🚀 Comenzar Registro | Arranca el asistente desde el semestre elegido (deshabilitado hasta elegir uno) |

### Etapa 2 — Registro semestre por semestre

**Datos que muestra:**
- Semestre en curso, con distintivo «⚡ ACTUAL» si es el semestre vigente
- Tipo de ciclo (Regular / Verano)
- Progreso «Semestre N de M» con barra visual
- Tres secciones de cursos disponibles:
  - 📌 **Cursos Pendientes de Ciclos Anteriores** (muestra el ciclo de cada curso)
  - **Cursos del Ciclo N**
  - **Otros Cursos (requieren excepción)** — contraída por defecto
- Dentro de cada sección: cursos obligatorios sueltos, grupos obligatorios (que exigen todos sus cursos) y subcategorías electivas (que exigen elegir N). Cada grupo muestra su progreso: cuántos lleva aprobados de los requeridos
- Tabla de **Cursos Seleccionados** con columnas: Curso, Créditos, Nota (0-20), Excepción
- Lista de errores de prerrequisitos si la validación falla, con la sugerencia de marcar «Excepción»

**Controles:**

| Control | Acción |
|---|---|
| ⏸️ Suspendí este semestre | Marca el semestre como suspendido y vacía la selección de cursos |
| Cabecera de una sección contraíble | Expande o contrae la sección |
| Cabecera de un grupo/subcategoría | Expande o contrae la lista de cursos de ese grupo |
| **+** en una tarjeta de curso | Agrega el curso a la selección |
| **✕** en una tarjeta de curso | Quita el curso de la selección |
| Campo de nota | Registra la nota obtenida (0-20). Los cursos del semestre actual muestran «En curso» en vez del campo |
| Casilla «Excepción» | Marca que el curso se llevó sin cumplir prerrequisitos (omite la validación) |
| 🗑️ (por fila) | Quita ese curso de la selección |
| ← Anterior | Vuelve al semestre previo, o a la Etapa 1 si es el primero |
| 🗑️ Limpiar | Vacía toda la selección del semestre actual |
| ✅ Confirmar Semestre / ⏸️ Registrar Suspensión | Valida prerrequisitos y guarda el semestre; avanza al siguiente. Deshabilitado si no hay cursos ni suspensión marcada |

### Etapa 3 — Registro completado

**Datos que muestra:** mensaje de éxito, total de semestres registrados y total de cursos registrados.

| Control | Acción |
|---|---|
| 🗺️ Ver Mi Malla Curricular | Lleva a `/curriculum` |

---

## 6. Panel de Administración — `/admin`

Pantalla de inicio del administrador.

### Datos que muestra

**Estadísticas Generales:** total de cursos, total de profesores, estudiantes activos, número de categorías.

**Actividad Reciente:** últimos 5 registros, cada uno con descripción, fecha/hora, usuario responsable y tipo de acción. Muestra «No hay actividad reciente registrada» si está vacío.

### Botones y acciones

| Botón | Acción |
|---|---|
| 🔄 Actualizar | Recarga estadísticas y actividad reciente |
| ➕ Agregar Nuevo Curso | Va a `/admin/system` |
| ➕ Registrar Profesor | Va a `/admin/professors` |
| 📅 Gestionar Semestres | Va a `/admin/semesters` |
| 📊 Generar Reporte | ⚠️ **Sin implementar** — deshabilitado, rotulado «(próximamente)» |

---

## 7. Gestión de Profesores — `/admin/professors`

### Datos que muestra
Tabla con una fila por profesor: **Nombre**, **Email**, **Código** y columna de acciones.

### Botones y acciones

| Botón | Acción |
|---|---|
| + Agregar Profesor | Abre el formulario en modo creación |
| Ver | ⚠️ **Sin implementar** — no ejecuta ninguna acción |
| Editar | Abre el formulario precargado con los datos del profesor |
| Eliminar | **Pide confirmación** y elimina al profesor |

### Formulario de profesor (ventana emergente)

| Campo | Validación |
|---|---|
| Nombres | Obligatorio |
| Apellidos | Obligatorio |
| Correo Institucional | Obligatorio, formato de correo válido |
| Código | Obligatorio |

| Botón | Acción |
|---|---|
| ✕ / Cancelar | Cierra sin guardar |
| Crear / Actualizar | Valida y guarda. Muestra «Guardando…» mientras procesa |

---

## 8. Gestión de Semestres — `/admin/semesters`

Define cuál es el semestre académico vigente para toda la aplicación.

### Datos que muestra
- Explicación: define el ciclo vigente para toda la matrícula
- Tarjeta destacada con el **semestre actual** vigente
- Lista de todos los semestres registrados, del más reciente al más antiguo, con distintivo «⚡ Actual» en el vigente

### Botones y acciones

| Botón | Acción |
|---|---|
| + Nuevo Semestre | Abre el formulario de creación |
| Campo de semestre | Acepta el formato `AAAA-C` (C = 1 primer ciclo, 2 segundo ciclo, 0 verano). Valida el formato antes de enviar |
| Crear | Registra el semestre nuevo |
| Cancelar | Cierra el formulario |
| **Marcar como actual** | **Pide confirmación** advirtiendo que afecta a todos los estudiantes. Fija ese semestre como vigente |
| ✕ (en el error) | Descarta el mensaje de error |

---

## 9. Sistema de Administración de Cursos — `/admin/system`

Asistente jerárquico: **Categorías → Subcategorías → Cursos → Horarios**, más un Buscador transversal. Cada nivel se desbloquea al seleccionar un elemento del nivel anterior.

### Elementos comunes a todos los niveles

| Elemento | Descripción |
|---|---|
| Barra de navegación por pasos | Muestra los 5 niveles. El nivel activo se resalta; los completados llevan ✅; los bloqueados aparecen atenuados y no se pueden pulsar |
| 🏠 Inicio | Reinicia el flujo y vuelve a Categorías |
| Ruta de navegación (breadcrumb) | Muestra la categoría → subcategoría → curso seleccionados actualmente |
| ← Volver | Sube un nivel en la jerarquía |

### Patrón de interacción compartido

En los tres niveles (categorías, subcategorías, cursos) las tarjetas funcionan igual:
- **Primer clic** → abre el panel de detalles a la derecha
- **Segundo clic** (sobre la misma tarjeta) → entra al siguiente nivel

Los estados **congelado** ❄️ y **oculto** 🙈 se propagan en cascada hacia abajo: congelar una categoría bloquea todas sus subcategorías, cursos y horarios.

### Modales de confirmación (congelar / descongelar / eliminar)

Todos usan el mismo patrón de seguridad: muestran el mensaje, una advertencia sobre las consecuencias, y un **contador regresivo de 10 segundos** durante el cual el botón de confirmar permanece deshabilitado. Al llegar a cero aparece «✅ Ya puedes confirmar la acción».

---

### 9a. Categorías

**Datos por tarjeta:** nombre, descripción, color identificativo, indicador de estado (✅ activa / ❄️ congelada / 👁️‍🗨️ oculta), número de subcategorías, número de cursos, y modo de asociación (🔗 Por ciclo / 🌐 Transversal).

**Panel de detalles:** nombre, descripción, estado, modo de asociación, contadores de subcategorías y cursos, y la lista de subcategorías con su cantidad de cursos.

| Control | Acción |
|---|---|
| Buscar categorías | Filtra por nombre o descripción |
| + Nueva Categoría | Abre el formulario de creación |
| ✏️ Editar | Abre el formulario precargado |
| ❄️ Congelar | **Confirmación con contador.** Bloquea la categoría y todo lo que contiene |
| 🔥 Descongelar | **Confirmación con contador.** Desbloquea en cascada |
| 🙈 Ocultar / 👁️ Mostrar | Alterna la visibilidad para estudiantes |
| 🗑️ Eliminar | **Confirmación con contador.** Solo disponible si la categoría no tiene subcategorías ni cursos |
| Ver Subcategorías | Entra al nivel de subcategorías |

**Formulario de categoría:** nombre, casilla «Asociación por ciclo», descripción, selector de color (8 opciones), casilla «Ocultar categoría».

---

### 9b. Subcategorías

**Datos por tarjeta:** nombre, descripción, color, estado, número de cursos, requisito de aprobación («Todos requeridos» o «N requeridos») y ciclo asociado (si la categoría usa asociación por ciclo).

**Panel de detalles:** además de lo anterior, la lista de cursos con código, nombre, créditos y estado activo/inactivo.

| Control | Acción |
|---|---|
| Buscar subcategorías | Filtra por nombre o descripción |
| + Nueva Subcategoría | Abre el formulario de creación |
| ✏️ Editar / ❄️ Congelar / 🔥 Descongelar / 🙈 Ocultar / 🗑️ Eliminar | Mismo comportamiento que en Categorías. Eliminar solo está disponible si no tiene cursos |
| Ver Cursos | Entra al nivel de cursos |

**Formulario de subcategoría:** nombre, ciclo asociado, número de cursos requeridos, casilla **«Requiere todos los cursos»** (al marcarla se deshabilita el número y la subcategoría pasa a ser obligatoria en vez de electiva), descripción, casilla «Ocultar subcategoría».

> Esta casilla **«Requiere todos los cursos»** es la que determina si el grupo aparece en la Malla Curricular como cursos individuales (obligatorios) o colapsado en un solo nodo resumen (electivos).

---

### 9c. Cursos

**Datos por tarjeta:** código, créditos, total de horas semanales, nombre, descripción, estado, número de horarios programados, y el bloque de requisitos (prerrequisitos, prerrequisitos con nota mínima y correquisitos, cada uno listando los códigos de curso).

**Panel de detalles:** todo lo anterior más el desglose de horas (Teoría / Práctica / Laboratorio) y la lista de horarios programados con ciclo, nombre, aula, profesores, días y cantidad de estudiantes inscritos.

| Control | Acción |
|---|---|
| Buscar cursos | Filtra por nombre, código o descripción |
| Filtro de visibilidad | Muestra todos / solo visibles / solo ocultos |
| + Nuevo Curso | Abre el formulario de creación |
| 📅 Horarios (N) | Abre el panel de horarios del curso (solo lectura) |
| ✏️ Editar / ❄️ Congelar / 🔥 Descongelar / 🙈 Ocultar / 🗑️ Eliminar | Mismo comportamiento que en los niveles anteriores. Eliminar solo está disponible si el curso no tiene horarios programados |
| Gestionar Horarios | Entra al nivel de horarios (edición completa) |

**Formulario de curso:**

| Campo | Detalle |
|---|---|
| Código * | Se convierte a mayúsculas automáticamente |
| Créditos | Numérico, 1 a 10, en pasos de 0.5 |
| Ciclo correspondiente | Numérico, 1 a 12 |
| Nombre * | Obligatorio |
| Descripción | Texto libre |
| Horas semanales | Tres campos: Teoría, Práctica, Laboratorio |
| Prerrequisitos | Selector de curso + «Agregar»; los agregados aparecen como etiquetas removibles |
| Prerrequisitos con nota mínima | Selector de curso + campo de nota (10-20) + «Agregar» |
| Correquisitos | Selector de curso + «Agregar» |

---

### 9d. Horarios — `.../courses/:courseId/schedules`

Gestión completa de horarios agrupados por ciclo académico.

**Datos que muestra:** nombre del curso; por cada ciclo, la cantidad de horarios programados; por cada horario: nombre, días con hora de inicio y fin, profesores asignados, aula, y una mini-grilla semanal (L-M-X-J-V-S-D) que resalta los días con clase.

| Control | Acción |
|---|---|
| + Agregar Ciclo | Abre el formulario para registrar un ciclo (formato `AAAA-C`) |
| 📅 Nuevo Horario | Abre el formulario de horario (deshabilitado si no hay ciclos) |
| Cabecera de un ciclo | Expande o contrae sus horarios |
| + Horario (por ciclo) | Crea un horario dentro de ese ciclo |
| 🗑️ (por ciclo) | **Pide confirmación** y elimina el ciclo completo |
| ✏️ (por horario) | Abre el formulario precargado |
| 🗑️ (por horario) | **Pide confirmación** y elimina ese horario |
| Cerrar | Sale de la gestión de horarios |

**Formulario de horario:** ciclo académico (bloqueado al editar), nombre del horario, aula, lista de días (cada uno con día de la semana, hora de inicio y hora de fin, agregables y removibles) y lista de profesores asignados (selector + etiquetas removibles).

---

### 9e. Buscador — `/admin/system/search`

Búsqueda transversal sobre categorías, subcategorías, cursos y profesores.

**Datos que muestra:**
- Contador de resultados y desglose por tipo
- Resultados agrupados por tipo, en secciones contraíbles
- Cada resultado muestra código (si aplica), nombre con el término buscado **resaltado**, ruta categoría → subcategoría, descripción, y estadísticas propias de su tipo:
  - *Categoría:* número de subcategorías y de cursos
  - *Subcategoría:* cursos requeridos, número de cursos, ciclo
  - *Curso:* créditos, horas semanales, estado activo/inactivo, ciclo
  - *Profesor:* número de cursos y de ciclos activos

| Control | Acción |
|---|---|
| Barra de búsqueda | Busca por nombre, código o descripción (se ejecuta sola tras una breve pausa al escribir) |
| 🎛️ Filtros | Abre/cierra el panel de filtros avanzados. Muestra un contador de filtros activos |
| Filtros por Tipo de contenido | Acota a categorías, subcategorías, cursos y/o profesores |
| Filtros por Estado | Acota por estado (solo aplica a cursos) |
| Filtros por Categoría | Acota a categorías específicas |
| Filtros por Ciclo | Acota a ciclos académicos específicos |
| Ordenar por | Relevancia, Nombre, Ciclo o Créditos |
| 🗑️ Limpiar | Borra el término de búsqueda y todos los filtros |
| Cabecera de una sección | Expande o contrae los resultados de ese tipo |
| Clic sobre un resultado | ⚠️ **Sin implementar** — actualmente no navega a ningún lado |

---

## Anexo — Elementos pendientes o incompletos

Detectados durante el barrido; se listan como referencia, no como bloqueantes.

| Vista | Elemento | Situación |
|---|---|---|
| Autenticación | Continuar con Google | Solo simula una espera y muestra un aviso |
| Autenticación | ¿Olvidaste tu contraseña? | Muestra un aviso; no hay flujo de recuperación |
| Panel de Detalle de Curso | Descripción del curso | Muestra un texto genérico armado con el nombre del curso, no la descripción real almacenada |
| Panel de Administración | Generar Reporte | Botón deshabilitado, rotulado «(próximamente)» |
| Gestión de Profesores | Botón «Ver» | No ejecuta ninguna acción |
| Buscador | Clic sobre un resultado | No navega al elemento encontrado |
| Sidebar | Gestión de Semestres | No figura en el menú; solo se llega desde el Panel de Administración |
| *(archivo huérfano)* | `StudentOnboarding.jsx` | Asistente de bienvenida de 3 pasos que no está conectado a ninguna ruta. El registro real lo hace `StudentCourseRegistration` |
| Horarios (9d) | Formulario de horario | ⛔ **No guarda.** El formulario envía `name`, `days` (día + hora inicio/fin), `classroom` y `professors` (nombres), pero el backend solo acepta `schedule` (texto, máx. 10 caracteres) y `professorIds` (números). Los días, el aula y el nombre se descartan, y como el campo obligatorio `schedule` llega vacío, la creación falla. Ver «Modelo de horarios» más abajo |
| Registro de Cursos (5) | Desplegable de primer semestre | Rango fijo 2018-2025; un estudiante que empezó en 2026 no puede seleccionar su semestre inicial |

---

## Anexo — Modelo de horarios (estado actual)

Cómo está modelado hoy en la base de datos, para referencia al momento de completar los datos.

### Lo que sí existe y funciona

Un **horario** (tabla `horario`) representa *una sección de un curso en un semestre concreto*:

| Campo | Tipo | Descripción |
|---|---|---|
| `id_semestre` | Relación | El semestre al que pertenece (ej. «2025-1») |
| `id_curso` | Número | El curso |
| `horario` | Texto (máx. 10) | Identificador de la sección — pensado para el código corto tipo PUCP (ej. «0401», «H501») |
| *profesores* | Relación N:N | Profesores asignados a esa sección |
| *alumnos* | Relación N:N | Matriculados en esa sección (así se arma el historial académico) |

Es decir: **la unidad es «curso + semestre + sección»**, con sus profesores. Eso es exactamente lo que hace falta para lo que describes.

**El foro de comentarios ya usa este modelo.** Cada comentario guarda `ciclo_academico` y `id_horario`, y el panel de detalle del curso filtra por ambos: eliges ciclo → eliges horario → ves solo los comentarios de esa sección. Si no eliges horario, el ciclo cae al valor general «Todos». Esa parte está completa y es la que da sentido a filtrar por horario: comentar sobre «Cálculo con el profesor X en 2024-2» es distinto de comentar sobre el curso en abstracto.

### Lo que falta

El editor de horarios del panel de administrador se diseñó con un modelo más ambicioso que el que quedó en la base de datos: pide **nombre de la sección, días de la semana con hora de inicio y fin, y aula**. Nada de eso tiene columna donde guardarse, y el envío falla porque el único campo que el backend sí espera (`horario`) no se llega a mandar.

Hay dos caminos, según lo que realmente necesites:

| Opción | Qué implica | Cuándo conviene |
|---|---|---|
| **A. Simplificar el editor** | Dejar el formulario con solo «código de sección» + profesores, alineándolo con lo que ya existe en la base de datos. Cambio pequeño, solo frontend | Si el objetivo es el foro (filtrar comentarios por sección y profesor), que es lo que describes |
| **B. Ampliar el modelo** | Agregar columnas de aula y una tabla de bloques horarios (día, hora inicio, hora fin) por sección. Cambio en base de datos + backend + frontend | Si además quieres mostrar la grilla semanal real o detectar cruces de horario al matricularse |
