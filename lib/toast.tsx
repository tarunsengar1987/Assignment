'use client';

import { useState, useEffect } from 'react';
import { Box, Text, VStack, HStack, Icon, Button } from '@chakra-ui/react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

let toastId = 0;
let toasts: Toast[] = [];
let listeners: (() => void)[] = [];

const notifyListeners = () => {
  listeners.forEach(listener => listener());
};

export const showSuccessToast = (message: string) => {
  const id = `toast-${++toastId}`;
  toasts.push({ id, message, type: 'success' });
  notifyListeners();
  
  setTimeout(() => {
    toasts = toasts.filter(t => t.id !== id);
    notifyListeners();
  }, 3000);
};

export const showErrorToast = (message: string) => {
  const id = `toast-${++toastId}`;
  toasts.push({ id, message, type: 'error' });
  notifyListeners();
  
  setTimeout(() => {
    toasts = toasts.filter(t => t.id !== id);
    notifyListeners();
  }, 3000);
};

export const showInfoToast = (message: string) => {
  const id = `toast-${++toastId}`;
  toasts.push({ id, message, type: 'info' });
  notifyListeners();
  
  setTimeout(() => {
    toasts = toasts.filter(t => t.id !== id);
    notifyListeners();
  }, 3000);
};

export const showWarningToast = (message: string) => {
  const id = `toast-${++toastId}`;
  toasts.push({ id, message, type: 'warning' });
  notifyListeners();
  
  setTimeout(() => {
    toasts = toasts.filter(t => t.id !== id);
    notifyListeners();
  }, 3000);
};

export function ToastContainer() {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const listener = () => forceUpdate({});
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, []);

  const removeToast = (id: string) => {
    toasts = toasts.filter(t => t.id !== id);
    notifyListeners();
  };

  const getIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'error': return AlertCircle;
      case 'warning': return AlertTriangle;
      case 'info': return Info;
      default: return Info;
    }
  };

  const getStyles = (type: Toast['type']) => {
    switch (type) {
      case 'success': 
        return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', icon: 'text-emerald-600' };
      case 'error': 
        return { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-800', icon: 'text-rose-600' };
      case 'warning': 
        return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', icon: 'text-amber-600' };
      case 'info': 
        return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon: 'text-blue-600' };
      default: 
        return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-800', icon: 'text-gray-600' };
    }
  };

  if (toasts.length === 0) return null;

  return (
    <VStack
      position="fixed"
      top={4}
      right={4}
      spacing={2}
      zIndex={9999}
      align="flex-end"
    >
      {toasts.map((toast) => {
        const styles = getStyles(toast.type);
        const IconComponent = getIcon(toast.type);
        
        return (
          <Box
            key={toast.id}
            className={`${styles.bg} ${styles.border} border rounded-lg shadow-lg p-4 min-w-[300px] max-w-[400px] animate-fade-up`}
          >
            <HStack justify="space-between" align="start">
              <HStack gap={3} align="start" flex={1}>
                <Icon as={IconComponent} className={styles.icon} boxSize={5} flexShrink={0} />
                <Text className={styles.text} fontSize="sm" fontWeight="500" flex={1}>
                  {toast.message}
                </Text>
              </HStack>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeToast(toast.id)}
                className={`${styles.text} hover:bg-black/5 p-1 h-auto min-h-0`}
              >
                <Icon as={X} boxSize={4} />
              </Button>
            </HStack>
          </Box>
        );
      })}
    </VStack>
  );
}
