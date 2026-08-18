"use client";

import { useOrderManager } from "@/components/order-manager/order-manager-provider";
import { Switch } from "@/components/ui/switch";

export default function ManagerSettingsPage() {
  const { settings, setSettings, soundOn, toggleSound, storeOpen, toggleStore, setPaused, paused, pauseReason, setConnection, setToast } =
    useOrderManager();

  function testSound() {
    toggleSound();
    if (!soundOn) {
      setToast("Som de demonstração ativado.");
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Configurações operacionais</h1>
        <p className="text-sm text-subtle">Ajustes demonstrativos. Nada persiste após recarregar.</p>
      </div>

      <Section title="Notificações">
        <Row label="Som de novo pedido">
          <Switch checked={soundOn} aria-label="Som de novo pedido" onClick={toggleSound} />
        </Row>
        <label>
          <span className="mb-1 block text-sm">Volume demonstrativo</span>
          <input
            type="range"
            min={0}
            max={100}
            value={settings.soundVolume}
            onChange={(event) => setSettings({ ...settings, soundVolume: Number(event.target.value) })}
          />
        </label>
        <button type="button" onClick={testSound} className="h-10 rounded-xl border px-4 text-sm">
          Testar som
        </button>
        <Row label="Notificações visuais">
          <Switch
            checked={settings.visualAlerts}
            aria-label="Notificações visuais"
            onClick={() => setSettings({ ...settings, visualAlerts: !settings.visualAlerts })}
          />
        </Row>
        <Row label="Repetir alerta enquanto não aceitar">
          <Switch
            checked={settings.repeatAlert}
            aria-label="Repetir alerta"
            onClick={() => setSettings({ ...settings, repeatAlert: !settings.repeatAlert })}
          />
        </Row>
      </Section>

      <Section title="Produção">
        <Field
          label="Tempo padrão de preparo (min)"
          value={String(settings.prepMinutes)}
          onChange={(value) => setSettings({ ...settings, prepMinutes: Number(value) })}
        />
        <Field
          label="Limite de atenção (min)"
          value={String(settings.attentionMinutes)}
          onChange={(value) => setSettings({ ...settings, attentionMinutes: Number(value) })}
        />
        <Field
          label="Limite de atraso (min)"
          value={String(settings.lateMinutes)}
          onChange={(value) => setSettings({ ...settings, lateMinutes: Number(value) })}
        />
        <Row label="Aceite automático (visual)">
          <Switch
            checked={settings.autoAccept}
            aria-label="Aceite automático"
            onClick={() => setSettings({ ...settings, autoAccept: !settings.autoAccept })}
          />
        </Row>
      </Section>

      <Section title="Impressão">
        <Row label="Impressão automática">
          <Switch
            checked={settings.autoPrint}
            aria-label="Impressão automática"
            onClick={() => setSettings({ ...settings, autoPrint: !settings.autoPrint })}
          />
        </Row>
        <Field
          label="Quantidade de vias"
          value={String(settings.printCopies)}
          onChange={(value) => setSettings({ ...settings, printCopies: Number(value) })}
        />
        <p className="text-sm">Impressora: {settings.printer}</p>
        <button
          type="button"
          onClick={() => setToast("Teste de impressão enviado (demonstração).")}
          className="h-10 rounded-xl border px-4 text-sm"
        >
          Testar impressão
        </button>
      </Section>

      <Section title="Expedição">
        <Row label="Exigir entregador antes de iniciar rota">
          <Switch
            checked={settings.requireDriver}
            aria-label="Exigir entregador"
            onClick={() => setSettings({ ...settings, requireDriver: !settings.requireDriver })}
          />
        </Row>
        <Row label="Solicitar confirmação de entrega">
          <Switch
            checked={settings.confirmDelivery}
            aria-label="Confirmar entrega"
            onClick={() => setSettings({ ...settings, confirmDelivery: !settings.confirmDelivery })}
          />
        </Row>
        <Row label="Mostrar telefone do cliente">
          <Switch
            checked={settings.showCustomerPhone}
            aria-label="Mostrar telefone"
            onClick={() => setSettings({ ...settings, showCustomerPhone: !settings.showCustomerPhone })}
          />
        </Row>
      </Section>

      <Section title="Loja">
        <Row label="Abrir ou fechar loja">
          <Switch checked={storeOpen} aria-label="Loja aberta" onClick={toggleStore} />
        </Row>
        <p className="text-sm">Horário de funcionamento: {settings.hours}</p>
        <Row label="Pausa temporária">
          <Switch checked={paused} aria-label="Pausa temporária" onClick={() => setPaused(!paused, paused ? "" : "Equipe reduzida")} />
        </Row>
        {paused ? <p className="text-sm">Motivo: {pauseReason || "Equipe reduzida"}</p> : null}
      </Section>

      <Section title="Demonstração de conexão">
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setConnection("connected")} className="h-9 rounded-lg border px-3 text-sm">
            Conectado
          </button>
          <button type="button" onClick={() => setConnection("reconnecting")} className="h-9 rounded-lg border px-3 text-sm">
            Reconectando
          </button>
          <button type="button" onClick={() => setConnection("offline")} className="h-9 rounded-lg border px-3 text-sm">
            Sem conexão
          </button>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4">
      <h2 className="font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm">{label}</span>
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full max-w-xs rounded-xl border px-3 text-sm"
      />
    </label>
  );
}
