import type { Metadata } from 'next';
import './globals.css';

import Navbar from '../components/navbar';
import Footer from '../components/footer';
import RouteBreadcrumbs from '../components/navigation/RouteBreadcrumbs';
import { AuthProvider } from '../hooks/useAuth';

export const metadata: Metadata = {
  title: 'SustainX — Students, Society & Earth',
  description:
    'Learn. Act. Connect. Create Impact. A student-driven SDG platform for education, community and environmental action.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
		<AuthProvider>
			<Navbar />
			<RouteBreadcrumbs />

        	<main>{children}</main>

        	<Footer />
		</AuthProvider>
      </body>
    </html>
  );
}
