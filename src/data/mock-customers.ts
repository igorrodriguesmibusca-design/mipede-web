export type CustomerOrigin = "Instagram orgânico" | "Meta Ads" | "WhatsApp" | "Direto";

export type StoreCustomer = {
  id: string;
  name: string;
  initials: string;
  phone: string;
  orders: number;
  spent: number;
  origin: CustomerOrigin;
  lastPurchase: string;
  tone: "rose" | "green" | "blue" | "slate" | "amber";
};

export const customers: StoreCustomer[] = [
  {
    id: "1",
    name: "Lucas Almeida",
    initials: "LA",
    phone: "(11) 98765-4321",
    orders: 14,
    spent: 734.5,
    origin: "Instagram orgânico",
    lastPurchase: "05/05/2025 às 20:18",
    tone: "rose",
  },
  {
    id: "2",
    name: "Ana Martins",
    initials: "AM",
    phone: "(11) 97654-3210",
    orders: 9,
    spent: 468.9,
    origin: "Meta Ads",
    lastPurchase: "04/05/2025 às 19:45",
    tone: "green",
  },
  {
    id: "3",
    name: "Rafael Souza",
    initials: "RS",
    phone: "(11) 96543-2109",
    orders: 7,
    spent: 329.7,
    origin: "WhatsApp",
    lastPurchase: "03/05/2025 às 21:03",
    tone: "blue",
  },
  {
    id: "4",
    name: "Tatiane B. Lima",
    initials: "TB",
    phone: "(11) 95432-1098",
    orders: 12,
    spent: 612.3,
    origin: "Direto",
    lastPurchase: "03/05/2025 às 18:22",
    tone: "slate",
  },
  {
    id: "5",
    name: "Matheus Ferreira",
    initials: "MF",
    phone: "(11) 94321-0987",
    orders: 5,
    spent: 210.0,
    origin: "Meta Ads",
    lastPurchase: "02/05/2025 às 20:07",
    tone: "blue",
  },
  {
    id: "6",
    name: "Juliana Costa",
    initials: "JC",
    phone: "(11) 93210-9876",
    orders: 11,
    spent: 558.4,
    origin: "Instagram orgânico",
    lastPurchase: "02/05/2025 às 19:11",
    tone: "rose",
  },
  {
    id: "7",
    name: "Pedro Augusto",
    initials: "PA",
    phone: "(11) 92109-8765",
    orders: 8,
    spent: 402.8,
    origin: "WhatsApp",
    lastPurchase: "01/05/2025 às 20:33",
    tone: "amber",
  },
  {
    id: "8",
    name: "Beatriz Santos",
    initials: "BS",
    phone: "(11) 91098-7654",
    orders: 6,
    spent: 275.6,
    origin: "Direto",
    lastPurchase: "30/04/2025 às 18:49",
    tone: "amber",
  },
];

export const customerStats = {
  total: 428,
  newCustomers: 32,
  recurring: 116,
  averageTicket: 52.4,
};
