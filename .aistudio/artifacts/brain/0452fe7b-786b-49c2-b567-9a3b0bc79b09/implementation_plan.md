# Sorpresa de Cumpleaños para Naomi: Aventura Boo Basket & Pistas Románticas

Una experiencia web interactiva, emotiva y festiva diseñada para que Naomi escanee un código QR en la puerta de entrada de casa al volver de la calle, descubra un mensaje de amor con música ambiental suave, y siga un juego interactivo de pistas guiado por los pétalos de rosa y globos hasta encontrar su Boo basket de chuches y sus zapatillas nuevas.

## User Review & Critical Decisions

> [!IMPORTANT]
> Se han incorporado las preferencias confirmadas por el usuario:
> - **Estilo visual**: Romántico y Boo Basket con tonos rosa cálido, melocotón pastel, velas suaves y detalles dulces/tiernos.
> - **Mecánica de pistas**: Pistas interactivas prediseñadas y completamente personalizables directamente desde la app.
> - **Modo Organizador Secreto**: Panel con generador de código QR listo para imprimir o descargar en tamaño puerta, editor de mensajes y pistas, y modo de prueba.

- **Música ambiental**: Motor de audio sintetizado con Web Audio API (melodía romántica lo-fi de piano/caja de música acústica) junto con opción de subir audio o pausar/silenciar para garantizar reproducción instantánea sin restricciones de autoplay móvil ni dependencias externas.
- **Privacidad y acceso discreto**: Acceso a la suite de preparación del novio mediante un botón discreto con código PIN (por defecto "0000" o personalizable), manteniendo la pantalla principal 100% limpia para Naomi.

---

## 1. Overview & Core Concept

- **Qué hace la aplicación**:
  1. **Llegada de Naomi (Modo Experiencia)**: Naomi escanea el QR en la puerta. La web se abre en su móvil con una pantalla de bienvenida "Feliz Cumpleaños Naomi", animación suave de pétalos de rosa y la invitación a entrar y activar la música.
  2. **Carta y Mensaje de Cumpleaños**: Al abrir la carta interactiva, lee la dedicatoria personalizada conmemorando su día especial y revelando que hay una sorpresa escondida esperándola.
  3. **La Búsqueda del Tesoro (Pistas Paso a Paso)**: Un recorrido dinámico donde cada pista le pide buscar en un rincón (ej. "Sigue el rastro de pétalos...", "Mira donde guardamos los momentos más dulces...", "Busca entre tus prendas favoritas..."). Puede pedir pistas extra si se atasca y marcar cuando haya encontrado el siguiente punto.
  4. **El Gran Descubrimiento (Boo Basket & Sneakers)**: Al resolver la última pista, la pantalla estalla en una celebración de confeti y pétalos dorados, revelando la tarjeta digital dedicada, felicitándola y desvelando los detalles de su Boo basket y sus nuevas zapatillas.
  5. **Panel de Preparación para el Novio**: Permite generar el código QR en alta resolución para imprimirlo en papel y pegarlo en la puerta, editar las pistas del escondite según la distribución real de la casa, y probar el flujo de Naomi de principio a fin.

- **Público Objetivo**: Naomi (móvil en mano al llegar a la puerta) y su novio (organizador y cómplice de la sorpresa).
- **Valor Principal**: Transforma un regalo físico en una experiencia inmersiva, romántica y memorable que comienza desde el primer paso que da al llegar a casa.

---

## 2. User Experience & Visual Design

### Flujo de Usuario (Paso a Paso)

```
[ QR en la Puerta ] 
       │ (Naomi escanea con la cámara)
       ▼
┌───────────────────────────────────────────────┐
│  PANTALLA 1: Bienvenida & Activación Musical   │
│  "Bienvenida a casa, Naomi... Toca para entrar"│
└───────────────────────┬───────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────┐
│  PANTALLA 2: Carta Romántica Dedicada          │
│  Sobre con lacre que se abre con animación     │
│  Dedicatoria de amor y aviso de las pistas    │
└───────────────────────┬───────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────┐
│  PANTALLA 3: Búsqueda de Pistas Interactiva   │
│  • Pista actual con acertijo romántico        │
│  • Botón "Pedir pista adicional"              │
│  • Botón "¡La encontré! Siguiente paso"       │
│  • Progreso visual dulce (1 de 4, 2 de 4...)  │
└───────────────────────┬───────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────┐
│  PANTALLA 4: Revelación Final & Celebración   │
│  "¡Encontraste tu Boo Basket y tus zapatillas!│
│  Celebración de confeti + Tarjeta de amor     │
└───────────────────────────────────────────────┘
```

### Identidad Visual & Estilo

- **Aesthetic Direction**: *Romantic Cozy Boo Basket*. Una combinación dulce de romanticismo clásico (pétalos de rosa, calidez, tipografía cuidada) con el espíritu festivo de un Boo basket (fantasmitas tiernos, dulces, lazos de regalo, detalles otoñales cálidos).
- **Paleta de Colores**:
  - Lienzo dominante (60%): Rosa empolvado ultra suave y crema cálido (`#FFF9F8`, `#FDF2F4`, `dark: #1F141A`).
  - Superficies y contenedores (30%): Blanco marfil con bordes tenues de rubor (`#FFFFFF`, `#FFF0F3`, borde `border-rose-200/50`).
  - Acentos e interacción (10%): Rosa frambuesa dulce y borgoña romántico (`#E11D48`, `#BE123C`, oro rosa `#F43F5E`).
