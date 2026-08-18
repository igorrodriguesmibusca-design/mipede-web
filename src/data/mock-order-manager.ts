export type ManagerStatus =
  | "NOVO"
  | "ACEITO"
  | "EM_PREPARO"
  | "PRONTO"
  | "EM_ROTA"
  | "FINALIZADO"
  | "CANCELADO";

export type Fulfillment = "ENTREGA" | "RETIRADA" | "LOCAL";

export type ManagerItem = {
  name: string;
  qty: number;
  extras: string[];
  note?: string;
  unit: number;
};

export type ManagerAddress = {
  street: string;
  number: string;
  neighborhood: string;
  complement?: string;
  reference?: string;
  zip: string;
};

export type StatusEvent = {
  atOffsetMin: number;
  label: string;
  actor: string;
};

export type ManagerOrder = {
  id: string;
  number: string;
  customer: string;
  phone: string;
  receivedOffsetMin: number;
  fulfillment: Fulfillment;
  payment: string;
  changeFor?: number;
  status: ManagerStatus;
  items: ManagerItem[];
  notes?: string;
  address?: ManagerAddress;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  origin: string;
  driverId?: string;
  departedOffsetMin?: number;
  completedOffsetMin?: number;
  cancelReason?: string;
  history: StatusEvent[];
};

export type Driver = {
  id: string;
  name: string;
  phone: string;
  status: "disponivel" | "em_rota";
  deliveries: number;
};

export type QuickProduct = {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  price: number;
  paused: boolean;
};

export type QuickCategory = {
  id: string;
  name: string;
};

export const managerDrivers: Driver[] = [
  { id: "joao", name: "João Pedro", phone: "(11) 98888-1001", status: "disponivel", deliveries: 1 },
  { id: "carlos", name: "Carlos Silva", phone: "(11) 98888-1002", status: "em_rota", deliveries: 2 },
  { id: "marcos", name: "Marcos Santos", phone: "(11) 98888-1003", status: "disponivel", deliveries: 0 },
];

export const quickCategories: QuickCategory[] = [
  { id: "pizzas", name: "Pizzas" },
  { id: "bebidas", name: "Bebidas" },
  { id: "porcoes", name: "Porções" },
  { id: "combos", name: "Combos" },
];

export const quickProducts: QuickProduct[] = [
  { id: "pizza-calabresa", name: "Pizza Calabresa Grande", description: "Calabresa, cebola e orégano.", categoryId: "pizzas", price: 38.9, paused: false },
  { id: "pizza-margherita", name: "Pizza Margherita", description: "Mussarela e manjericão.", categoryId: "pizzas", price: 36.9, paused: false },
  { id: "pizza-portuguesa", name: "Pizza Portuguesa", description: "Presunto, ovos e ervilha.", categoryId: "pizzas", price: 42.9, paused: false },
  { id: "pizza-quatro-queijos", name: "Pizza Quatro Queijos", description: "Mussarela, gorgonzola e catupiry.", categoryId: "pizzas", price: 44.9, paused: false },
  { id: "pizza-frango", name: "Pizza Frango com Catupiry", description: "Frango desfiado e catupiry.", categoryId: "pizzas", price: 41.9, paused: false },
  { id: "refrigerante-2l", name: "Refrigerante Cola 2L", description: "Garrafa 2 litros.", categoryId: "bebidas", price: 12.9, paused: true },
  { id: "suco-laranja", name: "Suco de Laranja 500ml", description: "Natural, gelado.", categoryId: "bebidas", price: 9.9, paused: false },
  { id: "batata-frita", name: "Batata Frita Grande", description: "Porção crocante.", categoryId: "porcoes", price: 19.9, paused: false },
  { id: "combo-familia", name: "Combo Família", description: "Pizza + refri + batata.", categoryId: "combos", price: 74.9, paused: false },
  { id: "combo-duplo", name: "Combo Duplo", description: "Duas pizzas médias.", categoryId: "combos", price: 69.9, paused: false },
];

