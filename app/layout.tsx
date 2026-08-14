import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Qoty",
  description: "Parse hotel quotes from text or files",
  icons: {
    icon: [
      { url: "/qoty.png", type: "image/png" },
      { url: "/favicon.ico?v=2", type: "image/x-icon" },
    ],
    apple: "/qoty.png",
  },
};

export const viewport: Viewport = {
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} h-full antialiased bg-white text-neutral-900 font-sans`}
      style={{ colorScheme: "light" }}
    >
      <body className="min-h-full flex flex-col bg-white text-neutral-900 font-sans">
        {children}
      </body>
    </html>
  );
}
