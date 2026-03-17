'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { BottomNavItemProps } from './types';

const tapSpring = {
  type: 'spring' as const,
  stiffness: 600,
  damping: 25
};

const iconSpring = {
  type: 'spring' as const,
  stiffness: 500,
  damping: 20
};

export function BottomNavItem({
  icon: Icon,
  label,
  isActive,
  badge,
  onClick
}: BottomNavItemProps) {
  return (
    <motion.button
      onClick={onClick}
      aria-label={label}
      className={cn(
        'relative flex flex-col items-center justify-center px-2 py-2 min-w-[64px] flex-1',
        'transition-colors duration-150',
        isActive ? 'text-primary' : 'text-muted-foreground'
      )}
      whileTap={{ scale: 0.92 }}
      transition={tapSpring}
    >
      <motion.div
        className="relative"
        animate={{
          scale: isActive ? 1.15 : 1,
          y: isActive ? -2 : 0
        }}
        transition={iconSpring}
      >
        <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />

        {/* Badge for notifications */}
        {badge !== undefined && badge > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 700, damping: 20 }}
            className="absolute -top-1 -right-2 h-4 min-w-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center"
          >
            {badge > 9 ? '9+' : badge}
          </motion.span>
        )}
      </motion.div>

      <motion.span
        className={cn(
          'text-[10px] mt-1 font-medium truncate max-w-full',
          isActive && 'font-semibold'
        )}
        animate={{
          opacity: isActive ? 1 : 0.7
        }}
        transition={{ duration: 0.15 }}
      >
        {label}
      </motion.span>

      {/* Active indicator */}
      {isActive && (
        <motion.div
          layoutId="bottomNavActiveIndicator"
          className="absolute bottom-0 h-0.5 w-8 rounded-full bg-primary"
          transition={{
            type: 'spring',
            stiffness: 600,
            damping: 30
          }}
        />
      )}
    </motion.button>
  );
}
