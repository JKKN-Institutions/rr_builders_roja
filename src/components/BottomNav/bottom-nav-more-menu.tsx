'use client';

import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { BottomNavMoreMenuProps } from './types';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';

export function BottomNavMoreMenu({
  items,
  isOpen,
  onClose,
  onItemClick
}: BottomNavMoreMenuProps) {
  const pathname = usePathname();

  const handleItemClick = (href: string) => {
    onItemClick(href);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="bottom"
        className="rounded-t-3xl flex flex-col z-[90]"
      >
        <SheetHeader className="pb-4 flex-shrink-0">
          <SheetTitle className="text-lg font-semibold">More Options</SheetTitle>
        </SheetHeader>

        {/* Grid of menu items */}
        <div className="grid grid-cols-3 gap-3 pb-8">
          {items.map((item, index) => {
            const isActive =
              pathname === item.href ||
              pathname.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <motion.button
                key={item.href}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  transition: { delay: index * 0.03 }
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleItemClick(item.href)}
                className={cn(
                  'flex flex-col items-center justify-center p-4 rounded-xl',
                  'transition-colors duration-200',
                  'active:bg-accent relative',
                  isActive
                    ? 'bg-primary/10 text-primary ring-1 ring-primary/20'
                    : 'text-muted-foreground bg-muted/50'
                )}
              >
                <div className="relative">
                  <Icon
                    className="h-6 w-6 mb-2"
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1 -right-2 h-4 min-w-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>
                <span
                  className={cn(
                    'text-xs text-center leading-tight line-clamp-2',
                    isActive && 'font-semibold'
                  )}
                >
                  {item.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
