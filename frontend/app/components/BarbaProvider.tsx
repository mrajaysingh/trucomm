"use client";

import { useEffect } from "react";
import { gsap } from "gsap";

export default function BarbaProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let barbaInstance: any = null;
    let destroyed = false;

    const init = async () => {
      try {
        const mod = await import("@barba/core").catch(() => null);
        if (!mod || destroyed) return;
        const barba = mod.default || (mod as any);
        barba.init({
          transitions: [
            {
              name: "opacity-transition",
              leave(data: any) {
                return gsap.to(data.current.container, { opacity: 0, duration: 0.25, ease: "power2.out" });
              },
              enter(data: any) {
                return gsap.from(data.next.container, { opacity: 0, duration: 0.35, ease: "power2.out" });
              },
            },
          ],
        });
        barbaInstance = barba;
      } catch {
        // ignore if module unavailable
      }
    };

    init();

    return () => {
      destroyed = true;
      try {
        if (barbaInstance) {
          barbaInstance.destroy();
        }
      } catch {}
    };
  }, []);

  return <>{children}</>;
}


