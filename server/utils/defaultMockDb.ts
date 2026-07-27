export interface Category {
  id: number
  name: string
  slug: string
  parent: number | null
  products_count?: number
}

export interface Product {
  id: number
  name: string
  code?: string
  category: number
  category_detail?: { id: number; name: string; slug: string }
  description: string
  images?: { id: number; image: string; is_base?: boolean }[]
  modifications?: any[]
}

export const defaultCategories: Category[] = [
  { id: 1, name: "Терапия и Реставрация", slug: "terapiya", parent: null },
  { id: 2, name: "Эндодонтия", slug: "endodontiya", parent: null },
  { id: 3, name: "Ортопедия", slug: "ortopediya", parent: null },
  { id: 4, name: "Стоматологическое Оборудование", slug: "oborudovanie", parent: null },
  { id: 5, name: "Хирургия и Имплантология", slug: "khirurgiya", parent: null },
  { id: 6, name: "Расходные Материалы", slug: "rashodniki", parent: null },
  { id: 7, name: "Гигиена и Профилактика", slug: "gigiena", parent: null },
  { id: 8, name: "Инструменты Стоматологические", slug: "instrumenty", parent: null }
]

export const defaultProducts: Product[] = [
  {
    id: 101,
    name: "Стоматологический микроскоп Flexion Dent",
    code: "MIC-001",
    category: 4,
    category_detail: { id: 4, name: "Стоматологическое Оборудование", slug: "oborudovanie" },
    description: "Премиальный стоматологический микроскоп с VarioFocus объективом (200-350 мм) и светодиодной оптикой апохроматического типа. Идеален для точной эдодонтии и реставрации.",
    images: [{ id: 1, image: "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=900&q=80", is_base: true }],
    modifications: [{ id: 1011, name: "Flexion Pro LED", prices: [{ currency_price: 1250000, currency: "KZT" }] }]
  },
  {
    id: 102,
    name: "Коффердам Набор Easy Dam Kit",
    code: "DAM-002",
    category: 6,
    category_detail: { id: 6, name: "Расходные Материалы", slug: "rashodniki" },
    description: "Полный набор коффердама: 36 латексных платков средней плотности, пробойник, щипцы и набор клампов (12 шт). Обеспечивает абсолютную изоляцию операционного поля.",
    images: [{ id: 2, image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=900&q=80", is_base: true }],
    modifications: [{ id: 1021, name: "Комплект 36 платков + Клампы", prices: [{ currency_price: 18500, currency: "KZT" }] }]
  },
  {
    id: 103,
    name: "Бестеневая светодиодная лампа LED Smile",
    code: "LAMP-003",
    category: 4,
    category_detail: { id: 4, name: "Стоматологическое Оборудование", slug: "oborudovanie" },
    description: "Мощный бестеневой светильник для стоматологической установки с сенсорным регулированием яркости (8 000 - 35 000 Люкс) и цветовой температуры.",
    images: [{ id: 3, image: "https://images.unsplash.com/photo-1580281657527-2e6be6f5bc0d?auto=format&fit=crop&w=900&q=80", is_base: true }],
    modifications: [{ id: 1031, name: "LED Бестеневой 35000 Lux", prices: [{ currency_price: 480000, currency: "KZT" }] }]
  },
  {
    id: 104,
    name: "Фотополимерный композит Esthet-X HD",
    code: "COMP-004",
    category: 1,
    category_detail: { id: 1, name: "Терапия и Реставрация", slug: "terapiya" },
    description: "Наногибридный реставрационный композит высокой эстетики. Шприц 4г. Идеальная полируемость, пластичность и естественный блеск эмали.",
    images: [{ id: 4, image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=900&q=80", is_base: true }],
    modifications: [{ id: 1041, name: "Оттенок А2 (Шприц 4г)", prices: [{ currency_price: 24500, currency: "KZT" }] }]
  },
  {
    id: 105,
    name: "Ультразвуковой скайлер Woodpecker UDS-E",
    code: "SCL-005",
    category: 7,
    category_detail: { id: 7, name: "Гигиена и Профилактика", slug: "gigiena" },
    description: "Автономный ультразвуковой скайлер с водой и резервуаром для антисептиков. Функции скайлинга, эндодонтии и пародонтологии. В комплекте 8 насадок.",
    images: [{ id: 5, image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=900&q=80", is_base: true }],
    modifications: [{ id: 1051, name: "Скайлер автономный + 8 насадок", prices: [{ currency_price: 135000, currency: "KZT" }] }]
  },
  {
    id: 106,
    name: "Алмазные боры MANI (Набор 10 шт)",
    code: "BUR-006",
    category: 8,
    category_detail: { id: 8, name: "Инструменты Стоматологические", slug: "instrumenty" },
    description: "Японские высокоточные алмазные боры MANI для турбинного наконечника. Оптимальная зернистость, минимальная вибрация и долгий срок службы.",
    images: [{ id: 6, image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=900&q=80", is_base: true }],
    modifications: [{ id: 1061, name: "Набор 10 шт (Турбинные)", prices: [{ currency_price: 12800, currency: "KZT" }] }]
  },
  {
    id: 107,
    name: "Эндомотор с апекслокатором Endo Smart",
    code: "ENDO-007",
    category: 2,
    category_detail: { id: 2, name: "Эндодонтия", slug: "endodontiya" },
    description: "Беспроводной эндомотор со встроенным апекслокатором. Поддерживает реципрокное движение, автоматический реверс и настройку крутящего момента.",
    images: [{ id: 7, image: "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=900&q=80", is_base: true }],
    modifications: [{ id: 1071, name: "Endo Smart Wireless", prices: [{ currency_price: 210000, currency: "KZT" }] }]
  },
  {
    id: 108,
    name: "А слепочная масса А-Силикон Elite HD+",
    code: "IMPR-008",
    category: 3,
    category_detail: { id: 3, name: "Ортопедия", slug: "ortopediya" },
    description: "Высокоточная А-Силиконовая оттискная масса гидрофильного типа. Комплект: база (2x250мл) + коррегирующий слой (2x50мл).",
    images: [{ id: 8, image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=900&q=80", is_base: true }],
    modifications: [{ id: 1081, name: "Набор База + Корректура", prices: [{ currency_price: 38000, currency: "KZT" }] }]
  },
  {
    id: 109,
    name: "Физиодиспенсер хирургический Implantmed",
    code: "IMP-009",
    category: 5,
    category_detail: { id: 5, name: "Хирургия и Имплантология", slug: "khirurgiya" },
    description: "Хирургический аппарат для дентальной имплантологии и челюстно-лицевой хирургии. Бесщеточный мотор, подстветка LED, мощный крутящий момент до 80 Нсм.",
    images: [{ id: 9, image: "https://images.unsplash.com/photo-1580281657527-2e6be6f5bc0d?auto=format&fit=crop&w=900&q=80", is_base: true }],
    modifications: [{ id: 1091, name: "Implantmed Set с наконечником 20:1", prices: [{ currency_price: 1850000, currency: "KZT" }] }]
  },
  {
    id: 110,
    name: "Одноразовые стоматологические слюноотсосы (100 шт)",
    code: "SUC-010",
    category: 6,
    category_detail: { id: 6, name: "Расходные Материалы", slug: "rashodniki" },
    description: "Гибкие одноразовые слюноотсосы с наконечником. Не травмируют слизистую, держит заданную форму. В упаковке 100 штук.",
    images: [{ id: 10, image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=900&q=80", is_base: true }],
    modifications: [{ id: 1101, name: "Упаковка 100 шт", prices: [{ currency_price: 2900, currency: "KZT" }] }]
  }
]
