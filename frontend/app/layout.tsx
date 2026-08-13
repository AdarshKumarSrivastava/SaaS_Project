import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { CommandPalette } from "@/components/ui/CommandPalette";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { StarBackground } from "@/components/ui/StarBackground";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BuildSpace',
  description: 'Design, build, and scale with elegance.',
};
import { Toaster } from 'sonner';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased selection:bg-blue-500/30 selection:text-blue-200`}>
        <StarBackground />
        <CustomCursor />
        {children}
        <CommandPalette />
        <Toaster theme="dark" position="bottom-right" />
      </body>
    </html>
  );
}
