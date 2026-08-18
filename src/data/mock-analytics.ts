export type PeriodKey = "hoje" | "7d" | "30d";

export const periodLabels: Record<PeriodKey, string> = {
  hoje: "Hoje",
  "7d": "Últimos 7 dias",
  "30d": "30 dias",
};

export type FunnelStep = {
  id: string;
  event: string;
  name: string;
  sessions: number;
  previousSessions: number;
};

export type FunnelPeriod = {
  steps: FunnelStep[];
};

export const funnelByPeriod: Record<PeriodKey, FunnelPeriod> = {
  hoje: {
    steps: [
      { id: "visits", event: "menu_session_started", name: "Visitas ao cardápio", sessions: 186, previousSessions: 204 },
      { id: "viewed", event: "product_viewed", name: "Visualizaram um produto", sessions: 142, previousSessions: 151 },
      { id: "cart", event: "item_added_to_cart", name: "Adicionaram à sacola", sessions: 68, previousSessions: 80 },
      { id: "checkout", event: "checkout_started", name: "Iniciaram o checkout", sessions: 34, previousSessions: 41 },
      { id: "completed", event: "order_completed", name: "Concluíram o pedido", sessions: 18, previousSessions: 22 },
    ],
  },
  "7d": {
    steps: [
      { id: "visits", event: "menu_session_started", name: "Visitas ao cardápio", sessions: 1280, previousSessions: 1396 },
      { id: "viewed", event: "product_viewed", name: "Visualizaram um produto", sessions: 864, previousSessions: 910 },
      { id: "cart", event: "item_added_to_cart", name: "Adicionaram à sacola", sessions: 384, previousSessions: 452 },
      { id: "checkout", event: "checkout_started", name: "Iniciaram o checkout", sessions: 192, previousSessions: 218 },
      { id: "completed", event: "order_completed", name: "Concluíram o pedido", sessions: 96, previousSessions: 112 },
    ],
  },
  "30d": {
    steps: [
      { id: "visits", event: "menu_session_started", name: "Visitas ao cardápio", sessions: 4820, previousSessions: 4510 },
      { id: "viewed", event: "product_viewed", name: "Visualizaram um produto", sessions: 3210, previousSessions: 2980 },
      { id: "cart", event: "item_added_to_cart", name: "Adicionaram à sacola", sessions: 1480, previousSessions: 1520 },
      { id: "checkout", event: "checkout_started", name: "Iniciaram o checkout", sessions: 720, previousSessions: 690 },
      { id: "completed", event: "order_completed", name: "Concluíram o pedido", sessions: 386, previousSessions: 354 },
    ],
  },
};

export type ProductPerf = {
  id: string;
  name: string;
  category: string;
  image: string;
  quantity: number;
  revenue: number;
};

