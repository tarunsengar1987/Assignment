'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { Box, Flex, Heading, Icon, Input, Text, VStack } from '@chakra-ui/react';

type CaptureTitleRowProps = {
  captureCount: number;
  searchQuery: string;
  setSearchQuery: (next: string) => void;
};

export default function CaptureTitleRow({ captureCount, searchQuery, setSearchQuery }: CaptureTitleRowProps) {
  return (
    <>
      {/* Page title row */}
      <Flex justify="space-between" align="center" flexWrap="wrap" gap={3}>
        <VStack align="start" gap={0.5}>
          <Heading size="lg" className="text-navy-950 font-black tracking-tighter leading-none">
            Capture Registry
          </Heading>
          <Text className="text-[11px] font-bold text-navy-400 uppercase tracking-widest">
            {captureCount} nodes archived
          </Text>
        </VStack>
        {/* Mobile search */}
        <Box position="relative" display={{ base: 'flex', lg: 'none' }} alignItems="center">
          <Icon as={Search} className="text-navy-300 absolute left-3 z-10" boxSize={3.5} />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="premium-input pl-9 pr-4 py-2 w-48 text-xs rounded-xl"
          />
        </Box>
      </Flex>
    </>
  );
}
