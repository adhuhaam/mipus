"use client";

import { useEffect } from "react";

const SW_URL = "/sw.js";

export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }
    if (process.env.NODE_ENV !== "production") return;

    const onError = (event: ErrorEvent) => {
      const msg = String(event.message ?? "");
      const isChunk =
        event.error?.name === "ChunkLoadError" ||
        msg.includes("Loading chunk") ||
        msg.includes("ChunkLoadError");
      if (!isChunk || sessionStorage.getItem("xpat-chunk-reload")) return;
      sessionStorage.setItem("xpat-chunk-reload", "1");
      void navigator.serviceWorker.getRegistrations().then((regs) => {
        for (const reg of regs) void reg.unregister();
        window.location.reload();
      });
    };
    window.addEventListener("error", onError);

    let reloaded = false;
    const onControllerChange = () => {
      if (reloaded) return;
      reloaded = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      onControllerChange,
    );

    navigator.serviceWorker
      .register(SW_URL, { updateViaCache: "none" })
      .then((reg) => reg.update())
      .catch(() => {});

    return () => {
      window.removeEventListener("error", onError);
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        onControllerChange,
      );
    };
  }, []);

  return null;
}
