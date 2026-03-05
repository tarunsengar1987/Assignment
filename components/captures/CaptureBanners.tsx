'use client';

import React from 'react';
import { Box, Button, Flex, HStack, Text } from '@chakra-ui/react';

type CaptureBannersProps = {
  error: string | null;
  onRetry: () => void;
  pendingCapturesCount: number;
  onViewLatest: () => void;
};

export default function CaptureBanners({ error, onRetry, pendingCapturesCount, onViewLatest }: CaptureBannersProps) {
  return (
    <>
      {/* Error banner */}
      {error && (
        <Flex
          align="center"
          justify="space-between"
          className="bg-rose-50 border border-rose-200/80 px-5 py-3.5 rounded-2xl"
        >
          <HStack gap={3}>
            <Box className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
              <Box className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            </Box>
            <Text className="text-sm font-semibold text-rose-800">{error}</Text>
          </HStack>
          <Button
            size="sm"
            onClick={onRetry}
            className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wide"
          >
            Retry
          </Button>
        </Flex>
      )}

      {/* New items banner */}
      {pendingCapturesCount > 0 && (
        <Flex
          align="center"
          justify="space-between"
          className="bg-navy-950 text-white px-5 py-3 rounded-2xl shadow-lg shadow-navy-900/20"
        >
          <HStack gap={3}>
            <Box className="w-2 h-2 rounded-full bg-emerald-400 status-dot active" />
            <Text className="text-sm font-bold">
              {pendingCapturesCount} new capture{pendingCapturesCount === 1 ? '' : 's'} available
            </Text>
          </HStack>
          <Button
            size="sm"
            onClick={onViewLatest}
            className="bg-white text-navy-950 hover:bg-navy-50 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wide"
          >
            View Latest
          </Button>
        </Flex>
      )}
    </>
  );
}
