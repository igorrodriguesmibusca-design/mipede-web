export type TrackingLink = {
  id: string;
  name: string;
  origin: "Instagram orgânico" | "Meta Ads" | "Google Ads" | "WhatsApp";
  campaign: string;
  visits: number;
  orders: number;
  conversion: string;
  revenue: number;
  status: "Ativo" | "Pausado";
};

export const trackingLinks: TrackingLink[] = [
  {
    id: "bio",
    name: "Link da bio",
    origin: "Instagram orgânico",
    campaign: "—",
    visits: 420,
    orders: 31,
    conversion: "7,4%",
    revenue: 1820.5,
    status: "Ativo",
  },
  {
    id: "dobro",
    name: "Campanha Pizza em Dobro",
    origin: "Meta Ads",
    campaign: "Pizza em Dobro - Maio",
    visits: 312,
    orders: 22,
    conversion: "7,1%",
    revenue: 1378.0,
    status: "Ativo",
  },
  {
    id: "pesquisa",
    name: "Anúncio Pesquisa Local",
    origin: "Google Ads",
    campaign: "Pesquisa Local - Maio",
    visits: 298,
    orders: 18,
    conversion: "6,0%",
    revenue: 967.5,
    status: "Ativo",
  },
  {
    id: "whatsapp",
    name: "Link WhatsApp",
    origin: "WhatsApp",
    campaign: "—",
    visits: 254,
    orders: 15,
    conversion: "5,9%",
    revenue: 654.5,
    status: "Ativo",
  },
];

export const trackingStats = {
  visits: 1284,
  visitsDelta: "-8,5% vs últimos 7 dias",
  visitsUp: false,
  orders: 86,
  ordersDelta: "+12,8% vs últimos 7 dias",
  ordersUp: true,
  conversion: "6,7%",
  conversionDelta: "+2,1 p.p. vs últimos 7 dias",
  conversionUp: true,
  revenue: 4820.5,
  revenueDelta: "+15,4% vs últimos 7 dias",
  revenueUp: true,
};

export const trackingFunnel = {
  name: "Link da bio",
  period: "Período: últimos 7 dias",
  steps: [
    { label: "Acessos", value: 420, icon: "users" },
    { label: "Carrinho", value: 78, icon: "cart", drop: "18,6%" },
    { label: "Checkout", value: 44, icon: "card", drop: "56,4%" },
    { label: "Pedidos finalizados", value: 31, icon: "bag", drop: "70,5%" },
  ],
  conversion: "7,4%",
};

export const performanceMetrics = {
  finishedOrders: 24,
  finishedDelta: -14.29,
  revenue: 1176.41,
  revenueDelta: -5.4,
  averageTicket: 49.02,
  ticketDelta: 10.37,
  newCustomers: 18,
  customersDelta: -33.33,
};

export const performanceChart = [
  { label: "30/07", value: 32 },
  { label: "31/07", value: 20 },
  { label: "01/08", value: 27 },
  { label: "02/08", value: 8 },
  { label: "03/08", value: 20 },
  { label: "04/08", value: 17 },
  { label: "05/08", value: 23 },
];

export const couponStats = {
  active: 4,
  uses: 38,
  revenue: 1420.8,
};
