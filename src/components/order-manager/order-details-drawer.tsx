"use client";

import { Drawer } from "@/components/ui/drawer";
import { fulfillmentLabel, managerDrivers, statusLabel, type ManagerOrder } from "@/data/mock-order-manager";
import { formatCurrency } from "@/lib/utils";

export function OrderDetailsDrawer({
  order,
  onClose,
}: {
  order: ManagerOrder | null;
  onClose: () => void;
}) {
  const driver = order ? managerDrivers.find((item) => item.id === order.driverId) : undefined;

  return (
    <Drawer open={Boolean(order)} onClose={onClose} title={order ? `Pedido ${order.number}` : "Pedido"} className="max-w-xl">
      {order ? (
        <div className="space-y-5 text-sm">
          <section>
            <h3 className="mb-2 font-semibold">Identificação</h3>
            <p>{order.customer} · {order.phone}</p>
            <p className="text-subtle">Status: {statusLabel[order.status]} · Origem: {order.origin}</p>
          </section>
          <section>
            <h3 className="mb-2 font-semibold">Atendimento</h3>
            <p>{fulfillmentLabel[order.fulfillment]}</p>
          </section>
          {order.address ? (
            <section>
              <h3 className="mb-2 font-semibold">Endereço</h3>
              <p>
                {order.address.street}, {order.address.number}
                {order.address.complement ? ` — ${order.address.complement}` : ""}
              </p>
              <p>{order.address.neighborhood} · CEP {order.address.zip}</p>
              {order.address.reference ? <p className="text-subtle">Ref.: {order.address.reference}</p> : null}
              <span className="mt-2 inline-flex text-sm font-semibold text-brand">Abrir no mapa</span>
            </section>
          ) : null}
          <section>
            <h3 className="mb-2 font-semibold">Itens</h3>
            <ul className="space-y-2">
              {order.items.map((item) => (
                <li key={item.name} className="flex justify-between gap-3">
                  <span>
                    {item.qty}x {item.name}
                    {item.extras.length ? <span className="block text-xs text-subtle">{item.extras.join(", ")}</span> : null}
                    {item.note ? <span className="block text-xs text-subtle">{item.note}</span> : null}
                  </span>
                  <span>{formatCurrency(item.unit * item.qty)}</span>
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h3 className="mb-2 font-semibold">Pagamento</h3>
            <p>{order.payment}</p>
            {order.changeFor ? <p className="text-subtle">Troco para {formatCurrency(order.changeFor)}</p> : null}
          </section>
          <section className="space-y-1">
            <p className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></p>
            <p className="flex justify-between"><span>Desconto</span><span>{formatCurrency(order.discount)}</span></p>
            <p className="flex justify-between"><span>Taxa de entrega</span><span>{formatCurrency(order.deliveryFee)}</span></p>
            <p className="flex justify-between font-semibold"><span>Total</span><span>{formatCurrency(order.total)}</span></p>
          </section>
          {driver ? <p>Entregador: {driver.name} · {driver.phone}</p> : null}
          <section>
            <h3 className="mb-2 font-semibold">Histórico</h3>
            <ul className="space-y-1 text-subtle">
              {order.history.map((item) => (
                <li key={`${item.label}-${item.atOffsetMin}`}>
                  há {item.atOffsetMin} min · {item.label} · {item.actor}
                </li>
              ))}
            </ul>
          </section>
        </div>
      ) : null}
    </Drawer>
  );
}
