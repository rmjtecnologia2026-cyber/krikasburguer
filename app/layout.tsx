import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Krikas Burguer",
  description: "O melhor lanche da cidade!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geist.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-orange-50 via-white to-red-50`}
      >
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