export const productPerformance: Record<PeriodKey, ProductPerf[]> = {
  hoje: [
    { id: "pizza-calabresa", name: "Pizza Calabresa Grande", category: "Pizzas", image: "/mock/pizza-calabresa.jpg", quantity: 8, revenue: 311.2 },
    { id: "combo-familia", name: "Combo Família", category: "Combos", image: "/mock/combo-familia.jpg", quantity: 5, revenue: 374.5 },
    { id: "pizza-margherita", name: "Pizza Margherita", category: "Pizzas", image: "/mock/pizza-margherita.jpg", quantity: 4, revenue: 147.6 },
    { id: "pizza-portuguesa", name: "Pizza Portuguesa", category: "Pizzas", image: "/mock/pizza-calabresa.jpg", quantity: 3, revenue: 128.7 },
    { id: "batata-frita", name: "Batata Frita Grande", category: "Porções", image: "/mock/batata-frita.jpg", quantity: 3, revenue: 59.7 },
    { id: "pizza-quatro-queijos", name: "Pizza Quatro Queijos", category: "Pizzas", image: "/mock/pizza-margherita.jpg", quantity: 2, revenue: 89.8 },
    { id: "brownie", name: "Brownie de Chocolate", category: "Sobremesas", image: "/mock/brownie.jpg", quantity: 2, revenue: 33.8 },
    { id: "refrigerante-2l", name: "Refrigerante Cola 2L", category: "Bebidas", image: "/mock/refrigerante.jpg", quantity: 1, revenue: 12.9 },
  ],
  "7d": [
    { id: "pizza-calabresa", name: "Pizza Calabresa Grande", category: "Pizzas", image: "/mock/pizza-calabresa.jpg", quantity: 48, revenue: 1867.2 },
    { id: "combo-familia", name: "Combo Família", category: "Combos", image: "/mock/combo-familia.jpg", quantity: 22, revenue: 1647.8 },
    { id: "pizza-margherita", name: "Pizza Margherita", category: "Pizzas", image: "/mock/pizza-margherita.jpg", quantity: 36, revenue: 1328.4 },
    { id: "pizza-quatro-queijos", name: "Pizza Quatro Queijos", category: "Pizzas", image: "/mock/pizza-margherita.jpg", quantity: 18, revenue: 808.2 },
    { id: "pizza-portuguesa", name: "Pizza Portuguesa", category: "Pizzas", image: "/mock/pizza-calabresa.jpg", quantity: 14, revenue: 600.6 },
    { id: "batata-frita", name: "Batata Frita Grande", category: "Porções", image: "/mock/batata-frita.jpg", quantity: 19, revenue: 378.1 },
    { id: "brownie", name: "Brownie de Chocolate", category: "Sobremesas", image: "/mock/brownie.jpg", quantity: 11, revenue: 185.9 },
    { id: "refrigerante-2l", name: "Refrigerante Cola 2L", category: "Bebidas", image: "/mock/refrigerante.jpg", quantity: 9, revenue: 116.1 },
  ],
  "30d": [
    { id: "pizza-calabresa", name: "Pizza Calabresa Grande", category: "Pizzas", image: "/mock/pizza-calabresa.jpg", quantity: 186, revenue: 7235.4 },
    { id: "combo-familia", name: "Combo Família", category: "Combos", image: "/mock/combo-familia.jpg", quantity: 84, revenue: 6291.6 },
    { id: "pizza-margherita", name: "Pizza Margherita", category: "Pizzas", image: "/mock/pizza-margherita.jpg", quantity: 142, revenue: 5239.8 },
    { id: "pizza-quatro-queijos", name: "Pizza Quatro Queijos", category: "Pizzas", image: "/mock/pizza-margherita.jpg", quantity: 71, revenue: 3187.9 },
    { id: "pizza-portuguesa", name: "Pizza Portuguesa", category: "Pizzas", image: "/mock/pizza-calabresa.jpg", quantity: 58, revenue: 2488.2 },
    { id: "batata-frita", name: "Batata Frita Grande", category: "Porções", image: "/mock/batata-frita.jpg", quantity: 73, revenue: 1452.7 },
    { id: "brownie", name: "Brownie de Chocolate", category: "Sobremesas", image: "/mock/brownie.jpg", quantity: 44, revenue: 743.6 },
    { id: "refrigerante-2l", name: "Refrigerante Cola 2L", category: "Bebidas", image: "/mock/refrigerante.jpg", quantity: 31, revenue: 399.9 },
  ],
};

export type ComplementPerf = {
  id: string;
  name: string;
  group: string;
  image?: string;
  quantity: number;
  revenue: number;
};

