import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cartas digitales · Anse Studio",
  description: "Cartas digitales con QR, diseñadas a medida para cada local.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
