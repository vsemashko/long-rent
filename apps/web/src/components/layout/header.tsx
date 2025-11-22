'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Home, Menu, Plus, Building2, Heart, User, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';

export function Header() {
  const router = useRouter();
  const { isAuthenticated, user, clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    router.push('/');
  };

  const isLandlord = user?.role === 'LANDLORD' || user?.role === 'BOTH';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <Home className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            HomeMore
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link
            href="/search"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Search
          </Link>
          {isAuthenticated && (
            <Link
              href="/favorites"
              className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center"
            >
              <Heart className="h-4 w-4 mr-1" />
              Favorites
            </Link>
          )}
          {isLandlord && (
            <Link
              href="/my-properties"
              className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center"
            >
              <Building2 className="h-4 w-4 mr-1" />
              My Properties
            </Link>
          )}
          <Link
            href="/how-it-works"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            How It Works
          </Link>
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              {isLandlord && (
                <Button asChild className="hidden md:inline-flex">
                  <Link href="/properties/new">
                    <Plus className="mr-2 h-4 w-4" />
                    List Property
                  </Link>
                </Button>
              )}
              <div className="hidden md:flex items-center space-x-2">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                  <span className="sr-only">User menu</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild className="hidden md:inline-flex">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Sign Up</Link>
              </Button>
            </>
          )}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
