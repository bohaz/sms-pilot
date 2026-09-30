import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Shell } from "@/components/Shell";

export const metadata: Metadata = {
  title: "Vigía SMS · Gestión de seguridad operacional",
  description: "Sistema de gestión de seguridad operacional (SMS) para operadores aéreos venezolanos, alineado con la RAV 5.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body><Shell>{children}</Shell></body>
    </html>
  );
}
