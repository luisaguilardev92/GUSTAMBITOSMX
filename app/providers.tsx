"use client";

import { useEffect } from "react";
import { SessionProvider } from "next-auth/react";

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let refreshing = false;
    let registration: ServiceWorkerRegistration | undefined;
    const reloadAfterUpdate = () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    };
    const checkForUpdate = () => {
      if (document.visibilityState === "visible") void registration?.update();
    };

    navigator.serviceWorker.addEventListener("controllerchange", reloadAfterUpdate);
    void navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" }).then((value) => {
      registration = value;
      void value.update();
      document.addEventListener("visibilitychange", checkForUpdate);
    });

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", reloadAfterUpdate);
      document.removeEventListener("visibilitychange", checkForUpdate);
    };
  }, []);

  return <SessionProvider>{children}</SessionProvider>;
}
