const CLAVE_STORAGE = 'recetario_local_recipes_v2';

const recetasPorDefecto = [
  {
    id: '7',
    titulo: 'Pizza Casera de Pepperoni',
    tipo: 'Cena',
    dificultad: 'Media',
    tiempo: '2 horas',
    porciones: 8,
    favorito: false,
    autor: 'Chef Tomi',
    imagen: 'https://images.unsplash.com/photo-1664309688303-ec6625cf4296?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lbWFkZSUyMHBpenphJTIwZG91Z2glMjBzYXVjZXxlbnwxfHx8fDE3ODEyMjUxMjN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    descripcion: 'Una pizza clásica y deliciosa. Hacerla desde cero toma tiempo pero el resultado de la masa fresca y la salsa casera vale totalmente la pena.',
    puntuacion: 5.0,
    videoUrl: '',
    resenas: [
      { id: 'r4', usuario: 'Laura M.', puntuacion: 5, comentario: 'La masa queda espectacular, super crujiente por fuera.', fecha: '2024-02-15' }
    ],
    notasPersonales: [],
    preparaciones: [
      {
        nombre: 'La Masa',
        ingredientes: [
          '500g de harina de fuerza (tipo 00)',
          '300ml de agua tibia',
          '7g de levadura seca de panadero',
          '10g de sal',
          '20ml de aceite de oliva virgen extra'
        ],
        pasos: [
          'Mezcla el agua tibia con la levadura y deja reposar 5 minutos.',
          'En un bol grande, pon la harina y haz un hueco en el centro. Vierte la mezcla de agua y levadura.',
          'Añade el aceite y empieza a mezclar. Cuando empiece a formar una masa, añade la sal.',
          'Amasa sobre una superficie enharinada durante unos 10-15 minutos hasta que esté lisa y elástica.',
          'Forma una bola, ponla en un bol engrasado, cubre con un paño y deja levar hasta que doble su tamaño (aprox. 1 hora).'
        ]
      },
      {
        nombre: 'La Salsa de Tomate',
        ingredientes: [
          '400g de tomate triturado (o pelati)',
          '1 diente de ajo muy picado',
          '1 cucharada de aceite de oliva',
          '1 cucharadita de orégano seco',
          'Sal y una pizca de azúcar (para la acidez)'
        ],
        pasos: [
          'En un bol, mezcla el tomate triturado con el ajo picado.',
          'Añade el aceite de oliva, el orégano, la sal y la pizca de azúcar.',
          'Mezcla bien en frío (no hace falta cocinarla, se cocinará en el horno).'
        ]
      },
      {
        nombre: 'Montaje y Horneado',
        ingredientes: [
          '250g de queso mozzarella rallado (o fresca escurrida)',
          '100g de pepperoni en rodajas',
          'Hojas de albahaca fresca (opcional)'
        ],
        pasos: [
          'Precalienta el horno al máximo que permita (250°C - 300°C), con la bandeja dentro para que se caliente.',
          'Divide la masa en dos o tres porciones y estírala con las manos desde el centro hacia afuera.',
          'Esparce una capa fina de la salsa de tomate sobre la masa extendida.',
          'Añade una capa generosa de mozzarella y distribuye el pepperoni.',
          'Hornea durante 8-12 minutos (dependiendo de la temperatura) hasta que los bordes estén dorados y el queso burbujee.',
          'Saca del horno, añade unas hojas de albahaca fresca si lo deseas, y corta en porciones.'
        ]
      }
    ]
  },
  {
    id: '1',
    titulo: 'Tostada de Aguacate y Huevo',
    tipo: 'Desayuno',
    dificultad: 'Fácil',
    tiempo: '15 min',
    porciones: 2,
    favorito: false,
    imagen: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmVha2Zhc3QlMjBhdm9jYWRvJTIwdG9hc3R8ZW58MXx8fHwxNzgxMjI0ODA5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    descripcion: 'Una deliciosa y saludable opción para empezar el día con energía.',
    puntuacion: 4.8,
    videoUrl: '',
    resenas: [],
    notasPersonales: [],
    preparaciones: [
      {
        nombre: 'Principal',
        ingredientes: [
          '2 rebanadas de pan integral',
          '1 aguacate maduro',
          '2 huevos',
          'Sal y pimienta al gusto',
          'Chorrito de aceite de oliva'
        ],
        pasos: [
          'Tuesta las rebanadas de pan hasta que estén doradas.',
          'Abre el aguacate, retira el hueso y machaca la pulpa. Añade sal y aceite.',
          'Prepara los huevos al gusto (poché, fritos o revueltos).',
          'Unta el aguacate sobre las tostadas y coloca los huevos encima.'
        ]
      }
    ]
  },
  {
    id: '2',
    titulo: 'Pasta al Pesto Casero',
    tipo: 'Almuerzo',
    dificultad: 'Media',
    tiempo: '30 min',
    porciones: 4,
    favorito: false,
    imagen: 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXN0YSUyMGx1bmNofGVufDF8fHx8MTc4MTIyNDgwOXww&ixlib=rb-4.1.0&q=80&w=1080',
    descripcion: 'Clásica pasta italiana con una salsa pesto fresca hecha en casa.',
    puntuacion: 4.6,
    videoUrl: '',
    resenas: [],
    notasPersonales: [],
    preparaciones: [
      {
        nombre: 'Salsa Pesto',
        ingredientes: [
          '2 tazas de hojas de albahaca fresca',
          '1/2 taza de queso parmesano rallado',
          '1/3 taza de piñones o nueces',
          '2 dientes de ajo',
          '1/2 taza de aceite de oliva virgen extra'
        ],
        pasos: [
          'Tuesta ligeramente los piñones en un sartén sin aceite.',
          'En un procesador, añade la albahaca, piñones, ajo y parmesano. Tritura todo.',
          'Añade lentamente el aceite de oliva hasta conseguir una emulsión.'
        ]
      },
      {
        nombre: 'La Pasta',
        ingredientes: [
          '400g de tu pasta favorita',
          'Sal para el agua',
          'Queso extra para decorar'
        ],
        pasos: [
          'Hierve agua con abundante sal y cocina la pasta según el paquete.',
          'Escurre la pasta guardando un poco del agua de cocción.',
          'Mezcla la pasta con el pesto, añadiendo agua de cocción si es necesario.'
        ]
      }
    ]
  }
];

// obtenerRecetas, guardarReceta, actualizarReceta, eliminarReceta
// ahora están en db.js con Supabase