export const operationalSettings = {
  prepMinutes: 20,
  attentionMinutes: 15,
  lateMinutes: 25,
  autoAccept: false,
  soundVolume: 70,
  visualAlerts: true,
  repeatAlert: true,
  autoPrint: false,
  printCopies: 1,
  printer: "Cozinha - Térmica 80mm",
  requireDriver: true,
  confirmDelivery: true,
  showCustomerPhone: true,
  hours: "18h às 23h",
};

export const daySummary = {
  received: 28,
  completed: 19,
  cancelled: 2,
  revenue: 1486.4,
  ticket: 52.4,
  avgPrep: 18,
  deliveryFees: 62.4,
  last8hCompleted: 14,
  last8hSold: 980.2,
  last8hFees: 38.5,
  last8hTotal: 1018.7,
  last8hTicket: 52.06,
  byType: { entrega: 9, retirada: 4, local: 1 },
};

function money(items: ManagerItem[], fee: number, discount = 0) {
  const subtotal = Number(items.reduce((sum, item) => sum + item.unit * item.qty, 0).toFixed(2));
  return {
    subtotal,
    discount,
    deliveryFee: fee,
    total: Number((subtotal - discount + fee).toFixed(2)),
  };
}

const o1Items = [
  { name: "Pizza Calabresa Grande", qty: 1, extras: ["Borda de catupiry"], unit: 42.9 },
  { name: "Refrigerante Cola 2L", qty: 1, extras: [], unit: 12.9 },
];
const o2Items = [{ name: "Combo Família", qty: 1, extras: [], unit: 74.9 }];
const o3Items = [{ name: "Pizza Margherita", qty: 1, extras: [], unit: 36.9 }];
const o4Items = [{ name: "Pizza Portuguesa", qty: 1, extras: ["Molho Barbecue"], unit: 44.9 }];
const o5Items = [
  { name: "Pizza Quatro Queijos", qty: 1, extras: ["Borda cheddar"], unit: 48.9 },
  { name: "Suco de Laranja 500ml", qty: 2, extras: [], unit: 9.9 },
];
const o6Items = [{ name: "Pizza Frango com Catupiry", qty: 1, extras: [], unit: 41.9 }];
const o7Items = [
  { name: "Pizza Calabresa Grande", qty: 1, extras: [], unit: 38.9 },
  { name: "Batata Frita Grande", qty: 1, extras: [], unit: 19.9 },
];
const o8Items = [{ name: "Combo Duplo", qty: 1, extras: [], unit: 69.9 }];
const o9Items = [{ name: "Pizza Margherita", qty: 2, extras: [], unit: 36.9 }];
const o10Items = [{ name: "Pizza Calabresa Grande", qty: 1, extras: ["Catupiry"], unit: 42.9 }];
const o11Items = [{ name: "Combo Família", qty: 1, extras: [], unit: 74.9 }];
const o12Items = [{ name: "Pizza Portuguesa", qty: 1, extras: [], unit: 42.9 }];
const o13Items = [{ name: "Pizza Quatro Queijos", qty: 1, extras: [], unit: 44.9 }];
const o14Items = [{ name: "Pizza Margherita", qty: 1, extras: ["Molho Barbecue"], unit: 38.9 }];
const o15Items = [{ name: "Pizza Calabresa Grande", qty: 1, extras: [], unit: 38.9 }];
const o16Items = [{ name: "Combo Família", qty: 1, extras: [], unit: 74.9 }];

