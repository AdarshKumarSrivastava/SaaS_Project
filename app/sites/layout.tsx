import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Site Management | BuildSpace',
  robots: {
    index: false,
    follow: false,
  },
};

export default function SitesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
