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
import { Archive, Mail, User, ArrowRight, Check } from 'lucide-react';
import { showErrorToast, showInfoToast } from '@/lib/toast';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      showInfoToast('Please agree to the terms and conditions');
      return;
    }
    setLoading(true);

    try {
      const res = await authService.signup({
        email,
        name,
        agreedTermsIds: ['67da79878e3c6d17540d5bbd'],
      });

      const data = await res.json();

      if (res.ok) {
        router.push(
          `/auth/verify-otp?key=${data.key || ''}&email=${email}&purpose=SIGN_UP`
        );
      } else {
        showErrorToast((data as { message?: string }).message || 'Signup failed. Please try again.');
      }
    } catch (err) {
      showErrorToast('Error connecting to authentication service');
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
      <Box className="floating-orb" w="450px" h="450px" bg="rgba(14,165,233,0.06)" top="-100px" right="-80px" style={{ animationDuration: '10s' }} />
      <Box className="floating-orb" w="300px" h="300px" bg="rgba(0,30,60,0.04)" bottom="-60px" left="-40px" style={{ animationDuration: '14s', animationDelay: '-6s' }} />

      <Box
        className="premium-card animate-fade-up"
        w="full"
        maxW="480px"
        p={10}
        position="relative"
        zIndex={10}
      >
        {/* Header */}
        <VStack mb={8} gap={4} align="center">
          <Box className="btn-primary" p={3} borderRadius="18px" display="inline-flex" alignItems="center" justifyContent="center" boxShadow="0 8px 24px rgba(0,30,60,0.25)">
            <Icon as={Archive} color="white" boxSize={6} />
          </Box>

          <VStack gap={1} textAlign="center">
            <HStack gap={2}>
              <Box w={8} h="1px" className="bg-navy-100" />
              <Text className="text-[10px] font-black uppercase tracking-[0.3em] text-navy-400">
                Platform Onboarding
              </Text>
              <Box w={8} h="1px" className="bg-navy-100" />
            </HStack>
            <Heading size="2xl" className="text-navy-950 font-black tracking-tighter">
              Create Account
            </Heading>
            <Text className="text-navy-400 font-medium text-sm">
              Join the CoBALT intelligence network
            </Text>
          </VStack>
        </VStack>

        <form onSubmit={handleSubmit}>
          <VStack gap={5}>
            {/* Name */}
            <VStack gap={2} align="start" w="full">
              <HStack gap={2} ml={1}>
                <Icon as={User} boxSize={3.5} className="text-navy-400" />
                <Text className="text-[10px] font-black uppercase tracking-widest text-navy-400">
                  Full Name
                </Text>
              </HStack>
              <Input
                type="text"
                placeholder="John Doe"
                value={name}
                required
                className="premium-input w-full px-5 py-4 text-sm"
                onChange={(e) => setName(e.target.value)}
              />
            </VStack>

            {/* Email */}
            <VStack gap={2} align="start" w="full">
              <HStack gap={2} ml={1}>
                <Icon as={Mail} boxSize={3.5} className="text-navy-400" />
                <Text className="text-[10px] font-black uppercase tracking-widest text-navy-400">
                  Email Address
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

            {/* Terms checkbox */}
            <Box
              display="flex"
              alignItems="flex-start"
              gap={3}
              py={3}
              px={4}
              cursor="pointer"
              className="bg-navy-50 rounded-2xl border border-navy-100/60 transition-all hover:border-navy-200"
              onClick={() => setAgreed(!agreed)}
              w="full"
            >
              <Box
                mt={0.5}
                h={5}
                w={5}
                borderRadius="8px"
                border="2px solid"
                borderColor={agreed ? '#001e3c' : '#9fb3c8'}
                bg={agreed ? '#001e3c' : 'white'}
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexShrink={0}
                transition="all 0.2s"
              >
                {agreed && (
                  <Icon as={Check} color="white" boxSize={3} strokeWidth={3} />
                )}
              </Box>
              <Text className="text-xs text-navy-500 leading-snug font-medium cursor-pointer">
                I acknowledge and accept the{' '}
                <Text as="span" className="text-navy-950 font-bold">Privacy Policy</Text>{' '}
                and{' '}
                <Text as="span" className="text-navy-950 font-bold">Terms of Service</Text>
              </Text>
            </Box>

            <Button
              type="submit"
              disabled={loading || !agreed}
              w="full"
              className="btn-primary py-4 rounded-[1.25rem] text-xs font-black uppercase tracking-[0.15em] flex items-center justify-center gap-3"
              opacity={loading || !agreed ? 0.5 : 1}
            >
              {loading ? (
                <>
                  <Spinner size="sm" color="white" />
                  Initializing...
                </>
              ) : (
                <>
                  Get Started
                  <Icon as={ArrowRight} boxSize={4} />
                </>
              )}
            </Button>
          </VStack>
        </form>

        <Box className="divider" my={7} />

        <VStack textAlign="center" gap={2}>
          <Text className="text-navy-300 text-xs font-bold uppercase tracking-wider">
            Already have an account?
          </Text>
          <Button
            onClick={() => router.push('/auth/signin')}
            variant="ghost"
            className="btn-ghost text-navy-950 font-black text-sm rounded-xl px-4 py-2"
          >
            Log in to your workspace →
          </Button>
        </VStack>
      </Box>
    </Box>
  );
}
