'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { captureService, Capture } from '@/services/capture.service';
import { meService } from '@/services/me.service';
import AuthGuard from '@/components/AuthGuard';
import TiptapEditor from '@/components/TiptapEditor';
import {
  Box,
  Flex,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Badge,
  Spinner,
  Icon,
  Image
} from '@chakra-ui/react';
import { ChevronLeft, Archive, ShieldCheck, Trash2, Calendar, Lock, FileText } from 'lucide-react';
import React from 'react';
import { showErrorToast } from '@/lib/toast';

function DateFormatter({ date }: { date: string }) {
  const [formatted, setFormatted] = useState<string>('');
  useEffect(() => {
    setFormatted(new Date(date).toLocaleDateString(undefined, { dateStyle: 'medium' }));
  }, [date]);
  return <>{formatted}</>;
}

function getStateBadgeClass(state: string) {
  if (['NORMALIZED', 'LINKED', 'MERGED'].includes(state)) return 'badge-success';
  if (['RAW', 'RECOGNIZED', 'ENRICHING'].includes(state)) return 'badge-warning';
  return 'badge-danger';
}

export default function CaptureDetailPage() {
  const { id } = useParams();
  const [capture, setCapture] = useState<Capture | null>(null);
  const [loading, setLoading] = useState(true);
  const [orgId, setOrgId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      try {
        const storedOrgId = typeof window !== 'undefined' ? localStorage.getItem('orgId') : null;
        if (storedOrgId) {
          setOrgId(storedOrgId);
          return;
        }

        const me = await meService.getMyInfo();
        const orgIdToUse = me.member.org.id;
        if (typeof window !== 'undefined') {
          localStorage.setItem('orgId', orgIdToUse);
          localStorage.setItem('memberData', JSON.stringify(me.member));
        }
        setOrgId(orgIdToUse);
      } catch (err) {
        console.error('Failed to fetch user info', err);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (orgId && id) fetchDetail();
  }, [orgId, id]);

  const fetchDetail = async () => {
    if (!orgId) return;
    try {
      const res = await captureService.getCaptureDetail(orgId, id as string);
      if (res.ok) setCapture(await res.json());
    } finally {
      setLoading(false);
    }
  };

  const handleDiscard = async () => {
    if (!capture || !orgId) return;
    try {
      const res = await captureService.markDiscarded(orgId, capture.id);
      if (res.ok) setCapture(prev => prev ? { ...prev, state: 'DISCARDED' } : null);
    } catch {
      showErrorToast('Failed to discard');
    }
  };

  if (loading) {
    return (
      <Box minH="100vh" className="gradient-mesh" display="flex" alignItems="center" justifyContent="center">
        <VStack gap={4}>
          <Box className="premium-card p-6 rounded-full pulse-glow">
            <Spinner size="lg" className="text-navy-400" />
          </Box>
          <Text className="text-xs font-black text-navy-400 tracking-[0.2em] uppercase">Loading capture</Text>
        </VStack>
      </Box>
    );
  }

  if (!capture) {
    return (
      <AuthGuard>
        <Box minH="100vh" className="gradient-mesh" display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={6} textAlign="center">
          <Box className="p-8 premium-card rounded-[2rem] mb-6">
            <Icon as={Archive} boxSize={14} className="text-navy-100" />
          </Box>
          <Heading size="2xl" className="text-navy-950 font-black mb-2">Capture Not Found</Heading>
          <Text className="text-navy-400 mb-6">This registry entry may have been removed or never existed.</Text>
          <Button onClick={() => router.push('/captures')} className="btn-primary px-6 py-3 rounded-2xl text-xs font-black tracking-widest uppercase">
            Return to Registry
          </Button>
        </Box>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <Box h="100vh" display="flex" flexDirection="column" className="gradient-mesh" overflow="hidden">
        {/* Header */}
        <Box as="header" className="premium-glass px-6 py-3 border-b border-navy-100/40 z-50">
          <Flex maxW="full" mx="auto" justify="space-between" align="center">
            <HStack gap={3}>
              <Button
                onClick={() => router.push('/captures')}
                className="flex items-center gap-2 btn-primary py-2 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest"
              >
                <Icon as={ChevronLeft} boxSize={3.5} />
                Registry
              </Button>
            </HStack>

            <VStack gap={0} align="center">
              <Text className="text-[8px] font-black text-navy-400 uppercase tracking-[0.4em] leading-none mb-0.5">
                Intelligence Registry
              </Text>
              <Heading size="xs" className="text-navy-950 font-black tracking-tight uppercase leading-none">
                Node Sync Protocol
              </Heading>
            </VStack>

            <HStack gap={2} minW="120px" justify="flex-end">
              <Badge className={`${getStateBadgeClass(capture.state)} px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest`}>
                {capture.state}
              </Badge>
              <Badge className="badge-info px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest hidden sm:flex items-center gap-1.5">
                <Icon as={Lock} boxSize={2.5} />
                Secured
              </Badge>
            </HStack>
          </Flex>
        </Box>

        {/* Body */}
        <Flex flex="1" overflow="hidden">
          {/* Left panel: Image + actions */}
          <Box
            w={{ base: '100%', lg: '38%' }}
            display={{ base: 'none', lg: 'flex' }}
            h="full"
            bg="white"
            borderRight="1px solid"
            borderColor="rgba(0,30,60,0.05)"
            flexDirection="column"
            p={6}
            gap={5}
          >
            {/* Image */}
            <Box
              className="group relative bg-navy-50 overflow-hidden border border-navy-100/50 shadow-xl shadow-navy-900/5 transition-all duration-700"
            >
              <Image
                src={capture?.contactImageUrl || '/placeholder-image.png'}
                alt="Business Card"
                className={`w-full h-full object-contain p-4 transition-transform duration-700 group-hover:scale-105 ${capture?.state === 'DISCARDED' ? 'grayscale opacity-50' : ''}`}
              />
              {/* Status pill */}
              <Box className="absolute top-4 left-4">
                <HStack className="premium-glass px-3 py-1.5 rounded-2xl shadow-lg" gap={2}>
                  <Box className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                    ['NORMALIZED', 'LINKED', 'MERGED'].includes(capture.state) ? 'bg-emerald-500' : 'bg-amber-500'
                  }`} />
                  <Text className="text-[10px] font-black uppercase tracking-widest text-navy-950">{capture.state}</Text>
                </HStack>
              </Box>
            </Box>

            {/* Metadata pills */}
            <Box className="premium-card p-4">
              <VStack align="stretch" gap={3}>
                <HStack justify="space-between">
                  <HStack gap={2} className="text-navy-400">
                    <Icon as={Calendar} boxSize={3.5} />
                    <Text className="text-[10px] font-black uppercase tracking-widest">Captured</Text>
                  </HStack>
                  <Text className="text-sm font-black text-navy-950">
                    <DateFormatter date={capture.capturedAt} />
                  </Text>
                </HStack>
                <Box className="divider" />
                <HStack justify="space-between">
                  <HStack gap={2} className="text-navy-400">
                    <Icon as={Lock} boxSize={3.5} />
                    <Text className="text-[10px] font-black uppercase tracking-widest">Encryption</Text>
                  </HStack>
                  <Text className="text-sm font-black text-accent-blue uppercase tracking-wider">AES-256</Text>
                </HStack>
              </VStack>
            </Box>

            {capture.state !== 'DISCARDED' && (
              <Button
                onClick={handleDiscard}
                className="w-full btn-primary hover:!bg-rose-600 py-4 rounded-2xl text-[10px] uppercase tracking-widest group flex items-center justify-center gap-2"
              >
                <Icon as={Trash2} boxSize={4} className="group-hover:rotate-12 transition-transform" />
                Discard Entry
              </Button>
            )}
          </Box>

          {/* Right panel: Data */}
          <Box w={{ base: '100%', lg: '62%' }} h="full" overflowY="auto" className="custom-scrollbar" p={{ base: 4, md: 8 }}>
            <VStack align="stretch" gap={6} maxW="3xl" mx="auto">

              {/* Identity header */}
              <Box className="premium-card p-8 relative overflow-hidden group">
                <Flex justify="space-between" align="center">
                  <VStack align="start" gap={1}>
                    <Text className="text-navy-300 font-black text-[9px] uppercase tracking-[0.5em]">
                      Matrix Identification
                    </Text>
                    <Heading size="xl" className="text-navy-950 font-black tracking-tighter uppercase">
                      CAP-{capture.id.slice(-8).toUpperCase()}
                    </Heading>
                  </VStack>
                </Flex>
              </Box>

              {/* Mobile: image + discard (shown below ID card on small screens) */}
              <Box display={{ base: 'block', lg: 'none' }}>
                <Box className="premium-card p-2 mb-4" borderRadius="2rem" overflow="hidden">
                  <Image
                    src={capture?.contactImageUrl || '/placeholder-image.png'}
                    alt="Business Card"
                    className={`w-full object-contain max-h-64 p-4 ${capture.state === 'DISCARDED' ? 'grayscale opacity-50' : ''}`}
                  />
                </Box>
                {capture.state !== 'DISCARDED' && (
                  <Button onClick={handleDiscard} className="w-full btn-primary hover:!bg-rose-600 py-3.5 rounded-2xl text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                    <Icon as={Trash2} boxSize={4} />
                    Discard Entry
                  </Button>
                )}
              </Box>

              {/* Neural extraction console */}
              <Box className="premium-card-dark p-8 relative overflow-hidden" padding={15}>
                <Flex justify="space-between" align="center" mb={4}>
                  <VStack align="start" gap={0.5}>
                    <Heading size="sm" className="text-white font-black tracking-wider uppercase">
                      Neural Matrix Stream
                    </Heading>
                    <Text className="text-[9px] text-white/30 font-bold uppercase tracking-[0.35em]">
                      Raw Intelligence Data
                    </Text>
                  </VStack>
                  <Badge className="bg-white/10 text-white/60 px-3 py-1 rounded-full border border-white/10 text-[8px] font-black uppercase tracking-widest">
                    Live Archive
                  </Badge>
                </Flex>
                <Box className="bg-white/5 p-5 border border-white/5">
                  <Box
                    as="pre"
                    className="text-[12px] font-mono text-blue-100/90 leading-relaxed overflow-x-auto max-h-64 custom-scrollbar"
                  >
                    {JSON.stringify(capture || { message: 'No data found.' }, null, 2)}
                  </Box>
                </Box>
              </Box>

              {/* Notes workspace */}
              <Box className="premium-card p-8">
                <VStack align="stretch" gap={5}>
                  <Flex justify="space-between" align="center">
                    <VStack align="start" gap={0.5}>
                      <Heading size="sm" className="text-navy-950 font-black tracking-wider uppercase">
                        Intelligence Notes
                      </Heading>
                      <Text className="text-[9px] text-navy-300 font-bold uppercase tracking-[0.3em]">
                        Manual Annotation Layer
                      </Text>
                    </VStack>
                    <Badge className="badge-info px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">
                      Editor
                    </Badge>
                  </Flex>

                  <Box className="bg-navy-50/40 border border-navy-100/50 overflow-hidden">
                    <Box className="bg-white p-5 min-h-[180px] text-navy-950">
                      <TiptapEditor />
                    </Box>
                  </Box>
                </VStack>
              </Box>

            </VStack>
          </Box>
        </Flex>
      </Box>
    </AuthGuard>
  );
}
