"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import {
  actionLabel,
  canCancel,
  delayLevel,
  initialManagerOrders,
  managerDrivers,
  nextStatus,
  operationalSettings,
  quickProducts,
  type Driver,
  type ManagerOrder,
  type ManagerStatus,
  type QuickProduct,
} from "@/data/mock-order-manager";

export type ConnectionState = "connected" | "reconnecting" | "offline";

type Settings = typeof operationalSettings;

type ManagerContextValue = {
  orders: ManagerOrder[];
  drivers: Driver[];
  products: QuickProduct[];
  storeOpen: boolean;
  paused: boolean;
  pauseReason: string;
  soundOn: boolean;
  soundUnlocked: boolean;
  connection: ConnectionState;
  lastSync: Date;
  now: number;
  settings: Settings;
  toast: string | null;
  tickMinutes: (order: ManagerOrder) => number;
  setToast: (value: string | null) => void;
  toggleStore: () => void;
  setPaused: (value: boolean, reason?: string) => void;
  toggleSound: () => void;
  unlockSound: () => void;
  setConnection: (value: ConnectionState) => void;
  setSettings: (value: Settings) => void;
  simulateOrder: () => void;
  advance: (id: string) => void;
  cancel: (id: string, reason: string) => void;
  assignDriver: (orderId: string, driverId: string) => void;
  markOut: (orderId: string) => void;
  toggleProduct: (id: string) => void;
  toggleCategory: (categoryId: string, paused: boolean) => void;
  pausedCount: number;
};

const ManagerContext = createContext<ManagerContextValue | null>(null);

function beep() {
  const AudioCtx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return;
  const ctx = new AudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = 880;
  gain.gain.value = 0.05;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.18);
}

export function OrderManagerProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState(initialManagerOrders);
  const [drivers] = useState(managerDrivers);
  const [products, setProducts] = useState(quickProducts);
  const [storeOpen, setStoreOpen] = useState(true);
  const [paused, setPausedState] = useState(false);
  const [pauseReason, setPauseReason] = useState("");
  const [soundOn, setSoundOn] = useState(false);
  const [soundUnlocked, setSoundUnlocked] = useState(false);
  const [connection, setConnection] = useState<ConnectionState>("connected");
  const [lastSync, setLastSync] = useState(() => new Date());
  const [now, setNow] = useState(() => Date.now());
  const [settings, setSettings] = useState(operationalSettings);
  const [toast, setToast] = useState<string | null>(null);
  const [seq, setSeq] = useState(183781);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
      setLastSync(new Date());
    }, 60000);
    return () => window.clearInterval(timer);
  }, []);

  const tickMinutes = useCallback(
    (order: ManagerOrder) => order.receivedOffsetMin,
    [],
  );

  const unlockSound = useCallback(() => setSoundUnlocked(true), []);

  const simulateOrder = useCallback(() => {
    setSoundUnlocked(true);
    const id = `m-${seq}`;
    const number = `#${seq}`;
    setSeq((value) => value + 1);
    const created: ManagerOrder = {
      id,
      number,
      customer: "Cliente demonstração",
      phone: "(11) 90000-0000",
      receivedOffsetMin: 0,
      fulfillment: "ENTREGA",
      payment: "PIX",
      status: "NOVO",
      items: [{ name: "Pizza Calabresa Grande", qty: 1, extras: [], unit: 38.9 }],
      address: {
        street: "Rua Demonstração",
        number: "10",
        neighborhood: "Centro",
        zip: "01000-000",
      },
      subtotal: 38.9,
      discount: 0,
      deliveryFee: 5,
      total: 43.9,
      origin: "Simulação",
      history: [{ atOffsetMin: 0, label: "Pedido recebido", actor: "Simulador" }],
    };
    setOrders((current) => [created, ...current]);
    setToast("Novo pedido simulado.");
    if (soundOn) {
      try {
        beep();
      } catch {
        /* ignore autoplay limits */
      }
    }
  }, [seq, soundOn]);

  const advance = useCallback((id: string) => {
    setOrders((current) =>
      current.map((order) => {
        if (order.id !== id) return order;
        const next = nextStatus(order);
        if (!next) return order;
        return {
          ...order,
          status: next,
          completedOffsetMin: next === "FINALIZADO" ? 0 : order.completedOffsetMin,
          history: [...order.history, { atOffsetMin: 0, label: actionLabel(order) ?? next, actor: "Operador" }],
        };
      }),
    );
  }, []);

  const cancel = useCallback((id: string, reason: string) => {
    setOrders((current) =>
      current.map((order) =>
        order.id === id && canCancel(order.status)
          ? {
              ...order,
              status: "CANCELADO" as ManagerStatus,
              cancelReason: reason,
              history: [...order.history, { atOffsetMin: 0, label: "Pedido cancelado", actor: "Operador" }],
            }
          : order,
      ),
    );
    setToast("Pedido cancelado.");
  }, []);

  const assignDriver = useCallback((orderId: string, driverId: string) => {
    setOrders((current) =>
      current.map((order) => (order.id === orderId ? { ...order, driverId } : order)),
    );
    setToast("Entregador selecionado.");
  }, []);

  const markOut = useCallback((orderId: string) => {
    setOrders((current) =>
      current.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: "EM_ROTA" as ManagerStatus,
              departedOffsetMin: 0,
              history: [...order.history, { atOffsetMin: 0, label: "Saiu para entrega", actor: "Operador" }],
            }
          : order,
      ),
    );
  }, []);

  const toggleProduct = useCallback((id: string) => {
    setProducts((current) =>
      current.map((item) => (item.id === id ? { ...item, paused: !item.paused } : item)),
    );
  }, []);

  const toggleCategory = useCallback((categoryId: string, nextPaused: boolean) => {
    setProducts((current) =>
      current.map((item) => (item.categoryId === categoryId ? { ...item, paused: nextPaused } : item)),
    );
  }, []);

  const pausedCount = products.filter((item) => item.paused).length;

  const value = useMemo<ManagerContextValue>(
    () => ({
      orders,
      drivers,
      products,
      storeOpen,
      paused,
      pauseReason,
      soundOn,
      soundUnlocked,
      connection,
      lastSync,
      now,
      settings,
      toast,
      tickMinutes,
      setToast,
      toggleStore: () => setStoreOpen((value) => !value),
      setPaused: (value, reason) => {
        setPausedState(value);
        setPauseReason(reason ?? "");
      },
      toggleSound: () => {
        setSoundUnlocked(true);
        setSoundOn((value) => !value);
      },
      unlockSound,
      setConnection,
      setSettings,
      simulateOrder,
      advance,
      cancel,
      assignDriver,
      markOut,
      toggleProduct,
      toggleCategory,
      pausedCount,
    }),
    [
      orders,
      drivers,
      products,
      storeOpen,
      paused,
      pauseReason,
      soundOn,
      soundUnlocked,
      connection,
      lastSync,
      now,
      settings,
      toast,
      tickMinutes,
      unlockSound,
      simulateOrder,
      advance,
      cancel,
      assignDriver,
      markOut,
      toggleProduct,
      toggleCategory,
      pausedCount,
    ],
  );

  return <ManagerContext.Provider value={value}>{children}</ManagerContext.Provider>;
}

export function useOrderManager() {
  const value = useContext(ManagerContext);
  if (!value) {
    throw new Error("useOrderManager must be used inside OrderManagerProvider");
  }
  return value;
}

export { actionLabel, delayLevel };