export const complementPerformance: Record<PeriodKey, ComplementPerf[]> = {
  hoje: [
    { id: "catupiry", name: "Catupiry", group: "Bordas", quantity: 6, revenue: 24 },
    { id: "barbecue", name: "Molho Barbecue", group: "Molhos", quantity: 5, revenue: 10 },
    { id: "cheddar", name: "Cheddar", group: "Bordas", quantity: 4, revenue: 16 },
    { id: "sem-borda", name: "Sem borda", group: "Bordas", quantity: 7, revenue: 0 },
    { id: "maionese", name: "Maionese Temperada", group: "Molhos", quantity: 2, revenue: 4 },
    { id: "chocolate", name: "Chocolate", group: "Bordas", quantity: 1, revenue: 5 },
  ],
  "7d": [
    { id: "sem-borda", name: "Sem borda", group: "Bordas", quantity: 40, revenue: 0 },
    { id: "catupiry", name: "Catupiry", group: "Bordas", quantity: 28, revenue: 112 },
    { id: "barbecue", name: "Molho Barbecue", group: "Molhos", quantity: 31, revenue: 62 },
    { id: "cheddar", name: "Cheddar", group: "Bordas", quantity: 21, revenue: 84 },
    { id: "rose", name: "Molho Rosê", group: "Molhos", quantity: 14, revenue: 28 },
    { id: "maionese", name: "Maionese Temperada", group: "Molhos", quantity: 11, revenue: 22 },
    { id: "chocolate", name: "Chocolate", group: "Bordas", quantity: 6, revenue: 30 },
    { id: "cola", name: "Refrigerante Cola 2L", group: "Bebidas", quantity: 9, revenue: 108 },
  ],
  "30d": [
    { id: "sem-borda", name: "Sem borda", group: "Bordas", quantity: 154, revenue: 0 },
    { id: "catupiry", name: "Catupiry", group: "Bordas", quantity: 112, revenue: 448 },
    { id: "barbecue", name: "Molho Barbecue", group: "Molhos", quantity: 121, revenue: 242 },
    { id: "cheddar", name: "Cheddar", group: "Bordas", quantity: 86, revenue: 344 },
    { id: "rose", name: "Molho Rosê", group: "Molhos", quantity: 58, revenue: 116 },
    { id: "maionese", name: "Maionese Temperada", group: "Molhos", quantity: 44, revenue: 88 },
    { id: "cola", name: "Refrigerante Cola 2L", group: "Bebidas", quantity: 37, revenue: 444 },
    { id: "chocolate", name: "Chocolate", group: "Bordas", quantity: 19, revenue: 95 },
  ],
};

export type CancelledOrder = {
  id: string;
  number: string;
  customer: string;
  time: string;
  total: number;
  reason: string;
  responsible: string;
  origin: string;
};

export type CancellationPeriod = {
  created: number;
  cancelled: number;
  lostRevenue: number;
  mainReason: string;
  byDay: { label: string; value: number }[];
  reasons: { reason: string; count: number; lost: number }[];
  orders: CancelledOrder[];
};

