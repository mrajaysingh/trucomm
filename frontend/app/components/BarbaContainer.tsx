"use client";

import { usePathname } from "next/navigation";

export default function BarbaContainer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  // create a simple namespace from path, e.g., "/signin" => "signin", "/" => "home"
  const ns = pathname === "/" ? "home" : pathname.replace(/\W+/g, "-").replace(/^-+|-+$/g, "");
  return (
    <div data-barba-namespace={ns}>
      {children}
    </div>
  );
}


