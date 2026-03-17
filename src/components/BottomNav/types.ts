import { LucideIcon } from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

export interface BottomNavItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  badge?: number;
  onClick: () => void;
}

export interface BottomNavMoreMenuProps {
  items: NavItem[];
  isOpen: boolean;
  onClose: () => void;
  onItemClick: (href: string) => void;
}
