"use client";

import { usePathname } from "next/navigation";

import LanguageSwitcher from "@/components/LanguageSwitcher";
import {
  isAdminLoginPath,
  isProtectedAdminPath,
} from "@/lib/admin-routes";

function usesInlineHeader(pathname: string): boolean {
  return pathname === "/home" || pathname.startsWith("/home/");
}

export default function LanguageSwitcherBar() {
  const pathname = usePathname();

  if (
    isAdminLoginPath(pathname) ||
    isProtectedAdminPath(pathname) ||
    usesInlineHeader(pathname)
  ) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[70]">
      <div className="pointer-events-auto">
        <LanguageSwitcher />
      </div>
    </div>
  );
}
