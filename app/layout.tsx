import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { CommandPalette } from "@/components/ui/CommandPalette";
import { StarBackground } from "@/components/ui/StarBackground";
import { SmoothScrollProvider } from "@/components/ui/SmoothScrollProvider";
import { PageTransitionProvider } from "@/components/ui/PageTransitionProvider";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap'
});
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'BuildSpace',
  description: 'Design, build, and scale with elegance.',
  openGraph: {
    title: 'BuildSpace',
    description: 'Design, build, and scale with elegance.',
    siteName: 'BuildSpace',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BuildSpace',
    description: 'Design, build, and scale with elegance.',
  },
};
import { Toaster } from 'sonner';
import { Chatbot } from '@/components/Chatbot';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className={`font-sans antialiased selection:bg-accent/30 selection:text-ink`}>
        <SmoothScrollProvider>
          <PageTransitionProvider>
            {children}
            <CommandPalette />
            <Chatbot />
            <Toaster theme="light" position="bottom-right" />
          </PageTransitionProvider>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
