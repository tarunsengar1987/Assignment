'use client';

import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Icon,
  Flex,
  Grid,
  GridItem,
  Badge
} from '@chakra-ui/react';
import { Archive, ShieldCheck, ChevronRight, Zap, Globe, Lock } from 'lucide-react';


const features = [
  {
    icon: Zap,
    title: 'Real-time OCR',
    description: 'Instant text extraction powered by neural recognition algorithms.'
  },
  {
    icon: Globe,
    title: 'Live Sync',
    description: 'Bi-directional synchronization with enterprise registry nodes.'
  },
  {
    icon: Lock,
    title: 'AES-256 Encrypted',
    description: 'Military-grade encryption on every data packet in transit.'
  },
];

export default function HomePage() {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/auth/signin');
  };

  return (
    <Box minH="100vh" bg="white" display="flex" flexDirection="column" overflow="hidden" position="relative">
      {/* Decorative orbs */}
      <Box
        className="floating-orb"
        w="600px" h="600px"
        bg="rgba(14, 165, 233, 0.07)"
        top="-200px" right="-100px"
        style={{ animationDuration: '10s' }}
      />
      <Box
        className="floating-orb"
        w="400px" h="400px"
        bg="rgba(0, 30, 60, 0.04)"
        bottom="-100px" left="-80px"
        style={{ animationDuration: '13s', animationDelay: '-4s' }}
      />

      {/* Navbar */}
      <Flex
        as="nav"
        px={{ base: 6, md: 10 }}
        py={5}
        justify="space-between"
        align="center"
        className="premium-glass"
        position="sticky"
        top={0}
        zIndex={50}
      >
        <HStack gap={3}>
          <Box
            className="btn-primary"
            p={2.5}
            borderRadius="14px"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Icon as={Archive} color="white" boxSize={5} />
          </Box>
          <VStack gap={0} align="start">
            <Heading size="md" className="text-navy-950 font-black tracking-tight leading-none">
              CoBALT
            </Heading>
            <Text className="text-[9px] font-bold text-navy-400 uppercase tracking-[0.3em] leading-none">
              Intelligence OS
            </Text>
          </VStack>
        </HStack>

        <HStack gap={2}>
          <Badge
            className="badge-info px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest hidden sm:flex items-center gap-1.5"
          >
            <span className="status-dot active" />
            System Online
          </Badge>
          <Button
            onClick={handleLogin}
            className="btn-primary px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2"
          >
            Launch
            <Icon as={ChevronRight} boxSize={4} />
          </Button>
        </HStack>
      </Flex>

      {/* Hero */}
      <Container maxW="container.xl" flex={1} display="flex" alignItems="center" py={{ base: 16, lg: 24 }}>
        <Grid
          templateColumns={{ base: '1fr', lg: '55% 45%' }}
          gap={{ base: 16, lg: 12 }}
          width="full"
          alignItems="center"
        >
          {/* Left: Content */}
          <GridItem>
            <VStack align="start" gap={8} className="animate-fade-up">
              <HStack
                className="bg-navy-50 border border-navy-100/80 px-4 py-2 rounded-full"
                gap={2}
              >
                <Icon as={ShieldCheck} className="text-navy-600" boxSize={3.5} />
                <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-navy-600">
                  Secure Protocol v2.4 — Enterprise Grade
                </Text>
              </HStack>

              <VStack align="start" gap={4}>
                <Heading
                  size="5xl"
                  className="text-navy-950 font-black tracking-tighter"
                  lineHeight="1.05"
                >
                  Intelligence
                  <br />
                  <Text as="span" className="text-navy-300">
                    Registry
                  </Text>{' '}
                  <Text as="span" className="text-accent-blue">
                    OS
                  </Text>
                </Heading>
                <Text className="text-base text-navy-500 max-w-md leading-relaxed font-medium">
                  Streamline your document intelligence with high-fidelity OCR scanning and
                  enterprise-grade real-time archival synchronization.
                </Text>
              </VStack>

              <HStack gap={4}>
                <Button
                  onClick={handleLogin}
                  className="btn-primary px-8 py-4 rounded-[1.5rem] flex items-center gap-3 text-sm uppercase font-black tracking-widest"
                >
                  Access Registry
                  <Icon as={ChevronRight} boxSize={5} />
                </Button>
                <Button
                  variant="ghost"
                  className="btn-ghost px-6 py-4 rounded-[1.5rem] text-sm font-black uppercase tracking-widest"
                >
                  Learn More
                </Button>
              </HStack>

              {/* Stats */}
              <Box className="premium-card p-5 w-full" borderRadius="20px">
                <HStack justify="space-around" divideX="1px">
                  {[
                    { value: '12k+', label: 'Nodes Synced' },
                    { value: '99.9%', label: 'OCR Accuracy' },
                    { value: '<50ms', label: 'Avg. Latency' },
                  ].map((stat) => (
                    <VStack key={stat.label} align="center" gap={0.5} px={4} flex={1}>
                      <Text className="text-2xl font-black text-navy-950 tracking-tighter">
                        {stat.value}
                      </Text>
                      <Text className="text-[10px] font-bold text-navy-400 uppercase tracking-widest text-center">
                        {stat.label}
                      </Text>
                    </VStack>
                  ))}
                </HStack>
              </Box>
            </VStack>
          </GridItem>

          {/* Right: Visual */}
          <GridItem display={{ base: 'none', lg: 'block' }} position="relative">
            {/* Main card visual */}
            <Box
              className="premium-card-dark dot-grid"
              w="full"
              aspectRatio="4/3"
              borderRadius="3rem"
              position="relative"
              overflow="hidden"
              p={8}
            >
              {/* Scanner line effect */}
              <Box className="scanner-line" />

              {/* Fake card data */}
              <VStack align="start" gap={5} position="relative" zIndex={1}>
                <HStack gap={3}>
                  <Box w={10} h={10} bg="rgba(14,165,233,0.2)" borderRadius="12px"
                    display="flex" alignItems="center" justifyContent="center">
                    <Icon as={Archive} color="#0ea5e9" boxSize={5} />
                  </Box>
                  <VStack align="start" gap={0}>
                    <Text className="text-white font-black text-xs uppercase tracking-widest">Node #A4F2</Text>
                    <Text className="text-white/30 font-bold text-[10px] uppercase tracking-widest">Active · Synchronized</Text>
                  </VStack>
                  <Box ml="auto">
                    <Badge className="badge-success px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">
                      LINKED
                    </Badge>
                  </Box>
                </HStack>

                <Box className="divider" />

                <VStack align="stretch" gap={2.5}>
                  {['NORMALIZED', 'ENRICHING', 'MERGED', 'RAW'].map((s, i) => (
                    <HStack key={s} gap={3}>
                      <Box
                        w={2}
                        h={2}
                        borderRadius="full"
                        bg={i === 0 ? '#10b981' : i === 1 ? '#f59e0b' : i === 2 ? '#0ea5e9' : '#64748b'}
                      />
                      <Box flex={1} h="8px" bg="rgba(255,255,255,0.06)" borderRadius="full" overflow="hidden">
                        <Box
                          h="full"
                          w={`${[90, 60, 75, 30][i]}%`}
                          bg={['rgba(16,185,129,0.4)', 'rgba(245,158,11,0.4)', 'rgba(14,165,233,0.4)', 'rgba(100,116,139,0.3)'][i]}
                          borderRadius="full"
                        />
                      </Box>
                      <Text className="text-white/40 text-[9px] font-black uppercase tracking-widest w-20 text-right">
                        {s}
                      </Text>
                    </HStack>
                  ))}
                </VStack>
              </VStack>

              {/* Corner accents */}
              <Box position="absolute" top={4} right={4} className="text-white/5">
                <Icon as={ShieldCheck} boxSize={32} />
              </Box>
            </Box>

            {/* Floating badge */}
            <Box
              className="premium-glass"
              position="absolute"
              top="-20px"
              right="-20px"
              borderRadius="20px"
              p={4}
              boxShadow="0 20px 40px rgba(0,30,60,0.12)"
            >
              <VStack gap={2} align="center">
                <Box
                  w={10}
                  h={10}
                  bg="#d1fae5"
                  borderRadius="10px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon as={ShieldCheck} className="text-emerald-600" boxSize={5} />
                </Box>
                <Text className="text-[10px] font-black text-navy-950 uppercase tracking-widest text-center">
                  Secured
                </Text>
              </VStack>
            </Box>

            {/* Floating latency badge */}
            <Box
              className="premium-glass"
              position="absolute"
              bottom="-16px"
              left="-20px"
              borderRadius="16px"
              px={4}
              py={3}
              boxShadow="0 12px 30px rgba(0,30,60,0.1)"
            >
              <HStack gap={2}>
                <Box w={2} h={2} borderRadius="full" bg="#0ea5e9" className="status-dot active" />
                <Text className="text-[10px] font-black text-navy-950 uppercase tracking-widest">
                  Real-time · 42ms
                </Text>
              </HStack>
            </Box>
          </GridItem>
        </Grid>
      </Container>

      {/* Features Strip */}
      <Box className="gradient-mesh border-t border-navy-50/80" py={16}>
        <Container maxW="container.xl">
          <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={6}>
            {features.map((f, i) => (
              <Box
                key={f.title}
                className="premium-card"
                p={6}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <HStack gap={4} align="start">
                  <Box
                    className="btn-primary"
                    p={2.5}
                    borderRadius="12px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexShrink={0}
                  >
                    <Icon as={f.icon} color="white" boxSize={4} />
                  </Box>
                  <VStack align="start" gap={1}>
                    <Text className="text-sm font-black text-navy-950 uppercase tracking-wider">{f.title}</Text>
                    <Text className="text-xs text-navy-500 leading-relaxed font-medium">{f.description}</Text>
                  </VStack>
                </HStack>
              </Box>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box as="footer" py={8} className="border-t border-navy-50/80 premium-glass" textAlign="center">
        <Text className="text-[10px] font-black uppercase tracking-[0.4em] text-navy-300">
          CoBALT Protocol Intelligence &copy; 2026 — Secure by Design
        </Text>
      </Box>
    </Box>
  );
}