import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { CommandPalette } from "@/components/ui/CommandPalette";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { StarBackground } from "@/components/ui/StarBackground";
import { SmoothScrollProvider } from "@/components/ui/SmoothScrollProvider";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BuildSpace',
  description: 'Design, build, and scale with elegance.',
};
import { Toaster } from 'sonner';
import { Chatbot } from '@/components/Chatbot';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased selection:bg-accent/30 selection:text-ink`}>
        <SmoothScrollProvider>
          <CustomCursor />
          {children}
          <CommandPalette />
          <Chatbot />
          <Toaster theme="light" position="bottom-right" />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