export const initialManagerOrders: ManagerOrder[] = [
  {
    id: "m-183780",
    number: "#183780",
    customer: "Juliana Lima",
    phone: "(11) 98765-4321",
    receivedOffsetMin: 3,
    fulfillment: "ENTREGA",
    payment: "Dinheiro",
    changeFor: 80,
    status: "NOVO",
    items: o1Items,
    notes: "Sem cebola.",
    address: { street: "Rua das Palmeiras", number: "123", neighborhood: "Vila Madalena", reference: "Em frente ao mercado", zip: "05435-030" },
    ...money(o1Items, 4.85),
    origin: "Instagram",
    history: [{ atOffsetMin: 3, label: "Pedido recebido", actor: "Sistema" }],
  },
  {
    id: "m-183779",
    number: "#183779",
    customer: "Rafael Souza",
    phone: "(11) 96543-2109",
    receivedOffsetMin: 6,
    fulfillment: "ENTREGA",
    payment: "PIX",
    status: "NOVO",
    items: o2Items,
    address: { street: "Rua Augusta", number: "890", neighborhood: "Consolação", zip: "01304-001" },
    ...money(o2Items, 6),
    origin: "WhatsApp",
    history: [{ atOffsetMin: 6, label: "Pedido recebido", actor: "Sistema" }],
  },
  {
    id: "m-183778",
    number: "#183778",
    customer: "Carla Mendes",
    phone: "(11) 95432-1098",
    receivedOffsetMin: 9,
    fulfillment: "RETIRADA",
    payment: "Cartão na entrega",
    status: "NOVO",
    items: o3Items,
    ...money(o3Items, 0),
    origin: "Direto",
    history: [{ atOffsetMin: 9, label: "Pedido recebido", actor: "Sistema" }],
  },
  {
    id: "m-183777",
    number: "#183777",
    customer: "Lucas Ferreira",
    phone: "(11) 94321-0987",
    receivedOffsetMin: 14,
    fulfillment: "ENTREGA",
    payment: "Dinheiro",
    status: "ACEITO",
    items: o4Items,
    address: { street: "Rua das Flores", number: "55", neighborhood: "Vila Mariana", zip: "04110-000" },
    ...money(o4Items, 5),
    origin: "Meta Ads",
    history: [
      { atOffsetMin: 14, label: "Pedido recebido", actor: "Sistema" },
      { atOffsetMin: 13, label: "Pedido aceito", actor: "Operador" },
    ],
  },
  {
    id: "m-183776",
    number: "#183776",
    customer: "Beatriz Cardoso",
    phone: "(11) 91098-7654",
    receivedOffsetMin: 18,
    fulfillment: "RETIRADA",
    payment: "PIX",
    status: "EM_PREPARO",
    items: o5Items,
    notes: "Sucos sem gelo.",
    ...money(o5Items, 0),
    origin: "Instagram",
    history: [
      { atOffsetMin: 18, label: "Pedido recebido", actor: "Sistema" },
      { atOffsetMin: 17, label: "Pedido aceito", actor: "Operador" },
      { atOffsetMin: 16, label: "Produção iniciada", actor: "Operador" },
    ],
  },
  {
    id: "m-183775",
    number: "#183775",
    customer: "Bruno Almeida",
    phone: "(11) 92109-8765",
    receivedOffsetMin: 22,
    fulfillment: "ENTREGA",
    payment: "Dinheiro",
    status: "EM_PREPARO",
    items: o6Items,
    address: { street: "Av. Paulista", number: "1000", neighborhood: "Bela Vista", zip: "01310-100" },
    ...money(o6Items, 5),
    origin: "Direto",
    history: [
      { atOffsetMin: 22, label: "Pedido recebido", actor: "Sistema" },
      { atOffsetMin: 21, label: "Pedido aceito", actor: "Operador" },
      { atOffsetMin: 19, label: "Produção iniciada", actor: "Operador" },
    ],
  },
  {
    id: "m-183774",
    number: "#183774",
    customer: "Amanda Dias",
    phone: "(11) 93210-1111",
    receivedOffsetMin: 28,
    fulfillment: "LOCAL",
    payment: "Cartão na entrega",
    status: "EM_PREPARO",
    items: o7Items,
    ...money(o7Items, 0),
    origin: "Direto",
    history: [
      { atOffsetMin: 28, label: "Pedido recebido", actor: "Sistema" },
      { atOffsetMin: 27, label: "Pedido aceito", actor: "Operador" },
      { atOffsetMin: 25, label: "Produção iniciada", actor: "Operador" },
    ],
  },
  {
    id: "m-183773",
    number: "#183773",
    customer: "Thiago Martins",
    phone: "(11) 90987-2222",
    receivedOffsetMin: 12,
    fulfillment: "ENTREGA",
    payment: "PIX",
    status: "PRONTO",
    items: o8Items,
    address: { street: "Rua Harmonia", number: "210", neighborhood: "Vila Madalena", zip: "05435-000" },
    ...money(o8Items, 5),
    origin: "WhatsApp",
    history: [
      { atOffsetMin: 12, label: "Pedido recebido", actor: "Sistema" },
      { atOffsetMin: 11, label: "Pedido aceito", actor: "Operador" },
      { atOffsetMin: 10, label: "Produção iniciada", actor: "Operador" },
      { atOffsetMin: 2, label: "Pedido pronto", actor: "Operador" },
    ],
  },
  {
    id: "m-183772",
    number: "#183772",
    customer: "Helena Dias",
    phone: "(11) 97777-3333",
    receivedOffsetMin: 16,
    fulfillment: "RETIRADA",
    payment: "Dinheiro",
    status: "PRONTO",
    items: o9Items,
    ...money(o9Items, 0),
    origin: "Instagram",
    history: [
      { atOffsetMin: 16, label: "Pedido recebido", actor: "Sistema" },
      { atOffsetMin: 15, label: "Pedido aceito", actor: "Operador" },
      { atOffsetMin: 14, label: "Produção iniciada", actor: "Operador" },
      { atOffsetMin: 1, label: "Pedido pronto", actor: "Operador" },
    ],
  },
  {
    id: "m-183771",
    number: "#183771",
    customer: "Fernando Rocha",
    phone: "(11) 99876-5432",
    receivedOffsetMin: 34,
    fulfillment: "ENTREGA",
    payment: "Dinheiro",
    status: "EM_ROTA",
    items: o10Items,
    address: { street: "Rua da Hora", number: "123", neighborhood: "Pinheiros", zip: "05422-000" },
    ...money(o10Items, 5),
    origin: "WhatsApp",
    driverId: "carlos",
    departedOffsetMin: 8,
    history: [
      { atOffsetMin: 34, label: "Pedido recebido", actor: "Sistema" },
      { atOffsetMin: 32, label: "Pedido aceito", actor: "Operador" },
      { atOffsetMin: 30, label: "Produção iniciada", actor: "Operador" },
      { atOffsetMin: 12, label: "Pedido pronto", actor: "Operador" },
      { atOffsetMin: 8, label: "Saiu para entrega", actor: "Operador" },
    ],
  },
  {
    id: "m-183770",
    number: "#183770",
    customer: "Ana Martins",
    phone: "(11) 97654-3210",
    receivedOffsetMin: 41,
    fulfillment: "ENTREGA",
    payment: "PIX",
    status: "EM_ROTA",
    items: o11Items,
    address: { street: "Rua Aspicuelta", number: "400", neighborhood: "Vila Madalena", zip: "05433-010" },
    ...money(o11Items, 5),
    origin: "Meta Ads",
    driverId: "carlos",
    departedOffsetMin: 11,
    history: [
      { atOffsetMin: 41, label: "Pedido recebido", actor: "Sistema" },
      { atOffsetMin: 11, label: "Saiu para entrega", actor: "Operador" },
    ],
  },
  {
    id: "m-183738",
    number: "#183738",
    customer: "Gabriel Santos",
    phone: "(11) 98765-1234",
    receivedOffsetMin: 70,
    fulfillment: "ENTREGA",
    payment: "Cartão na entrega",
    status: "FINALIZADO",
    items: o12Items,
    address: { street: "Rua Girassol", number: "88", neighborhood: "Vila Madalena", zip: "05433-000" },
    ...money(o12Items, 5),
    origin: "Direto",
    driverId: "joao",
    completedOffsetMin: 22,
    history: [
      { atOffsetMin: 70, label: "Pedido recebido", actor: "Sistema" },
      { atOffsetMin: 22, label: "Pedido finalizado", actor: "João Pedro" },
    ],
  },
  {
    id: "m-183736",
    number: "#183736",
    customer: "Tatiane B. Lima",
    phone: "(11) 95432-1098",
    receivedOffsetMin: 95,
    fulfillment: "RETIRADA",
    payment: "PIX",
    status: "FINALIZADO",
    items: o13Items,
    ...money(o13Items, 0),
    origin: "Direto",
    completedOffsetMin: 40,
    history: [
      { atOffsetMin: 95, label: "Pedido recebido", actor: "Sistema" },
      { atOffsetMin: 40, label: "Pedido finalizado", actor: "Operador" },
    ],
  },
  {
    id: "m-183734",
    number: "#183734",
    customer: "Pedro Augusto",
    phone: "(11) 92109-8765",
    receivedOffsetMin: 120,
    fulfillment: "LOCAL",
    payment: "Dinheiro",
    status: "FINALIZADO",
    items: o14Items,
    ...money(o14Items, 0),
    origin: "WhatsApp",
    completedOffsetMin: 55,
    history: [
      { atOffsetMin: 120, label: "Pedido recebido", actor: "Sistema" },
      { atOffsetMin: 55, label: "Pedido finalizado", actor: "Operador" },
    ],
  },
  {
    id: "m-183721",
    number: "#183721",
    customer: "Otávio Lima",
    phone: "(11) 90000-1111",
    receivedOffsetMin: 80,
    fulfillment: "ENTREGA",
    payment: "Dinheiro",
    status: "CANCELADO",
    items: o15Items,
    ...money(o15Items, 5),
    origin: "Instagram",
    cancelReason: "Cliente desistiu",
    history: [
      { atOffsetMin: 80, label: "Pedido recebido", actor: "Sistema" },
      { atOffsetMin: 76, label: "Pedido cancelado", actor: "Operador" },
    ],
  },
  {
    id: "m-183718",
    number: "#183718",
    customer: "Marina Lopes",
    phone: "(11) 93333-4444",
    receivedOffsetMin: 110,
    fulfillment: "ENTREGA",
    payment: "PIX",
    status: "CANCELADO",
    items: o16Items,
    ...money(o16Items, 6),
    origin: "Direto",
    cancelReason: "Item esgotado",
    history: [
      { atOffsetMin: 110, label: "Pedido recebido", actor: "Sistema" },
      { atOffsetMin: 104, label: "Pedido cancelado", actor: "Operador" },
    ],
  },
];