export const cancellationsByPeriod: Record<PeriodKey, CancellationPeriod> = {
  hoje: {
    created: 21,
    cancelled: 3,
    lostRevenue: 148.3,
    mainReason: "Cliente desistiu",
    byDay: [{ label: "Hoje", value: 3 }],
    reasons: [
      { reason: "Cliente desistiu", count: 2, lost: 94.4 },
      { reason: "Fora da área de entrega", count: 1, lost: 53.9 },
    ],
    orders: [
      { id: "183760", number: "#183760", customer: "Marina Lopes", time: "19:12", total: 52.4, reason: "Cliente desistiu", responsible: "Cliente", origin: "Instagram" },
      { id: "183758", number: "#183758", customer: "Paulo Henrique", time: "18:41", total: 42.0, reason: "Cliente desistiu", responsible: "Cliente", origin: "Direto" },
      { id: "183751", number: "#183751", customer: "Rita Souza", time: "18:05", total: 53.9, reason: "Fora da área de entrega", responsible: "Loja", origin: "WhatsApp" },
    ],
  },
  "7d": {
    created: 110,
    cancelled: 12,
    lostRevenue: 612.4,
    mainReason: "Cliente desistiu",
    byDay: [
      { label: "12/08", value: 1 },
      { label: "13/08", value: 2 },
      { label: "14/08", value: 1 },
      { label: "15/08", value: 3 },
      { label: "16/08", value: 1 },
      { label: "17/08", value: 2 },
      { label: "18/08", value: 2 },
    ],
    reasons: [
      { reason: "Cliente desistiu", count: 5, lost: 248.1 },
      { reason: "Item esgotado", count: 3, lost: 164.7 },
      { reason: "Fora da área de entrega", count: 2, lost: 107.8 },
      { reason: "Pagamento recusado no local", count: 2, lost: 91.8 },
    ],
    orders: [
      { id: "183760", number: "#183760", customer: "Marina Lopes", time: "19:12", total: 52.4, reason: "Cliente desistiu", responsible: "Cliente", origin: "Instagram" },
      { id: "183758", number: "#183758", customer: "Paulo Henrique", time: "18:41", total: 42.0, reason: "Cliente desistiu", responsible: "Cliente", origin: "Direto" },
      { id: "183751", number: "#183751", customer: "Rita Souza", time: "18:05", total: 53.9, reason: "Fora da área de entrega", responsible: "Loja", origin: "WhatsApp" },
      { id: "183744", number: "#183744", customer: "Caio Nunes", time: "21:18", total: 74.9, reason: "Item esgotado", responsible: "Loja", origin: "Meta Ads" },
      { id: "183730", number: "#183730", customer: "Helena Dias", time: "20:02", total: 45.9, reason: "Pagamento recusado no local", responsible: "Cliente", origin: "Direto" },
      { id: "183721", number: "#183721", customer: "Otávio Lima", time: "19:27", total: 38.9, reason: "Cliente desistiu", responsible: "Cliente", origin: "Instagram" },
    ],
  },
  "30d": {
    created: 428,
    cancelled: 41,
    lostRevenue: 2148.6,
    mainReason: "Cliente desistiu",
    byDay: [
      { label: "S1", value: 8 },
      { label: "S2", value: 11 },
      { label: "S3", value: 10 },
      { label: "S4", value: 12 },
    ],
    reasons: [
      { reason: "Cliente desistiu", count: 18, lost: 892.4 },
      { reason: "Item esgotado", count: 10, lost: 548.2 },
      { reason: "Fora da área de entrega", count: 7, lost: 392.0 },
      { reason: "Pagamento recusado no local", count: 6, lost: 316.0 },
    ],
    orders: [
      { id: "183760", number: "#183760", customer: "Marina Lopes", time: "19:12", total: 52.4, reason: "Cliente desistiu", responsible: "Cliente", origin: "Instagram" },
      { id: "183744", number: "#183744", customer: "Caio Nunes", time: "21:18", total: 74.9, reason: "Item esgotado", responsible: "Loja", origin: "Meta Ads" },
      { id: "183721", number: "#183721", customer: "Otávio Lima", time: "19:27", total: 38.9, reason: "Cliente desistiu", responsible: "Cliente", origin: "Instagram" },
      { id: "183690", number: "#183690", customer: "Sueli Prado", time: "20:44", total: 89.8, reason: "Item esgotado", responsible: "Loja", origin: "Direto" },
      { id: "183640", number: "#183640", customer: "Igor Ramos", time: "18:16", total: 53.9, reason: "Fora da área de entrega", responsible: "Loja", origin: "WhatsApp" },
    ],
  },
};

export const couponOverview = {
  investment: 225,
  revenue: 1420.8,
  orders: 38,
  roi: 531.47,
};

export type CouponPerf = {
  slug: string;
  code: string;
  benefit: string;
  status: "Ativo" | "Pausado";
  validUntil: string;
  rule: string;
  audience: string;
  uses: string;
  used: number;
  limit: number;
  orders: number;
  investment: number;
  revenue: number;
  roi: number;
};

export const couponPerformance: CouponPerf[] = [
  {
    slug: "fretegratis",
    code: "FRETEGRATIS",
    benefit: "Frete grátis",
    status: "Pausado",
    validUntil: "20/08/2025",
    rule: "Mínimo R$ 60",
    audience: "Novos clientes",
    uses: "12 / 200",
    used: 12,
    limit: 200,
    orders: 12,
    investment: 60,
    revenue: 420,
    roi: 600,
  },
  {
    slug: "bemvindo10",
    code: "BEMVINDO10",
    benefit: "10% de desconto",
    status: "Ativo",
    validUntil: "31/07/2025",
    rule: "Novos clientes",
    audience: "Primeira compra",
    uses: "15 / 100",
    used: 15,
    limit: 100,
    orders: 15,
    investment: 75,
    revenue: 540.8,
    roi: 621.07,
  },
  {
    slug: "menos20",
    code: "MENOS20",
    benefit: "R$ 20,00 de desconto",
    status: "Ativo",
    validUntil: "30/08/2025",
    rule: "Mínimo R$ 80",
    audience: "Todos os clientes",
    uses: "11 / 150",
    used: 11,
    limit: 150,
    orders: 11,
    investment: 90,
    revenue: 460,
    roi: 411.11,
  },
];