- **Tipografía**:
  - Títulos y dedicatoria: Serif cálido y elegante (`Playfair Display` o font serif del sistema con espaciado equilibrado).
  - Textos de pistas y botones: Sans moderna y de alta legibilidad táctil (`Plus Jakarta Sans` / `Outfit`).
- **Ergonomía Móvil Touch-First**:
  - Botones táctiles generosos ($\ge 48\text{px}$) ubicados en la zona natural del pulgar (tercio inferior de la pantalla).
  - Animación fluida de pétalos flotantes con CSS ligero (respetando `prefers-reduced-motion`).
  - Barra de control de audio sutil y fija con botón de silenciar/reproducir siempre accesible sin tapar contenido ($\le 12\%$ de la pantalla).

---

## 3. Key Product Decisions & Trade-Offs

- **Decisión 1: Generador de QR integrado y listo para imprimir**
  - *Enfoque*: Incluir una vista de "Modo Puerta" con el código QR generado mediante una librería ligera o renderizado SVG nativo, con instrucciones claras ("Imprime o muestra en otra pantalla y pégalo en la puerta a la altura de los ojos").
  - *Por qué*: El usuario necesita físicamente el QR para ponerlo en la puerta antes de que Naomi llegue; tenerlo listo dentro de la app le ahorra buscar herramientas externas.

- **Decisión 2: Audio Romántico con Web Audio API + Fallback de música**
  - *Enfoque*: Generador melódico armónico de piano/caja de música ambiental usando Web Audio API, que arranca tras el primer toque ("Toca para abrir tu sorpresa").
  - *Por qué*: Evita que el navegador del móvil bloquee la música por restricciones de autoplay, no requiere descargas pesadas de audio de 10MB y funciona al instante sin depender de servicios externos caídos.

- **Decisión 3: Editor de Pistas con Persistencia Local (LocalStorage)**
  - *Enfoque*: Viene con 4 pistas prediseñadas maravillosas sobre la casa (entrada con globos y pétalos, salón/recuerdos, armario o habitación, escondite final del regalo), pero permite que el novio cambie los textos fácilmente desde el panel de organizador.
  - *Por qué*: Cada casa tiene una distribución distinta; poder ajustar los lugares exactos donde están los globos y el regalo garantiza que la sorpresa sea perfecta.

---

## 4. Technical Architecture & Data Strategy

### Diagrama de Arquitectura y Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                       App Container                         │
│   (Manejo de vista: Naomi Surprise Flow vs Panel de Novio)  │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
       [Modo Naomi]                    [Modo Organizador]
               │                               │
       ┌───────┴───────────────┐       ┌───────┴──────────────┐
       │ - Welcome Hero        │       │ - Editor de Pistas   │
       │ - Ambient Music Player│       │ - Generador QR Door  │
       │ - Envelope / Letter   │       │ - Checklist Regalos  │
       │ - Clue Scavenger Hunt │       │ - Vista Previa / Test│
       │ - Final Celebration   │       └──────────────────────┘
       └───────────────────────┘
               │
       ┌───────┴───────────────┐
       │  Servicio de Datos    │
       │  (Config, Pistas,     │
       │   Mensaje, Guardado)  │
       └───────────────────────┘
```

### Modelo de Datos

- **`SurpriseConfig`**:
  - `recipientName`: "Naomi"
  - `welcomeTitle`: "¡Feliz Cumpleaños, mi amor!"
  - `welcomeSubtitle`: "Hay una sorpresa esperándote dentro..."
  - `loveLetter`: Carta de amor personalizada con motivo de su cumpleaños.
  - `clues`: Array de pistas:
    - `id`: string
    - `title`: string (ej. "Pista 1: El camino de pétalos")
    - `riddle`: string (el acertijo romántico)
    - `extraHint`: string (pista de apoyo si le cuesta encontrarlo)
    - `targetLocation`: string (ej. "Mesa de la entrada", "Salón junto al sofá")
    - `isCompleted`: boolean
  - `finalGift`:
    - `items`: ["Boo Basket llena de tus chuches favoritas", "Zapatillas nuevas que tanto querías", "Tarjeta hecha con todo mi amor"]
    - `congratulationMessage`: Mensaje final de felicitación.
  - `audioEnabled`: boolean

### Componentes y Flujos de Interacción

1. **`WelcomeScreen`**: Pantalla inicial con estética romántica y dulce de Boo Basket, aviso de "Sube el volumen de tu teléfono", y botón de entrada táctil grande que inicia la música y desbloquea el audio context.
2. **`LoveLetterModal`**: Animación de carta que se abre con un toque, revelando el mensaje emotivo y dando la bienvenida al juego de pistas.
3. **`ClueHuntView`**:
   - Tarjeta interactiva con la pista actual.
   - Pista extra desplegable con un toque suave.
   - Botón de confirmación "¡Encontré la pista! Continuar" con feedback táctil y confeti de corazones/pétalos.
   - Barra de progreso que avanza hacia el regalo final.
4. **`FinalGiftReveal`**:
   - Explosión festiva de confeti y corazones.
   - Animación de desempaquetado de la Boo basket y las deportivas.
   - Mensaje de amor definitivo para que lo abracen juntos en casa.
5. **`OrganizerPanel`**:
   - Código QR para imprimir o descargar en PDF/PNG para la puerta.
   - Formulario interactivo para cambiar pistas y mensajes.
   - Botón para reiniciar progreso o probar como Naomi.
