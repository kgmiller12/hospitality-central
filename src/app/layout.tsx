import type { Metadata } from "next";
import { Geist, Playfair_Display } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const serif = Playfair_Display({ variable: "--font-serif-display", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hospitality Central",
  description:
    "The professional network built only for hospitality: connect, follow industry news, and find hotel and restaurant jobs.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${serif.variable} min-h-screen font-sans antialiased`}>
        <Nav />
        <main>{children}</main>
        <footer className="mt-16 border-t border-stone-200 py-8 text-center text-sm text-stone-500">
          © {new Date().getFullYear()} Hospitality Central · Built by Katelyn Miller ·{" "}
          <a href="/about" className="underline">About</a>
        </footer>
      </body>
    </html>
  );
}
