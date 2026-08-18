import { Card } from "@/components/ui/card";
import { formatAddressLine, type DemoCustomerProfile } from "@/data/mock-customer-profile";

export function ReturningCustomerCard({
  profile,
  onContinue,
  onChangeData,
  onChangeAddress,
  onAddAddress,
  onNotMe,
}: {
  profile: DemoCustomerProfile;
  onContinue: () => void;
  onChangeData: () => void;
  onChangeAddress?: () => void;
  onAddAddress?: () => void;
  onNotMe: () => void;
}) {
  const lastAddress = profile.addresses.find((item) => item.isDefault) ?? profile.addresses[0];

  return (
    <Card className="p-5">
      <p className="text-sm font-semibold text-brand">Encontramos seus dados neste dispositivo</p>
      <p className="mt-3 text-lg font-semibold">{profile.name}</p>
      <p className="text-sm text-subtle">{profile.whatsappMasked}</p>
      {lastAddress ? (
        <p className="mt-2 text-sm">
          <span className="font-medium">{lastAddress.label}: </span>
          {formatAddressLine(lastAddress)}
        </p>
      ) : (
        <p className="mt-2 text-sm text-subtle">Nenhum endereço salvo neste dispositivo.</p>
      )}

      <div className="mt-5 flex flex-col gap-2">
        <button
          type="button"
          onClick={onContinue}
          className="flex h-12 items-center justify-center rounded-xl bg-brand text-sm font-semibold text-white"
        >
          Continuar com estes dados
        </button>
        <button
          type="button"
          onClick={onChangeData}
          className="flex h-11 items-center justify-center rounded-xl border border-brand text-sm font-semibold text-brand"
        >
          Trocar dados
        </button>
        {lastAddress && onChangeAddress ? (
          <button type="button" onClick={onChangeAddress} className="h-11 text-sm font-semibold text-brand">
            Trocar endereço
          </button>
        ) : null}
        {onAddAddress ? (
          <button type="button" onClick={onAddAddress} className="h-11 text-sm font-semibold text-brand">
            Adicionar endereço
          </button>
        ) : null}
        <button type="button" onClick={onNotMe} className="h-10 text-sm text-subtle underline">
          Não sou eu
        </button>
      </div>
    </Card>
  );
}
