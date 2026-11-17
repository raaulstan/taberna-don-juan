"use client";

import { createContext, useContext, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Download, LogOut, Wifi, WifiOff } from "lucide-react";
import { logout } from "@/features/auth/actions/session";
import type { ActionResult } from "../domain/result";
import { Button } from "@/components/ui/button";

function subscribe(callback: () => void) { window.addEventListener("online", callback); window.addEventListener("offline", callback); return () => { window.removeEventListener("online", callback); window.removeEventListener("offline", callback); }; }
export function useOnline() { return useSyncExternalStore(subscribe, () => navigator.onLine, () => true); }
function subscribeHydration() { return () => {}; }
export function useHydrated() { return useSyncExternalStore(subscribeHydration, () => true, () => false); }
export function useReadyForMutation() { const hydrated = useHydrated(); const online = useOnline(); return hydrated && online; }
type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };
const Runtime = createContext<{ notify: (result: ActionResult) => void }>({ notify: () => {} });
export function useAdminFeedback() { return useContext(Runtime); }

export function AdminRuntime({ children }: { children: ReactNode }) {
  const online = useOnline();
  const hydrated = useHydrated();
  const router = useRouter();
  const [feedback, setFeedback] = useState<ActionResult | null>(null);
  const [install, setInstall] = useState<InstallEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    function prompt(event: Event) { event.preventDefault(); setInstall(event as InstallEvent); }
    function complete() { setInstalled(true); setInstall(null); }
    function restore(event: PageTransitionEvent) { if (event.persisted) window.location.reload(); }
    function visible() { if (document.visibilityState === "visible" && navigator.onLine) router.refresh(); }
    window.addEventListener("beforeinstallprompt", prompt);
    window.addEventListener("appinstalled", complete);
    window.addEventListener("pageshow", restore);
    document.addEventListener("visibilitychange", visible);
    if ("serviceWorker" in navigator && window.isSecureContext) {
      void navigator.serviceWorker.register("/admin/sw.js", { scope: "/admin" }).catch(() => setFeedback({ ok: false, message: "No se ha podido preparar la instalación. Puedes seguir utilizando el panel con conexión." }));
    }
    return () => { window.removeEventListener("beforeinstallprompt", prompt); window.removeEventListener("appinstalled", complete); window.removeEventListener("pageshow", restore); document.removeEventListener("visibilitychange", visible); };
  }, [router]);

  async function signOut() {
    setLeaving(true);
    try {
      const result = await logout();
      if (!result.ok) { setFeedback(result); return; }
      navigator.serviceWorker?.controller?.postMessage({ type: "LOGOUT" });
      // Navegación completa: descarta la caché en memoria de React/Next de esta sesión.
      window.location.replace("/acceso");
    } catch { setFeedback({ ok: false, message: "No se ha podido cerrar la sesión. Comprueba la conexión." }); }
    finally { setLeaving(false); }
  }

  return (
    <Runtime.Provider value={{ notify: setFeedback }}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card px-5 py-3 text-sm sm:px-8">
        <p className="flex items-center gap-2">{online ? <Wifi aria-hidden="true" className="size-4 text-olive" /> : <WifiOff aria-hidden="true" className="size-4 text-destructive" />}{online ? "Con conexión" : "Sin conexión · cambios deshabilitados"}</p>
        <div className="flex flex-wrap items-center gap-2">
          {install && !installed && <Button size="sm" variant="outline" onClick={async () => { try { await install.prompt(); const choice = await install.userChoice; if (choice.outcome === "accepted") setFeedback({ ok: true, message: "El navegador ha aceptado la solicitud de instalación." }); } catch { setFeedback({ ok: false, message: "El navegador no ha podido abrir la instalación." }); } finally { setInstall(null); } }}><Download aria-hidden="true" />Instalar panel</Button>}
          <Button variant="outline" size="sm" disabled={!hydrated || !online || leaving} onClick={() => void signOut()}><LogOut aria-hidden="true" />{leaving ? "Cerrando…" : "Cerrar sesión"}</Button>
        </div>
      </div>
      {!online && <p role="alert" className="border-b border-border bg-secondary p-4 text-center text-sm">Necesitas conexión para guardar cambios, verificar permisos y cerrar sesión. No se confirman operaciones offline.</p>}
      {feedback && <div role={feedback.ok ? "status" : "alert"} className={`mx-5 mt-5 flex items-center justify-between gap-4 rounded-sm border bg-card p-4 text-sm sm:mx-8 ${feedback.ok ? "border-olive" : "border-destructive"}`}><p>{feedback.message}</p><button type="button" aria-label="Cerrar aviso" onClick={() => setFeedback(null)} className="min-h-11 min-w-11">×</button></div>}
      {children}
    </Runtime.Provider>
  );
}
