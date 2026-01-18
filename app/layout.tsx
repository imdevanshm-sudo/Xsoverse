import type { Metadata } from "next";
import localFont from "next/font/local";
import { Libre_Baskerville } from "next/font/google";
import "./globals.css";
import FooterReveal from "./FooterReveal";
import FirebaseAnalytics from "./FirebaseAnalytics";

const inter = localFont({
  src: [
    {
      path: "../public/fonts/inter/InterVariable.woff2",
      weight: "100 900",
      style: "normal",
    },
    {
      path: "../public/fonts/inter/InterVariable-Italic.woff2",
      weight: "100 900",
      style: "italic",
    },
  ],
  variable: "--font-inter",
  display: "optional",
});

const libre = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "optional",
});

export const metadata: Metadata = {
  title: 'Exsoverse',
  description: 'Exsoverse',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${libre.variable}`}>
      <body className="min-h-screen bg-white text-[#111111]">
        <FirebaseAnalytics />
        <div className="flex min-h-screen flex-col">
          <main className="flex-grow">{children}</main>
          <FooterReveal />
        </div>
      </body>
    </html>
  );
}
