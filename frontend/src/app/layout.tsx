import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import Link from 'next/link';
import { Leaf, Package, ShoppingBag, LayoutDashboard } from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Green-Chain | Circular E-Waste Marketplace',
  description: 'Transform e-waste into value. Sustainable recycling platform for households and repair shops.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={jakarta.className}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            {/* Modern Navbar */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100 shadow-sm">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                  {/* Logo */}
                  <Link href="/" className="flex items-center gap-2 group">
                    <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg group-hover:shadow-xl transition-all">
                      <Leaf className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <span className="text-xl font-bold gradient-text">Green-Chain</span>
                      <p className="text-xs text-gray-500">Circular Economy</p>
                    </div>
                  </Link>
                  
                  {/* Navigation Links */}
                  <div className="flex items-center gap-1">
                    <Link 
                      href="/" 
                      className="px-4 py-2 rounded-lg text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all flex items-center gap-2"
                    >
                      <Package className="h-4 w-4" />
                      <span>Marketplace</span>
                    </Link>
                    <Link 
                      href="/admin" 
                      className="px-4 py-2 rounded-lg text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all flex items-center gap-2"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Admin</span>
                    </Link>
                    <button className="ml-2 px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:shadow-lg transition-all hover:-translate-y-0.5 flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4" />
                      <span>Join Waitlist</span>
                    </button>
                  </div>
                </div>
              </div>
            </nav>
            
            {/* Main Content */}
            <main className="flex-1">
              {children}
            </main>
            
            {/* Modern Footer */}
            <footer className="bg-slate-900 text-white mt-auto">
              <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Leaf className="h-6 w-6 text-emerald-400" />
                      <span className="text-xl font-bold">Green-Chain</span>
                    </div>
                    <p className="text-gray-400 text-sm">
                      Building a sustainable future through circular e-waste management.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Platform</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li><a href="#" className="hover:text-emerald-400 transition">Marketplace</a></li>
                      <li><a href="#" className="hover:text-emerald-400 transition">For Households</a></li>
                      <li><a href="#" className="hover:text-emerald-400 transition">For Repair Shops</a></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Company</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li><a href="#" className="hover:text-emerald-400 transition">About Us</a></li>
                      <li><a href="#" className="hover:text-emerald-400 transition">Sustainability</a></li>
                      <li><a href="#" className="hover:text-emerald-400 transition">Contact</a></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Impact</h4>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-emerald-400">500+ kg</div>
                      <p className="text-xs text-gray-400">E-waste diverted from landfills</p>
                      <div className="text-2xl font-bold text-emerald-400">1,234+</div>
                      <p className="text-xs text-gray-400">Devices recycled</p>
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
                  © 2024 Green-Chain. All rights reserved. Circular Economy Initiative.
                </div>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}