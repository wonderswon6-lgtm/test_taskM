'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { User } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

interface WelcomePopupProps {
  user: User | null;
  show: boolean;
}

export function WelcomePopup({ user, show }: WelcomePopupProps) {
  const getInitials = (name?: string | null) => {
    if (!name) return '';
    const nameParts = name.split(' ');
    if (nameParts.length > 1) {
      return nameParts[0][0] + nameParts[nameParts.length - 1][0];
    }
    return name.substring(0, 2);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.5, y: 100, opacity: 0 }}
            animate={{
              scale: 1,
              y: 0,
              opacity: 1,
              transition: { type: 'spring', stiffness: 300, damping: 20 },
            }}
            exit={{
              scale: 0.8,
              opacity: 0,
              transition: { duration: 0.2 },
            }}
            className="flex flex-col items-center gap-4 rounded-xl bg-card p-8 shadow-2xl"
          >
            <Avatar className="h-24 w-24 border-4 border-primary">
              <AvatarImage src={user?.avatarUrl} />
              <AvatarFallback className="text-3xl">
                {getInitials(user?.displayName || user?.email)}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-center text-2xl font-bold text-card-foreground md:text-3xl">
              Welcome back,
              <br />
              {user?.displayName || user?.email}!
            </h2>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