export const cancelReasons = [
  "Cliente desistiu",
  "Item esgotado",
  "Fora da área de entrega",
  "Pagamento recusado no local",
  "Duplicidade",
];

export const fulfillmentLabel: Record<Fulfillment, string> = {
  ENTREGA: "Entrega própria",
  RETIRADA: "Retirada",
  LOCAL: "Consumo no local",
};

export const statusLabel: Record<ManagerStatus, string> = {
  NOVO: "Novo",
  ACEITO: "Aceito",
  EM_PREPARO: "Em preparo",
  PRONTO: "Pronto",
  EM_ROTA: "Em rota",
  FINALIZADO: "Finalizado",
  CANCELADO: "Cancelado",
};

export function itemCount(order: ManagerOrder): number {
  return order.items.reduce((sum, item) => sum + item.qty, 0);
}

export function nextStatus(order: ManagerOrder): ManagerStatus | null {
  if (order.status === "NOVO") return "ACEITO";
  if (order.status === "ACEITO") return "EM_PREPARO";
  if (order.status === "EM_PREPARO") return "PRONTO";
  if (order.status === "PRONTO" && order.fulfillment === "ENTREGA") return "EM_ROTA";
  if (order.status === "PRONTO") return "FINALIZADO";
  if (order.status === "EM_ROTA") return "FINALIZADO";
  return null;
}

export function actionLabel(order: ManagerOrder): string | null {
  if (order.status === "NOVO") return "Aceitar";
  if (order.status === "ACEITO") return "Iniciar produção";
  if (order.status === "EM_PREPARO") return "Marcar como pronto";
  if (order.status === "PRONTO" && order.fulfillment === "ENTREGA") return "Enviar para expedição";
  if (order.status === "PRONTO" && order.fulfillment === "RETIRADA") return "Entregue ao cliente";
  if (order.status === "PRONTO") return "Finalizar";
  if (order.status === "EM_ROTA") return "Marcar como entregue";
  return null;
}

export function canCancel(status: ManagerStatus): boolean {
  return status === "NOVO" || status === "ACEITO" || status === "EM_PREPARO";
}

export function delayLevel(minutes: number): "ok" | "warn" | "late" {
  if (minutes > 25) return "late";
  if (minutes > 15) return "warn";
  return "ok";
}
