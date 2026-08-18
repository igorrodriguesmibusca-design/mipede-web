export type OrderStatus =
  | "Novo"
  | "Aceito"
  | "Em produção"
  | "Em entrega"
  | "Finalizado"
  | "Cancelado"
  | "Em andamento";

export type OrderItem = {
  name: string;
  quantity: number;
  price: number;
  extras: string[];
  image?: string;
};

export type Order = {
  id: string;
  number: string;
  customer: string;
  phone: string;
  time: string;
  date: string;
  datetime: string;
  delivery: "Entrega própria" | "Retirada no local";
  payment: string;
  paymentDetail: string;
  status: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  total: number;
  items: OrderItem[];
  notes?: string;
  address?: string;
  neighborhood?: string;
  city?: string;
  zip?: string;
  courier?: string;
  vehicle?: string;
  timeline: { time: string; label: string; done: boolean }[];
};

export const orders: Order[] = [
  {
    id: "183747",
    number: "#183747",
    customer: "Juliana Lima",
    phone: "(11) 98765-4321",
    time: "20:39",
    date: "17/08/2025",
    datetime: "17/08/2025 às 20:39",
    delivery: "Entrega própria",
    payment: "Dinheiro",
    paymentDetail: "Dinheiro na entrega",
    status: "Novo",
    subtotal: 50.9,
    deliveryFee: 4.85,
    total: 55.75,
    address: "Rua das Palmeiras, 123",
    neighborhood: "Vila Madalena",
    city: "São Paulo - SP",
    zip: "05435-030",
    notes: "Sem cebola, por favor.",
    items: [
      {
        name: "Pizza Calabresa Grande",
        quantity: 1,
        price: 38.9,
        extras: ["Borda recheada de catupiry"],
        image: "/mock/pizza-calabresa.jpg",
      },
      {
        name: "Refrigerante Cola 2L",
        quantity: 1,
        price: 12.0,
        extras: [],
        image: "/mock/refrigerante.jpg",
      },
    ],
    timeline: [
      { time: "20:39", label: "Pedido realizado", done: true },
      { time: "", label: "Pedido em análise", done: false },
      { time: "", label: "Pedido em produção", done: false },
      { time: "", label: "Pedido saiu para entrega", done: false },
      { time: "", label: "Pedido finalizado", done: false },
    ],
  },
  {
    id: "183746",
    number: "#183746",
    customer: "Rafael Souza",
    phone: "(11) 96543-2109",
    time: "20:35",
    date: "17/08/2025",
    datetime: "17/08/2025 às 20:35",
    delivery: "Entrega própria",
    payment: "Dinheiro",
    paymentDetail: "Pix na entrega",
    status: "Novo",
    subtotal: 62.9,
    deliveryFee: 6.0,
    total: 68.9,
    address: "Rua Augusta, 890",
    items: [
      {
        name: "Combo Família",
        quantity: 1,
        price: 74.9,
        extras: [],
        image: "/mock/combo-familia.jpg",
      },
    ],
    timeline: [
      { time: "20:35", label: "Pedido realizado", done: true },
      { time: "", label: "Pedido em análise", done: false },
      { time: "", label: "Pedido em produção", done: false },
      { time: "", label: "Pedido saiu para entrega", done: false },
      { time: "", label: "Pedido finalizado", done: false },
    ],
  },
  {
    id: "183745",
    number: "#183745",
    customer: "Carla Mendes",
    phone: "(11) 95432-1098",
    time: "20:32",
    date: "17/08/2025",
    datetime: "17/08/2025 às 20:32",
    delivery: "Retirada no local",
    payment: "Dinheiro",
    paymentDetail: "Cartão de débito na entrega",
    status: "Novo",
    subtotal: 37.5,
    deliveryFee: 0,
    total: 37.5,
    items: [
      {
        name: "Pizza Margherita",
        quantity: 1,
        price: 36.9,
        extras: [],
        image: "/mock/pizza-margherita.jpg",
      },
    ],
    timeline: [
      { time: "20:32", label: "Pedido realizado", done: true },
      { time: "", label: "Pedido em análise", done: false },
      { time: "", label: "Pedido em produção", done: false },
      { time: "", label: "Pedido saiu para entrega", done: false },
      { time: "", label: "Pedido finalizado", done: false },
    ],
  },
  {
    id: "183744",
    number: "#183744",
    customer: "Lucas Ferreira",
    phone: "(11) 94321-0987",
    time: "20:28",
    date: "17/08/2025",
    datetime: "17/08/2025 às 20:28",
    delivery: "Entrega própria",
    payment: "Dinheiro",
    paymentDetail: "Dinheiro na entrega",
    status: "Aceito",
    subtotal: 47.4,
    deliveryFee: 5.0,
    total: 52.4,
    items: [
      {
        name: "Pizza Portuguesa",
        quantity: 1,
        price: 42.9,
        extras: ["Molho Barbecue"],
        image: "/mock/pizza-calabresa.jpg",
      },
    ],
    timeline: [
      { time: "20:28", label: "Pedido realizado", done: true },
      { time: "20:29", label: "Pedido em análise", done: true },
      { time: "", label: "Pedido em produção", done: false },
      { time: "", label: "Pedido saiu para entrega", done: false },
      { time: "", label: "Pedido finalizado", done: false },
    ],
  },
  {
    id: "183743",
    number: "#183743",
    customer: "Amanda Dias",
    phone: "(11) 93210-9876",
    time: "20:25",
    date: "17/08/2025",
    datetime: "17/08/2025 às 20:25",
    delivery: "Entrega própria",
    payment: "Dinheiro",
    paymentDetail: "Pix na entrega",
    status: "Aceito",
    subtotal: 79.3,
    deliveryFee: 5.0,
    total: 84.3,
    items: [
      {
        name: "Combo Família",
        quantity: 1,
        price: 74.9,
        extras: [],
        image: "/mock/combo-familia.jpg",
      },
    ],
    timeline: [
      { time: "20:25", label: "Pedido realizado", done: true },
      { time: "20:26", label: "Pedido em análise", done: true },
      { time: "", label: "Pedido em produção", done: false },
      { time: "", label: "Pedido saiu para entrega", done: false },
      { time: "", label: "Pedido finalizado", done: false },
    ],
  },
  {
    id: "183742",
    number: "#183742",
    customer: "Bruno Almeida",
    phone: "(11) 92109-8765",
    time: "20:18",
    date: "17/08/2025",
    datetime: "17/08/2025 às 20:18",
    delivery: "Entrega própria",
    payment: "Dinheiro",
    paymentDetail: "Dinheiro na entrega",
    status: "Em produção",
    subtotal: 36.0,
    deliveryFee: 5.0,
    total: 41.0,
    items: [
      {
        name: "Pizza Margherita",
        quantity: 1,
        price: 36.9,
        extras: [],
        image: "/mock/pizza-margherita.jpg",
      },
    ],
    timeline: [
      { time: "20:18", label: "Pedido realizado", done: true },
      { time: "20:19", label: "Pedido em análise", done: true },
      { time: "20:22", label: "Pedido em produção", done: true },
      { time: "", label: "Pedido saiu para entrega", done: false },
      { time: "", label: "Pedido finalizado", done: false },
    ],
  },
  {
    id: "183741",
    number: "#183741",
    customer: "Beatriz Cardoso",
    phone: "(11) 91098-7654",
    time: "20:12",
    date: "17/08/2025",
    datetime: "17/08/2025 às 20:12",
    delivery: "Entrega própria",
    payment: "Dinheiro",
    paymentDetail: "Cartão de crédito na entrega",
    status: "Em produção",
    subtotal: 67.2,
    deliveryFee: 6.0,
    total: 73.2,
    items: [
      {
        name: "Pizza Quatro Queijos",
        quantity: 1,
        price: 44.9,
        extras: ["Borda cheddar"],
        image: "/mock/pizza-margherita.jpg",
      },
      {
        name: "Batata Frita Grande",
        quantity: 1,
        price: 19.9,
        extras: [],
        image: "/mock/batata-frita.jpg",
      },
    ],
    timeline: [
      { time: "20:12", label: "Pedido realizado", done: true },
      { time: "20:13", label: "Pedido em análise", done: true },
      { time: "20:16", label: "Pedido em produção", done: true },
      { time: "", label: "Pedido saiu para entrega", done: false },
      { time: "", label: "Pedido finalizado", done: false },
    ],
  },
  {
    id: "183740",
    number: "#183740",
    customer: "Thiago Martins",
    phone: "(11) 90987-6543",
    time: "20:05",
    date: "17/08/2025",
    datetime: "17/08/2025 às 20:05",
    delivery: "Retirada no local",
    payment: "Dinheiro",
    paymentDetail: "Pix na entrega",
    status: "Em entrega",
    subtotal: 29.9,
    deliveryFee: 0,
    total: 29.9,
    items: [
      {
        name: "Batata Frita Grande",
        quantity: 1,
        price: 19.9,
        extras: [],
        image: "/mock/batata-frita.jpg",
      },
    ],
    timeline: [
      { time: "20:05", label: "Pedido realizado", done: true },
      { time: "20:06", label: "Pedido em análise", done: true },
      { time: "20:10", label: "Pedido em produção", done: true },
      { time: "20:28", label: "Pedido saiu para entrega", done: true },
      { time: "", label: "Pedido finalizado", done: false },
    ],
  },
  {
    id: "183739",
    number: "#183739",
    customer: "Fernando Rocha",
    phone: "(11) 99876-5432",
    time: "19:58",
    date: "17/08/2025",
    datetime: "17/08/2025 às 19:58",
    delivery: "Entrega própria",
    payment: "Dinheiro",
    paymentDetail: "Dinheiro na entrega",
    status: "Em entrega",
    subtotal: 61.8,
    deliveryFee: 5.0,
    total: 66.8,
    items: [
      {
        name: "Pizza Calabresa Grande",
        quantity: 1,
        price: 38.9,
        extras: [],
        image: "/mock/pizza-calabresa.jpg",
      },
    ],
    timeline: [
      { time: "19:58", label: "Pedido realizado", done: true },
      { time: "19:59", label: "Pedido em análise", done: true },
      { time: "20:05", label: "Pedido em produção", done: true },
      { time: "20:22", label: "Pedido saiu para entrega", done: true },
      { time: "", label: "Pedido finalizado", done: false },
    ],
  },
  {
    id: "183738",
    number: "#183738",
    customer: "Gabriel Santos",
    phone: "(11) 98765-1234",
    time: "19:47",
    date: "17/08/2025",
    datetime: "17/08/2025 às 19:47",
    delivery: "Entrega própria",
    payment: "Dinheiro",
    paymentDetail: "Cartão de débito na entrega",
    status: "Finalizado",
    subtotal: 50.6,
    deliveryFee: 5.0,
    total: 55.6,
    items: [
      {
        name: "Pizza Margherita",
        quantity: 1,
        price: 36.9,
        extras: ["Molho Barbecue"],
        image: "/mock/pizza-margherita.jpg",
      },
    ],
    timeline: [
      { time: "19:47", label: "Pedido realizado", done: true },
      { time: "19:48", label: "Pedido em análise", done: true },
      { time: "19:52", label: "Pedido em produção", done: true },
      { time: "20:10", label: "Pedido saiu para entrega", done: true },
      { time: "20:22", label: "Pedido finalizado", done: true },
    ],
  },
];

