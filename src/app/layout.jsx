import './globals.css';

export const metadata = {
  title: 'StockRoom Admin Dashboard',
  description: 'Next.js 14 Admin Dashboard for Product Management',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
