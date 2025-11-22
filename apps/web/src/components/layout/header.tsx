'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Home, Menu, Plus, Building2, Heart, User, LogOut, MessageSquare, FileText, Inbox, DollarSign, FileSignature, Star, Wrench } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { conversationsApi } from '@/lib/api/conversations';
import { socketClient } from '@/lib/socket';

export function Header() {
  const router = useRouter();
  const { isAuthenticated, user, clearAuth } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
      setupSocketListeners();
    } else {
      setUnreadCount(0);
    }

    return () => {
      // Cleanup socket listeners when component unmounts
      if (socketClient.isConnected()) {
        socketClient.offNewMessage();
      }
    };
  }, [isAuthenticated]);

  const fetchUnreadCount = async () => {
    try {
      const data = await conversationsApi.getUnreadCount();
      setUnreadCount(data.count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const setupSocketListeners = () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) return;

    if (!socketClient.isConnected()) {
      socketClient.connect(accessToken);
    }

    // Listen for new messages to update unread count
    socketClient.onNewMessage(() => {
      fetchUnreadCount();
    });
  };

  const handleLogout = () => {
    clearAuth();
    socketClient.disconnect();
    router.push('/');
  };

  const isLandlord = user?.role === 'LANDLORD' || user?.role === 'BOTH';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2" aria-label="HomeMore - Go to homepage">
          <Home className="h-6 w-6 text-primary" aria-hidden="true" />
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            HomeMore
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium" aria-label="Main navigation">
          <Link
            href="/search"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Search
          </Link>
          {isAuthenticated && (
            <>
              <Link
                href="/messages"
                className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center relative"
                aria-label={unreadCount > 0 ? `Messages - ${unreadCount} unread` : 'Messages'}
              >
                <MessageSquare className="h-4 w-4 mr-1" aria-hidden="true" />
                Messages
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold" aria-hidden="true">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
              <Link
                href="/favorites"
                className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center"
              >
                <Heart className="h-4 w-4 mr-1" />
                Favorites
              </Link>
              <Link
                href="/my-applications"
                className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center"
              >
                <FileText className="h-4 w-4 mr-1" />
                My Applications
              </Link>
              <Link
                href="/my-contracts"
                className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center"
              >
                <FileSignature className="h-4 w-4 mr-1" />
                Contracts
              </Link>
              <Link
                href="/payments"
                className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center"
              >
                <DollarSign className="h-4 w-4 mr-1" />
                Payments
              </Link>
              <Link
                href="/pending-reviews"
                className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center"
              >
                <Star className="h-4 w-4 mr-1" />
                Reviews
              </Link>
              <Link
                href="/my-maintenance"
                className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center"
              >
                <Wrench className="h-4 w-4 mr-1" />
                Maintenance
              </Link>
            </>
          )}
          {isAuthenticated && (
            <Link
              href="/my-viewings"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              My Viewings
            </Link>
          )}
          {isLandlord && (
            <>
              <Link
                href="/my-properties"
                className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center"
              >
                <Building2 className="h-4 w-4 mr-1" />
                My Properties
              </Link>
              <Link
                href="/landlord-applications"
                className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center"
              >
                <Inbox className="h-4 w-4 mr-1" />
                Applications
              </Link>
              <Link
                href="/landlord-viewings"
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                Manage Viewings
              </Link>
              <Link
                href="/landlord-maintenance"
                className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center"
              >
                <Wrench className="h-4 w-4 mr-1" />
                Maintenance
              </Link>
            </>
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
