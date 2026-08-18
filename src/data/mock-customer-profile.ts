export type AddressLabel = "Casa" | "Trabalho" | "Outro";

export type SavedAddress = {
  id: string;
  label: AddressLabel;
  street: string;
  number: string;
  district: string;
  city: string;
  state: string;
  postalCode: string;
  complement?: string;
  reference?: string;
  isDefault: boolean;
};

export type DemoCustomerProfile = {
  id: string;
  storeId: string;
  name: string;
  whatsapp: string;
  whatsappNormalized: string;
  whatsappMasked: string;
  addresses: SavedAddress[];
};

export const DEMO_SESSION_KEY = "mipede_demo_customer_session";

export const DEMO_SESSION_TOKENS = {
  withAddress: "demo_sess_juliana_home",
  withoutAddress: "demo_sess_juliana_noaddr",
} as const;

export const demoCustomerJuliana: DemoCustomerProfile = {
  id: "cust_juliana_lima",
  storeId: "store_pizzaria_imperial",
  name: "Juliana Lima",
  whatsapp: "(11) 98765-4321",
  whatsappNormalized: "+5511987654321",
  whatsappMasked: "(11) 9 ****-4321",
  addresses: [
    {
      id: "addr_casa",
      label: "Casa",
      street: "Rua das Palmeiras",
      number: "123",
      district: "Vila Madalena",
      city: "São Paulo",
      state: "SP",
      postalCode: "05435-030",
      complement: "Apto 12",
      reference: "Em frente ao mercado",
      isDefault: true,
    },
    {
      id: "addr_trabalho",
      label: "Trabalho",
      street: "Rua da Hora",
      number: "45",
      district: "Pinheiros",
      city: "São Paulo",
      state: "SP",
      postalCode: "05422-000",
      isDefault: false,
    },
  ],
};

export function profileFromDemoToken(token: string | null): DemoCustomerProfile | null {
  if (token === DEMO_SESSION_TOKENS.withAddress) {
    return demoCustomerJuliana;
  }
  if (token === DEMO_SESSION_TOKENS.withoutAddress) {
    return { ...demoCustomerJuliana, addresses: [] };
  }
  return null;
}

export function formatAddressLine(address: SavedAddress): string {
  return `${address.street}, ${address.number} — ${address.district}`;
}
