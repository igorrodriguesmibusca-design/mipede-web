"use client";

import { useEffect, useId } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: { sitekey: string; callback: (token: string) => void; "expired-callback"?: () => void },
      ) => string;
    };
  }
}

export function TurnstileField({
  siteKey,
  onToken,
}: {
  siteKey: string | null;
  onToken: (token: string) => void;
}) {
  const elementId = useId().replace(/:/g, "");

  useEffect(() => {
    if (!siteKey) return;
    let cancelled = false;
    let widget: string | null = null;

    function mount() {
      const node = document.getElementById(elementId);
      if (cancelled || !node || !window.turnstile || widget) return;
      widget = window.turnstile.render(node, {
        sitekey: siteKey as string,
        callback: onToken,
        "expired-callback": () => onToken(""),
      });
    }

    const existing = document.querySelector<HTMLScriptElement>("script[data-mipede-turnstile]");
    if (window.turnstile) {
      mount();
      return () => {
        cancelled = true;
      };
    }

    const script = existing ?? document.createElement("script");
    const onLoad = () => mount();
    script.addEventListener("load", onLoad);
    if (!existing) {
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.dataset.mipedeTurnstile = "true";
      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
      script.removeEventListener("load", onLoad);
    };
  }, [elementId, onToken, siteKey]);

  if (!siteKey) {
    return <p className="text-xs text-subtle">A proteção anti-bot ainda não está ligada neste ambiente.</p>;
  }

  return <div id={elementId} className="min-h-16" />;
}