export const customerOrders: Order[] = [
  {
    ...orders[0],
    status: "Em andamento",
    total: 34.87,
    items: [
      {
        name: "Pizza Calabresa Grande",
        quantity: 1,
        price: 22.83,
        extras: ["Molho Barbecue"],
        image: "/mock/pizza-calabresa.jpg",
      },
    ],
    courier: "João Pedro da Silva",
    vehicle: "Moto Honda – Placa ABC1D23",
    timeline: [
      { time: "23:04", label: "Pedido realizado", done: true },
      { time: "23:04", label: "Pedido em análise", done: true },
      { time: "23:04", label: "Pedido em produção", done: true },
      { time: "23:24", label: "Pedido saiu para entrega", done: true },
      { time: "", label: "Pedido finalizado", done: false },
    ],
  },
  {
    id: "183720",
    number: "#183720",
    customer: "Juliana Lima",
    phone: "(11) 98765-4321",
    time: "20:39",
    date: "17/08/2025",
    datetime: "17/08/2025 às 20:39",
    delivery: "Entrega própria",
    payment: "Cartão de Débito",
    paymentDetail: "Cartão de Débito - MasterCard",
    status: "Finalizado",
    subtotal: 35.52,
    deliveryFee: 4.0,
    total: 39.52,
    address: "Rua da Hora, 123",
    courier: "João Pedro da Silva",
    vehicle: "Moto Honda – Placa ABC1D23",
    items: [
      {
        name: "Pizza Calabresa Grande",
        quantity: 1,
        price: 22.83,
        extras: ["Molho Barbecue"],
        image: "/mock/pizza-calabresa.jpg",
      },
      {
        name: "Pizza Margherita",
        quantity: 1,
        price: 22.83,
        extras: ["Queijo Cheddar"],
        image: "/mock/pizza-margherita.jpg",
      },
    ],
    timeline: [
      { time: "23:04", label: "Pedido realizado", done: true },
      { time: "23:04", label: "Pedido em análise", done: true },
      { time: "23:04", label: "Pedido em produção", done: true },
      { time: "23:24", label: "Pedido saiu para entrega", done: true },
      { time: "23:36", label: "Pedido finalizado", done: true },
    ],
  },
];

