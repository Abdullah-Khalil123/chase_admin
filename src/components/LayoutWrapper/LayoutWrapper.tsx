// File: src/components/LayoutWrapper.tsx
"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/partials/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showSidebar = pathname !== "/login";

  return (
    <SidebarProvider>
      {showSidebar && <AppSidebar />}
      <main className="w-full">{children}</main>
      <Toaster />
    </SidebarProvider>
  );
}
