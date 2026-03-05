'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { Archive, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { showErrorToast } from '@/lib/toast';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await authService.signin(email);
      const data = await res.json();

      if (res.ok) {
        router.push(`/auth/verify-otp?key=${data.key || ''}&email=${email}&purpose=SIGN_IN`);
      } else {
        showErrorToast((data as { message?: string }).message || 'Signin failed. Is your email correct?');
      }
    } catch (err) {
      showErrorToast('Failed to connect. Please check your connection.');
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
      {/* Decorative orbs */}
      <Box className="floating-orb" w="500px" h="500px" bg="rgba(14,165,233,0.06)" top="-150px" right="-100px" style={{ animationDuration: '9s' }} />
      <Box className="floating-orb" w="350px" h="350px" bg="rgba(0,30,60,0.05)" bottom="-80px" left="-60px" style={{ animationDuration: '12s', animationDelay: '-5s' }} />

      <Box
        className="premium-card animate-fade-up"
        w="full"
        maxW="460px"
        p={10}
        position="relative"
        zIndex={10}
      >
        {/* Logo & Brand */}
        <VStack mb={8} gap={4} align="center">
          <Box
            className="btn-primary"
            p={3}
            borderRadius="18px"
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
            boxShadow="0 8px 24px rgba(0,30,60,0.25)"
          >
            <Icon as={Archive} color="white" boxSize={6} />
          </Box>

          <VStack gap={1} textAlign="center">
            <HStack gap={2} className="text-navy-400">
              <Box w={8} h="1px" className="bg-navy-100" />
              <Text className="text-[10px] font-black uppercase tracking-[0.3em] text-navy-400">
                Identity Protocol
              </Text>
              <Box w={8} h="1px" className="bg-navy-100" />
            </HStack>
            <Heading size="2xl" className="text-navy-950 font-black tracking-tighter">
              Welcome Back
            </Heading>
            <Text className="text-navy-400 font-medium text-sm">
              Access your enterprise intelligence archive
            </Text>
          </VStack>
        </VStack>

        <form onSubmit={handleSubmit}>
          <VStack gap={5}>
            <VStack gap={2} align="start" w="full">
              <HStack gap={2} ml={1}>
                <Icon as={Mail} boxSize={3.5} className="text-navy-400" />
                <Text className="text-[10px] font-black uppercase tracking-widest text-navy-400">
                  Authorized Email
                </Text>
              </HStack>
              <Input
                type="email"
                placeholder="name@company.com"
                value={email}
                required
                className="premium-input w-full px-5 py-4 text-sm"
                onChange={(e) => setEmail(e.target.value)}
              />
            </VStack>

            <Button
              type="submit"
              disabled={loading}
              w="full"
              className="btn-primary py-4 rounded-[1.25rem] text-xs font-black uppercase tracking-[0.15em] flex items-center justify-center gap-3"
              opacity={loading ? 0.6 : 1}
            >
              {loading ? (
                <>
                  <Spinner size="sm" color="white" />
                  Verifying...
                </>
              ) : (
                <>
                  Authenticate Access
                  <Icon as={ArrowRight} boxSize={4} />
                </>
              )}
            </Button>
          </VStack>
        </form>

        <Box className="divider" my={8} />

        {/* Security note */}
        <HStack gap={3} className="bg-navy-50 rounded-2xl px-4 py-3 border border-navy-100/60 mb-6">
          <Icon as={ShieldCheck} boxSize={4} className="text-navy-400 flex-shrink-0" />
          <Text className="text-[10px] font-bold text-navy-400 leading-relaxed">
            Protected by AES-256 encryption. No password required — we&apos;ll send a secure OTP.
          </Text>
        </HStack>

        <VStack textAlign="center" gap={2}>
          <Text className="text-navy-300 text-xs font-bold uppercase tracking-wider">
            New to the platform?
          </Text>
          <Button
            onClick={() => router.push('/auth/signup')}
            variant="ghost"
            className="btn-ghost text-navy-950 font-black text-sm rounded-xl px-4 py-2"
          >
            Create your neural node identity →
          </Button>
        </VStack>
      </Box>
    </Box>
  );
}
