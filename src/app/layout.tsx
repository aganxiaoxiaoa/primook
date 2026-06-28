import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Primook — Where Ideas Take Shape",
  description: "Primook is a creative studio crafting bold digital experiences through design, motion, and technology.",
  openGraph: {
    title: "Primook — Where Ideas Take Shape",
    description: "A creative studio crafting bold digital experiences.",
    siteName: "Primook",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}