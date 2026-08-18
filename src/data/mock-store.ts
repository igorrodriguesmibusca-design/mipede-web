export const STORE_SLUG = "pizzaria-imperial";

export const store = {
  slug: STORE_SLUG,
  name: "Pizzaria Imperial",
  brand: "MiPede",
  status: "Aberto" as const,
  hoursLabel: "Seg à Dom: 18h às 23h",
  address: "Rua das Flores, 123 – Vila Mariana, São Paulo – SP",
  addressShort: "Rua das Flores, 123",
  neighborhood: "Vila Mariana",
  city: "São Paulo - SP",
  zip: "04110-000",
  whatsapp: "(11) 98765-4321",
  whatsappDigits: "11987654321",
  minOrder: 30,
  eta: "45–60 min",
  deliveryMode: "Entrega própria",
  instagram: "@pizzariaimperial",
  cardapioUrl: "mipede.com.br/pizzaria-imperial",
} as const;

export const storeHours = [
  { day: "Segunda", hours: "18:00 – 23:00" },
  { day: "Terça", hours: "18:00 – 23:00" },
  { day: "Quarta", hours: "18:00 – 23:00" },
  { day: "Quinta", hours: "18:00 – 23:00" },
  { day: "Sexta", hours: "18:00 – 00:00" },
  { day: "Sábado", hours: "18:00 – 00:00" },
  { day: "Domingo", hours: "18:00 – 23:00" },
] as const;

export const customer = {
  name: "Juliana Lima",
  whatsapp: "(11) 98765-4321",
  whatsappIncomplete: "(11) 98765-432",
  addressLine: "Rua da Hora, 123",
  addressFull: "Rua das Palmeiras, 123",
  neighborhood: "Vila Madalena",
  city: "São Paulo - SP",
  zip: "05435-030",
} as const;

export const deliveryRegions = [
  {
    id: "centro",
    name: "Centro",
    areas: "Centro, Vila Nova, Jardim das Flores",
    fee: 5,
    eta: "30-45 min",
    minOrder: 25,
    active: true,
  },
  {
    id: "norte",
    name: "Zona Norte",
    areas: "Vila Esperança, Jardim Paulista, Santa Clara",
    fee: 7,
    eta: "40-60 min",
    minOrder: 35,
    active: true,
  },
  {
    id: "sul",
    name: "Zona Sul",
    areas: "Jardim América, Vila Formosa, Parque Verde",
    fee: 6,
    eta: "35-55 min",
    minOrder: 30,
    active: true,
  },
] as const;
