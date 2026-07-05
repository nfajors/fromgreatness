import type { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
  hideFooter?: boolean;
  hideNavbar?: boolean;
}

export default function Layout({ children, hideFooter, hideNavbar }: LayoutProps) {
  return (
    <div className="min-h-[100dvh] bg-baseIndigo">
      {!hideNavbar && <Navbar />}
      <main>{children}</main>
      {!hideFooter && <Footer />}
    </div>
  );
}
