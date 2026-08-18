export type KanbanStatus = "Novo" | "Aceito" | "Em produção" | "Pronto" | "Em entrega" | "Finalizado" | "Cancelado";

export type KanbanOrder = {
  id: string;
  number: string;
  customer: string;
  phone: string;
  minutes: number;
  delivery: "Entrega própria" | "Retirada no local" | "Consumo no local";
  payment: string;
  status: KanbanStatus;
  items: { name: string; quantity: number; extras: string[]; image?: string; price: number }[];
  notes?: string;
  address?: string;
  reference?: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  delayed?: boolean;
  origin: string;
  cancelReason?: string;
  time: string;
  duration?: string;
  history: { time: string; label: string }[];
};

export const initialKanbanOrders: KanbanOrder[] = [
  {
    id: "183747",
    number: "#183747",
    customer: "Juliana Lima",
    phone: "(11) 98765-4321",
    minutes: 4,
    delivery: "Entrega própria",
    payment: "Dinheiro",
    status: "Novo",
    items: [
      { name: "Pizza Calabresa Grande", quantity: 1, extras: ["Borda de catupiry"], price: 38.9, image: "/mock/pizza-calabresa.jpg" },
      { name: "Refrigerante Cola 2L", quantity: 1, extras: [], price: 12, image: "/mock/refrigerante.jpg" },
    ],
    notes: "Sem cebola, por favor.",
    address: "Rua das Palmeiras, 123 — Vila Madalena",
    reference: "Próximo ao mercado",
    subtotal: 50.9,
    deliveryFee: 4.85,
    total: 55.75,
    origin: "Instagram",
    time: "20:39",
    history: [{ time: "20:39", label: "Pedido recebido" }],
  },
  {
    id: "183746",
    number: "#183746",
    customer: "Rafael Souza",
    phone: "(11) 96543-2109",
    minutes: 8,
    delivery: "Entrega própria",
    payment: "Pix na entrega",
    status: "Novo",
    items: [{ name: "Combo Família", quantity: 1, extras: [], price: 74.9, image: "/mock/combo-familia.jpg" }],
    address: "Rua Augusta, 890",
    subtotal: 74.9,
    deliveryFee: 6,
    total: 80.9,
    origin: "WhatsApp",
    time: "20:35",
    history: [{ time: "20:35", label: "Pedido recebido" }],
  },
  {
    id: "183745",
    number: "#183745",
    customer: "Carla Mendes",
    phone: "(11) 95432-1098",
    minutes: 11,
    delivery: "Retirada no local",
    payment: "Cartão de débito",
    status: "Novo",
    items: [{ name: "Pizza Margherita", quantity: 1, extras: [], price: 36.9, image: "/mock/pizza-margherita.jpg" }],
    subtotal: 36.9,
    deliveryFee: 0,
    total: 36.9,
    origin: "Direto",
    time: "20:32",
    history: [{ time: "20:32", label: "Pedido recebido" }],
  },
  {
    id: "183744",
    number: "#183744",
    customer: "Lucas Ferreira",
    phone: "(11) 94321-0987",
    minutes: 16,
    delivery: "Entrega própria",
    payment: "Dinheiro",
    status: "Aceito",
    items: [{ name: "Pizza Portuguesa", quantity: 1, extras: ["Molho Barbecue"], price: 42.9, image: "/mock/pizza-calabresa.jpg" }],
    address: "Rua das Flores, 55",
    subtotal: 47.4,
    deliveryFee: 5,
    total: 52.4,
    origin: "Meta Ads",
    time: "20:28",
    history: [
      { time: "20:28", label: "Pedido recebido" },
      { time: "20:29", label: "Pedido aceito" },
    ],
  },
  {
    id: "183742",
    number: "#183742",
    customer: "Bruno Almeida",
    phone: "(11) 92109-8765",
    minutes: 24,
    delivery: "Entrega própria",
    payment: "Dinheiro",
    status: "Em produção",
    items: [{ name: "Pizza Margherita", quantity: 1, extras: [], price: 36.9, image: "/mock/pizza-margherita.jpg" }],
    address: "Av. Paulista, 1000",
    subtotal: 36.9,
    deliveryFee: 5,
    total: 41.9,
    delayed: true,
    origin: "Direto",
    time: "20:18",
    history: [
      { time: "20:18", label: "Pedido recebido" },
      { time: "20:19", label: "Pedido aceito" },
      { time: "20:22", label: "Produção iniciada" },
    ],
  },
  {
    id: "183741",
    number: "#183741",
    customer: "Beatriz Cardoso",
    phone: "(11) 91098-7654",
    minutes: 28,
    delivery: "Retirada no local",
    payment: "Pix na entrega",
    status: "Pronto",
    items: [
      { name: "Pizza Quatro Queijos", quantity: 1, extras: ["Borda cheddar"], price: 44.9, image: "/mock/pizza-margherita.jpg" },
    ],
    subtotal: 48.9,
    deliveryFee: 0,
    total: 48.9,
    origin: "Instagram",
    time: "20:12",
    history: [
      { time: "20:12", label: "Pedido recebido" },
      { time: "20:13", label: "Pedido aceito" },
      { time: "20:16", label: "Produção iniciada" },
      { time: "20:34", label: "Pedido pronto" },
    ],
  },
  {
    id: "183739",
    number: "#183739",
    customer: "Fernando Rocha",
    phone: "(11) 99876-5432",
    minutes: 41,
    delivery: "Entrega própria",
    payment: "Dinheiro",
    status: "Em entrega",
    items: [{ name: "Pizza Calabresa Grande", quantity: 1, extras: [], price: 38.9, image: "/mock/pizza-calabresa.jpg" }],
    address: "Rua Harmonia, 210",
    subtotal: 38.9,
    deliveryFee: 5,
    total: 43.9,
    origin: "WhatsApp",
    time: "19:58",
    history: [
      { time: "19:58", label: "Pedido recebido" },
      { time: "19:59", label: "Pedido aceito" },
      { time: "20:05", label: "Produção iniciada" },
      { time: "20:22", label: "Saiu para entrega" },
    ],
  },
  {
    id: "183738",
    number: "#183738",
    customer: "Gabriel Santos",
    phone: "(11) 98765-1234",
    minutes: 55,
    delivery: "Entrega própria",
    payment: "Cartão de débito",
    status: "Finalizado",
    items: [{ name: "Pizza Margherita", quantity: 1, extras: ["Molho Barbecue"], price: 36.9, image: "/mock/pizza-margherita.jpg" }],
    address: "Rua da Hora, 123",
    subtotal: 38.9,
    deliveryFee: 5,
    total: 43.9,
    origin: "Direto",
    time: "19:47",
    duration: "35 min",
    history: [
      { time: "19:47", label: "Pedido recebido" },
      { time: "20:22", label: "Pedido finalizado" },
    ],
  },
  {
    id: "183721",
    number: "#183721",
    customer: "Otávio Lima",
    phone: "(11) 90000-1111",
    minutes: 80,
    delivery: "Entrega própria",
    payment: "Dinheiro",
    status: "Cancelado",
    items: [{ name: "Pizza Calabresa Grande", quantity: 1, extras: [], price: 38.9 }],
    subtotal: 38.9,
    deliveryFee: 5,
    total: 43.9,
    origin: "Instagram",
    time: "19:27",
    cancelReason: "Cliente desistiu",
    history: [
      { time: "19:27", label: "Pedido recebido" },
      { time: "19:31", label: "Pedido cancelado" },
    ],
  },
];

export const kanbanColumns: { id: KanbanStatus; label: string; tone: string }[] = [
  { id: "Novo", label: "Novos", tone: "bg-amber-50 text-amber-700" },
  { id: "Aceito", label: "Aceitos", tone: "bg-sky-50 text-sky-700" },
  { id: "Em produção", label: "Em produção", tone: "bg-orange-50 text-orange-700" },
  { id: "Pronto", label: "Prontos", tone: "bg-emerald-50 text-emerald-700" },
  { id: "Em entrega", label: "Em entrega", tone: "bg-violet-50 text-violet-700" },
];
