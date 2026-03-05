'use client';

import React, { useEffect, useState } from 'react';
import { Clock, Database } from 'lucide-react';
import { Badge, Box, Flex, Heading, HStack, Icon, Image, Text, VStack } from '@chakra-ui/react';
import type { Capture } from '@/services/capture.service';

function getStateBadgeClass(state: string) {
  if (['NORMALIZED', 'LINKED', 'MERGED'].includes(state)) return 'badge-success';
  if (['RAW', 'RECOGNIZED', 'ENRICHING'].includes(state)) return 'badge-warning';
  return 'badge-danger';
}

function CaptureSkeleton() {
  return (
    <Box className="premium-card p-6 flex flex-col justify-between gap-5 h-full">
      <HStack align="flex-start" gap={4}>
        <Box className="skeleton h-16 w-16 flex-shrink-0" borderRadius="16px" />
        <VStack align="start" gap={2} flex={1}>
          <Box className="skeleton h-2.5 w-16" />
          <Box className="skeleton h-4 w-28" />
          <Box className="skeleton h-2.5 w-full" />
          <Box className="skeleton h-2.5 w-3/4" />
        </VStack>
      </HStack>
      <HStack justify="space-between" align="center">
        <Box className="skeleton h-5 w-16" borderRadius="99px" />
        <HStack gap={2}>
          <Box className="skeleton h-2.5 w-10" />
          <Box className="skeleton h-8 w-16" borderRadius="99px" />
        </HStack>
      </HStack>
    </Box>
  );
}

function DateFormatter({ date }: { date: string }) {
  const [formatted, setFormatted] = useState<string>('');
  useEffect(() => {
    setFormatted(new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
  }, [date]);
  return <>{formatted}</>;
}

type CaptureGridProps = {
  captures: Capture[];
  filteredCaptures: Capture[];
  searchQuery: string;
  visibleRange: { start: number; end: number };
  itemHeight: number;
  loading: boolean;
  onCaptureClick: (id: string) => void;
};

export default function CaptureGrid({
  captures,
  filteredCaptures,
  searchQuery,
  visibleRange,
  itemHeight,
  loading,
  onCaptureClick,
}: CaptureGridProps) {
  const displayCaptures = searchQuery ? filteredCaptures : captures;

  return (
    <>
      {/* Virtual spacer top */}
      {captures.length > 0 && <Box height={`${visibleRange.start * itemHeight}px`} />}

      {/* Skeleton loading */}
      {loading && captures.length === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
          {[...Array(6)].map((_, i) => (
            <CaptureSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Captures grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
        {displayCaptures.slice(visibleRange.start, visibleRange.end).map((capture) => (
          <Box
            key={capture.id}
            onClick={() => onCaptureClick(capture.id)}
            className="premium-card p-5 flex flex-col gap-4 cursor-pointer group"
          >
            <Flex justify="space-between" align="start">
              {/* Thumbnail */}
              <Box className="relative flex-shrink-0">
                <Box className="h-14 w-14 bg-navy-50 rounded-2xl overflow-hidden border border-navy-100/60 shadow-sm group-hover:scale-105 transition-transform duration-400">
                  <Image
                    src={capture.contactImageUrl || '/placeholder-image.png'}
                    alt="Scan thumbnail"
                    className={`object-cover h-full w-full ${capture.state === 'DISCARDED' ? 'opacity-40 grayscale' : ''}`}
                  />
                </Box>
                <Box className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm border border-navy-50">
                  <Icon as={Database} className="text-navy-400" boxSize={2} />
                </Box>
              </Box>

              <Badge
                className={`${getStateBadgeClass(capture.state)} text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest`}
              >
                {capture.state}
              </Badge>
            </Flex>

            <VStack align="start" gap={0.5} flex={1}>
              <Text className="text-[9px] font-black text-navy-300 uppercase tracking-[0.3em]">Identity Matrix</Text>
              <Heading
                size="sm"
                className="text-navy-950 font-black tracking-tight group-hover:text-accent-blue transition-colors"
              >
                CAP-{capture.id.slice(-8).toUpperCase()}
              </Heading>
              <Text className="text-[11px] text-navy-400 font-medium line-clamp-2 leading-relaxed">
                Neural extraction · sync protocol v2.4
              </Text>
            </VStack>

            <Flex justify="space-between" align="center" className="border-t border-navy-50/80 pt-3">
              <HStack gap={1.5} className="text-navy-300">
                <Icon as={Clock} boxSize={3} />
                <Text className="text-[10px] font-bold uppercase tracking-widest">
                  <DateFormatter date={capture.capturedAt} />
                </Text>
              </HStack>
            </Flex>
          </Box>
        ))}
      </div>

      {/* Virtual spacer bottom */}
      {captures.length > 0 && <Box height={`${(captures.length - visibleRange.end) * itemHeight}px`} />}
    </>
  );
}
