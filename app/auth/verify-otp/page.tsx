'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/services/auth.service';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Input,
  Spinner,
  Icon
} from '@chakra-ui/react';
import { Archive, Shield, ArrowRight } from 'lucide-react';
import { showErrorToast } from '@/lib/toast';

export default function VerifyOtpPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const key = searchParams.get('key') || '';
  const purpose = (searchParams.get('purpose') as 'SIGN_UP' | 'SIGN_IN') || 'SIGN_IN';

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

   try {
  const res = await authService.verifyOtp({
    key,
    otp,
    purpose,
  });

  if (res.ok) {
    // Server already set HttpOnly cookies
    await res.json().catch(() => ({}));

    router.push('/captures');
  } else {
    const errorData = await res.json().catch(() => ({}));
    showErrorToast(errorData.message || 'Invalid OTP. Please try again.');
  }
} catch {
  showErrorToast('Verification failed. Please check your connection.');
} finally {
  setLoading(false);
}
  };

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      className="gradient-mesh dot-grid"
      p={6}
      position="relative"
      overflow="hidden"
    >
      <Box className="floating-orb" w="400px" h="400px" bg="rgba(14,165,233,0.07)" top="-100px" right="-60px" style={{ animationDuration: '8s' }} />
      <Box className="floating-orb" w="300px" h="300px" bg="rgba(0,30,60,0.04)" bottom="-50px" left="-40px" style={{ animationDuration: '11s', animationDelay: '-4s' }} />

      <Box
        className="premium-card animate-fade-up"
        w="full"
        maxW="440px"
        p={10}
        position="relative"
        zIndex={10}
      >
        {/* Header */}
        <VStack mb={8} gap={4} align="center">
          <Box className="btn-primary" p={3} borderRadius="18px" display="inline-flex" alignItems="center" justifyContent="center" boxShadow="0 8px 24px rgba(0,30,60,0.25)">
            <Icon as={Shield} color="white" boxSize={6} />
          </Box>

          <VStack gap={1} textAlign="center">
            <HStack gap={2}>
              <Box w={8} h="1px" className="bg-navy-100" />
              <Text className="text-[10px] font-black uppercase tracking-[0.3em] text-navy-400">
                Transmission Verification
              </Text>
              <Box w={8} h="1px" className="bg-navy-100" />
            </HStack>
            <Heading size="2xl" className="text-navy-950 font-black tracking-tighter">
              Enter OTP
            </Heading>
            <Text className="text-navy-400 font-medium text-sm text-center px-4">
              Security code sent to{' '}
              <Text as="span" className="text-navy-950 font-black">
                {email}
              </Text>
            </Text>
          </VStack>
        </VStack>

        <form onSubmit={handleVerify}>
          <VStack gap={6}>
            {/* OTP input */}
            <Box
              className="bg-navy-50 rounded-2xl border border-navy-100/60 p-3"
              w="full"
            >
              <Input
                type="text"
                placeholder="000000"
                value={otp}
                required
                maxLength={6}
                className="w-full bg-white text-navy-950 text-center font-black border border-navy-100 rounded-xl"
                style={{ fontSize: '2.5rem', letterSpacing: '0.5em', padding: '20px', lineHeight: 1 }}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              />
            </Box>

            {/* Progress indicator */}
            <HStack w="full" justify="center" gap={1.5}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Box
                  key={i}
                  w="32px"
                  h="3px"
                  borderRadius="full"
                  bg={i < otp.length ? '#001e3c' : '#d9e2ec'}
                  transition="all 0.2s"
                />
              ))}
            </HStack>

            <Button
              type="submit"
              disabled={loading || otp.length < 4}
              w="full"
              className="btn-primary py-4 rounded-[1.25rem] text-xs font-black uppercase tracking-[0.15em] flex items-center justify-center gap-3"
              opacity={loading || otp.length < 4 ? 0.5 : 1}
            >
              {loading ? (
                <>
                  <Spinner size="sm" color="white" />
                  Syncing...
                </>
              ) : (
                <>
                  Authorize Node Access
                  <Icon as={ArrowRight} boxSize={4} />
                </>
              )}
            </Button>
          </VStack>
        </form>

        <Box className="divider" my={7} />

        <VStack textAlign="center" gap={2}>
          <Text className="text-navy-300 text-xs font-bold uppercase tracking-wider">
            No signal received?
          </Text>
          <Button
            type="button"
            onClick={() => router.back()}
            variant="ghost"
            className="btn-ghost text-navy-950 font-black text-sm rounded-xl px-4 py-2"
          >
            Retry Protocol Transmission →
          </Button>
        </VStack>
      </Box>
    </Box>
  );
}
