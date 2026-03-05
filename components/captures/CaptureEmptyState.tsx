'use client';

import React from 'react';
import { Archive } from 'lucide-react';
import { Box, Button, Flex, Heading, Icon, Text } from '@chakra-ui/react';

type CaptureEmptyStateProps = {
  onStartFirstScan: () => void;
};

export default function CaptureEmptyState({ onStartFirstScan }: CaptureEmptyStateProps) {
  return (
    <>
      {/* Empty state */}
      <Flex direction="column" align="center" justify="center" py={24} className="text-center">
        <Box
          className="p-8 bg-white rounded-[2rem] shadow-xl shadow-navy-900/5 mb-6 border border-navy-50 pulse-glow"
        >
          <Icon as={Archive} boxSize={14} className="text-navy-100" />
        </Box>
        <Heading size="xl" className="text-navy-950 mb-2 font-black tracking-tighter">
          Archive Vacuum
        </Heading>
        <Text className="text-navy-400 max-w-sm font-medium leading-relaxed mb-6">
          Your neural registry is empty. Initialize a scan to begin intelligence synchronization.
        </Text>
        <Button
          onClick={onStartFirstScan}
          className="btn-primary px-7 py-3 rounded-2xl font-black text-xs uppercase tracking-widest"
        >
          Start First Scan
        </Button>
      </Flex>
    </>
  );
}
