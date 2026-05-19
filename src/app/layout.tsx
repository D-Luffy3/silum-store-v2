import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { NewsletterModal } from "@/components/NewsletterModal";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({ 
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "SILUM | Architectural Apparel & Luxury Minimalist Streetwear",
  description: "High-contrast visual luxury and architectural garments. Explore our capsule collections, limited arrivals, and signature products.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
      <body className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white transition-colors duration-300 antialiased min-h-screen flex flex-col font-sans selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-black">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <AuthProvider>
            <CartProvider>
              <Navbar />
              <main className="flex-grow">
                {children}
              </main>
              <Footer />
              <WhatsAppButton />
              <NewsletterModal />
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
