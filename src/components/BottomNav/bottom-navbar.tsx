'use client';

import { useState, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Building2,
  AlertTriangle,
  MoreHorizontal,
  FileText,
  TrendingUp,
  FolderOpen,
  Calendar,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BottomNavItem } from './bottom-nav-item';
import { BottomNavMoreMenu } from './bottom-nav-more-menu';
import { NavItem } from './types';

// Primary navigation items (shown in navbar)
const primaryNavItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard
  },
  {
    href: '/dashboard/projects',
    label: 'Projects',
    icon: Building2
  },
  {
    href: '/dashboard/wip',
    label: 'WIP',
    icon: AlertTriangle,
    // WIP badge count is passed from server data via layout, not mock data
    // TODO: Pass real WIP count from dashboard layout context
    badge: undefined
  }
];

// More menu items
const moreNavItems: NavItem[] = [
  {
    href: '/dashboard/reports',
    label: 'Reports',
    icon: FileText
  },
  {
    href: '/dashboard/tally',
    label: 'Live Tally',
    icon: TrendingUp
  },
  {
    href: '/dashboard/documents',
    label: 'Documents',
    icon: FolderOpen
  },
  {
    href: '/dashboard/schedules',
    label: 'Schedules',
    icon: Calendar
  },
  {
    href: '/dashboard/settings',
    label: 'Settings',
    icon: Settings
  }
];

export function BottomNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMoreMenuOpen, setMoreMenuOpen] = useState(false);

  // Check if current path matches a nav item
  const isActive = useCallback(
    (href: string) => {
      if (href === '/dashboard') {
        return pathname === '/dashboard';
      }
      return pathname === href || pathname.startsWith(href + '/');
    },
    [pathname]
  );

  // Check if any "more" item is active
  const isMoreActive = moreNavItems.some((item) => isActive(item.href));

  // Handle nav item click
  const handleNavClick = useCallback(
    (href: string) => {
      router.push(href);
      setMoreMenuOpen(false);
    },
    [router]
  );

  // Handle "More" button click
  const handleMoreClick = useCallback(() => {
    setMoreMenuOpen((prev) => !prev);
  }, []);

  return (
    <>
      {/* Bottom navigation */}
      <motion.nav
        data-bottom-nav
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 35,
          mass: 0.8
        }}
        className={cn(
          'fixed bottom-0 left-0 right-0 z-[80]',
          'lg:hidden',
          'bg-background border-t border-border',
          'shadow-[0_-4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.25)]'
        )}
        style={{
          paddingBottom: 'env(safe-area-inset-bottom, 0px)'
        }}
      >
        <div className="flex items-center justify-around">
          {/* Primary nav items */}
          {primaryNavItems.map((item) => (
            <BottomNavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              isActive={isActive(item.href)}
              badge={item.badge}
              onClick={() => handleNavClick(item.href)}
            />
          ))}

          {/* More button */}
          <BottomNavItem
            href="#more"
            icon={MoreHorizontal}
            label="More"
            isActive={isMoreMenuOpen || isMoreActive}
            badge={undefined}
            onClick={handleMoreClick}
          />
        </div>
      </motion.nav>

      {/* More menu sheet */}
      <BottomNavMoreMenu
        items={moreNavItems}
        isOpen={isMoreMenuOpen}
        onClose={() => setMoreMenuOpen(false)}
        onItemClick={handleNavClick}
      />
    </>
  );
}