export const cartItems = [
  {
    id: "1",
    productId: "pizza-calabresa",
    name: "Pizza Calabresa Grande",
    price: 38.9,
    quantity: 1,
    image: "/mock/pizza-calabresa.jpg",
    extras: [{ name: "Molho Barbecue", price: 2 }],
  },
  {
    id: "2",
    productId: "pizza-margherita",
    name: "Pizza Margherita",
    price: 36.9,
    quantity: 1,
    image: "/mock/pizza-margherita.jpg",
    extras: [{ name: "Molho Barbecue", price: 2 }],
  },
  {
    id: "3",
    productId: "pizza-calabresa",
    name: "Pizza Calabresa Grande",
    price: 38.9,
    quantity: 1,
    image: "/mock/pizza-calabresa.jpg",
    extras: [
      { name: "Molho Barbecue", price: 2 },
      { name: "Borda Cheddar", price: 4 },
    ],
  },
];

export const cartTotal = 45.75;

export const coupons = [
  {
    id: "frete",
    title: "Frete Grátis",
    code: "FRETEGRATIS",
    type: "Frete grátis",
    validUntil: "20/08/2025",
    minValue: 60,
    exclusive: "Exclusivo para novos clientes",
    status: "Pausado" as const,
    uses: "12 / 200",
    rule: "Mínimo R$ 60",
  },
  {
    id: "desconto10",
    title: "Cupom: DESCONTO10",
    code: "BEMVINDO10",
    type: "10% de desconto",
    validUntil: "31/07/2025",
    minValue: 60,
    exclusive: null,
    status: "Ativo" as const,
    uses: "15 / 100",
    rule: "Novos clientes",
  },
  {
    id: "menos20",
    title: "Cupom: MENOS20",
    code: "MENOS20",
    type: "R$ 20,00 de desconto",
    validUntil: "30/08/2025",
    minValue: 80,
    exclusive: null,
    status: "Ativo" as const,
    uses: "11 / 150",
    rule: "Mínimo R$ 80",
  },
];

export function getOrder(id: string): Order | undefined {
  return [...orders, ...customerOrders].find((order) => order.id === id);
}

export const orderTabs = [
  { id: "novos", label: "Novos", count: 3 },
  { id: "aceitos", label: "Aceitos", count: 4 },
  { id: "producao", label: "Em produção", count: 5 },
  { id: "entrega", label: "Em entrega", count: 2 },
  { id: "finalizados", label: "Finalizados" },
  { id: "cancelados", label: "Cancelados" },
] as const;