export const couponDaily = [
  { label: "12/08", investment: 25, revenue: 160, uses: 4 },
  { label: "13/08", investment: 30, revenue: 190, uses: 5 },
  { label: "14/08", investment: 20, revenue: 140, uses: 4 },
  { label: "15/08", investment: 40, revenue: 250, uses: 7 },
  { label: "16/08", investment: 35, revenue: 220, uses: 6 },
  { label: "17/08", investment: 40, revenue: 240, uses: 6 },
  { label: "18/08", investment: 35, revenue: 220.8, uses: 6 },
];

export const couponOrders = {
  fretegratis: [
    { number: "#183701", customer: "Lucas Almeida", date: "17/08/2025", subtotal: 38.9, discount: 5, total: 33.9, status: "Finalizado" },
    { number: "#183688", customer: "Ana Martins", date: "16/08/2025", subtotal: 49.8, discount: 5, total: 44.8, status: "Finalizado" },
    { number: "#183640", customer: "Pedro Augusto", date: "15/08/2025", subtotal: 36.9, discount: 5, total: 31.9, status: "Finalizado" },
  ],
  bemvindo10: [
    { number: "#183710", customer: "Juliana Costa", date: "17/08/2025", subtotal: 44.9, discount: 4.49, total: 40.41, status: "Finalizado" },
    { number: "#183676", customer: "Rafael Souza", date: "16/08/2025", subtotal: 74.9, discount: 7.49, total: 67.41, status: "Finalizado" },
    { number: "#183652", customer: "Beatriz Santos", date: "14/08/2025", subtotal: 38.9, discount: 3.89, total: 35.01, status: "Finalizado" },
  ],
  menos20: [
    { number: "#183705", customer: "Matheus Ferreira", date: "17/08/2025", subtotal: 89.8, discount: 20, total: 69.8, status: "Finalizado" },
    { number: "#183661", customer: "Tatiane B. Lima", date: "15/08/2025", subtotal: 84.8, discount: 20, total: 64.8, status: "Finalizado" },
    { number: "#183620", customer: "Carla Mendes", date: "13/08/2025", subtotal: 74.9, discount: 20, total: 54.9, status: "Finalizado" },
  ],
};

export const bioBanners = [
  {
    id: "combo",
    title: "Combo Família",
    description: "Pizza grande, refrigerante 2L e batata frita para compartilhar.",
    price: 74.9,
    image: "/mock/promo.jpg",
    href: "/loja/pizzaria-imperial/produto/combo-familia",
  },
  {
    id: "calabresa",
    title: "Pizza Calabresa Grande",
    description: "Mussarela, calabresa fatiada, cebola e orégano.",
    price: 38.9,
    image: "/mock/hero.jpg",
    href: "/loja/pizzaria-imperial/produto/pizza-calabresa",
  },
  {
    id: "margherita",
    title: "Pizza Margherita",
    description: "Molho de tomate, mussarela e manjericão fresco.",
    price: 36.9,
    image: "/mock/pizza-margherita.jpg",
    href: "/loja/pizzaria-imperial/produto/pizza-margherita",
  },
];

export const bioHighlights = [
  {
    id: "promo",
    title: "Promoção do dia",
    text: "Combo Família com preço especial.",
    value: "R$ 74,90",
    image: "/mock/combo-familia.jpg",
    href: "/loja/pizzaria-imperial/produto/combo-familia",
  },
  {
    id: "familia",
    title: "Combo Família",
    text: "Ideal para 3 a 4 pessoas.",
    value: "17% off",
    image: "/mock/promo.jpg",
    href: "/loja/pizzaria-imperial/produto/combo-familia",
  },
  {
    id: "cupom",
    title: "Cupom de primeira compra",
    text: "Use BEMVINDO10 no checkout.",
    value: "10% off",
    image: "/mock/pizza-calabresa.jpg",
    href: "/loja/pizzaria-imperial",
  },
];
