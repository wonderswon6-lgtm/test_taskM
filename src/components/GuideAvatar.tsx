
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, X, PartyPopper } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

const GuideAvatarCharacter = () => (
  <svg
    width="80"
    height="80"
    viewBox="0 0 100 100"
    className="drop-shadow-lg"
  >
    <defs>
      <radialGradient
        id="grad1"
        cx="50%"
        cy="50%"
        r="50%"
        fx="50%"
        fy="50%"
      >
        <stop
          offset="0%"
          style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }}
        />
        <stop
          offset="100%"
          style={{ stopColor: 'hsl(var(--accent))', stopOpacity: 1 }}
        />
      </radialGradient>
    </defs>
    <circle cx="50" cy="50" r="40" fill="url(#grad1)" />
    <motion.g
      animate={{
        translateY: ['0px', '-2px', '0px'],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <circle cx="50" cy="50" r="40" fill="url(#grad1)" />
      {/* Eyes */}
      <circle cx="38" cy="45" r="5" fill="white" />
      <circle cx="62" cy="45" r="5" fill="white" />
      <circle cx="38" cy="45" r="2" fill="black" />
      <circle cx="62" cy="45" r="2" fill="black" />
      {/* Mouth */}
      <path
        d="M 40 60 Q 50 70 60 60"
        stroke="white"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
    </motion.g>
  </svg>
);

const messages = {
  welcome: {
    icon: Lightbulb,
    text: "👋 Hi there! I'm your productivity buddy. Let's get things done!",
  },
  firstTask: {
    icon: Lightbulb,
    text: '✨ Looks like your lists are empty! Try creating a new list with the big plus button.',
  },
  taskAdded: {
    icon: PartyPopper,
    text: "✅ Awesome! You've added your first task. Click it to add sub-tasks or edit.",
  },
  taskCompleted: {
    icon: PartyPopper,
    text: "🎉 Great job! You completed a task. Keep that momentum going!",
  },
};

type MessageKey = keyof typeof messages;

interface GuideAvatarProps {
  totalTasks: number;
  completedTasks: number;
}

export function GuideAvatar({
  totalTasks,
  completedTasks,
}: GuideAvatarProps) {
  const [messageKey, setMessageKey] = useState<MessageKey | null>(null);
  const [show, setShow] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Show welcome message on first load if not dismissed this session
    const hasBeenWelcomed = sessionStorage.getItem('guideWelcomed');
    if (!hasBeenWelcomed) {
      setMessageKey('welcome');
      sessionStorage.setItem('guideWelcomed', 'true');
      return;
    }

    if (totalTasks === 0) {
      setMessageKey('firstTask');
    }
  }, []);

  useEffect(() => {
    const prevTotal = sessionStorage.getItem('totalTasks') || '0';
    if (totalTasks > parseInt(prevTotal) && parseInt(prevTotal) === 0) {
      setMessageKey('taskAdded');
    }
    sessionStorage.setItem('totalTasks', totalTasks.toString());
  }, [totalTasks]);
  
  useEffect(() => {
    const prevCompleted = sessionStorage.getItem('completedTasks') || '0';
    if (completedTasks > parseInt(prevCompleted)) {
      setMessageKey('taskCompleted');
    }
    sessionStorage.setItem('completedTasks', completedTasks.toString());
  }, [completedTasks]);

  useEffect(() => {
    if (isDismissed || messageKey === null) {
      setShow(false);
      return;
    }
    
    // Show message, then hide after a delay
    setShow(true);
    const timer = setTimeout(() => {
      setShow(false);
    }, 6000); // Hide after 6 seconds
    
    return () => clearTimeout(timer);
  }, [messageKey, isDismissed]);

  if (isDismissed) return null;

  const currentMessage = messageKey ? messages[messageKey] : null;
  const Icon = currentMessage?.icon;

  return (
    <div className="fixed bottom-4 left-4 z-20">
      <AnimatePresence>
        {show && currentMessage && Icon && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="relative max-w-xs rounded-lg border bg-card p-4 pr-10 text-card-foreground shadow-xl"
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1 h-6 w-6"
              onClick={() => setIsDismissed(true)}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="flex items-start gap-3">
              <Icon className="h-6 w-6 flex-shrink-0 text-primary" />
              <p className="text-sm">{currentMessage.text}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        className="mt-2 cursor-pointer"
        onClick={() => {
            setIsDismissed(false); // Reshow on click if dismissed
            setMessageKey(messageKey); // Trigger re-show
        }}
      >
        <GuideAvatarCharacter />
      </motion.div>
    </div>
  );
}
