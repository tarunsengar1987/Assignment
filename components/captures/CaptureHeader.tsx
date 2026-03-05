'use client';

import { useRouter } from 'next/navigation';
import { Archive, ChevronRight, LogOut, Plus, RefreshCw } from 'lucide-react';
import { Box, Button, Flex, Heading, HStack, Icon, Text, VStack } from '@chakra-ui/react';

export type CaptureHeaderUser = {
  name: string;
  email: string;
};

type CaptureHeaderProps = {
  user: CaptureHeaderUser | null;
  showUserMenu: boolean;
  setShowUserMenu: (next: boolean) => void;
  isRefreshing: boolean;
  lastRefresh: number;
  isMounted: boolean;
  onRefresh: () => void;
  onSignOut: () => void;
};

export default function CaptureHeader({
  user,
  showUserMenu,
  setShowUserMenu,
  isRefreshing,
  lastRefresh,
  isMounted,
  onRefresh,
  onSignOut,
}: CaptureHeaderProps) {
  const router = useRouter();

  return (
    <Box
      as="header"
      position="sticky"
      top={0}
      zIndex={100}
      px={{ base: 4, md: 8 }}
      py={3}
      className="premium-glass border-b border-navy-100/40"
    >
      <Flex maxW="7xl" mx="auto" justify="space-between" align="center">
        {/* Brand */}
        <HStack gap={3}>
          <Box
            className="btn-primary"
            p={2}
            borderRadius="12px"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Icon as={Archive} color="white" boxSize={4.5} />
          </Box>
          <VStack align="start" gap={0}>
            <Heading size="sm" className="text-navy-950 font-black tracking-tighter leading-none">
              CoBALT
            </Heading>
            <Text className="text-[9px] font-black text-navy-400 uppercase tracking-[0.3em] leading-none">
              Registry
            </Text>
          </VStack>
        </HStack>

        {/* Search (desktop) */}

        {/* Right actions */}
        <HStack gap={3}>
          <Button
            onClick={onRefresh}
            variant="ghost"
            className="btn-ghost rounded-xl p-2"
            title={isMounted ? `Refreshed: ${new Date(lastRefresh).toLocaleTimeString()}` : ''}
          >
            <Icon as={RefreshCw} boxSize={4} className={isRefreshing ? 'animate-spin' : ''} />
          </Button>

          {user ? (
            <Box position="relative">
              <Button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2.5 bg-navy-950 hover:bg-navy-800 border border-white/10 rounded-2xl transition-all shadow-lg"
                padding={6}
              >
                <Box className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                  <Text className="text-[10px] font-black text-navy-950">
                    {user.name
                      ? user.name
                          .split(' ')
                          .map(n => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)
                      : 'U'}
                  </Text>
                </Box>
                <VStack gap={0} align="start" display={{ base: 'none', md: 'flex' }}>
                  <Text className="text-[11px] font-black text-white leading-none uppercase tracking-wide">
                    {user.name || 'User'}
                  </Text>
                  <Text className="text-[9px] text-navy-300 font-bold max-w-[90px] truncate">{user.email}</Text>
                </VStack>
                <Icon
                  as={ChevronRight}
                  boxSize={3}
                  className={`text-white/50 transition-transform ${showUserMenu ? 'rotate-90' : ''}`}
                />
              </Button>

              {showUserMenu && (
                <Box
                  position="absolute"
                  top="calc(100% + 8px)"
                  right={0}
                  padding={15}
                  className="bg-white rounded-2xl shadow-2xl border border-navy-100/40 p-2 min-w-[210px] z-50"
                >
                  <VStack gap={1} align="stretch">
                    <Box className="px-4 py-3 border-b border-navy-50 mb-1">
                      <Text className="text-[9px] font-black text-navy-300 uppercase tracking-widest mb-0.5">
                        Authenticated As
                      </Text>
                      <Text className="text-sm font-black text-navy-950 truncate">{user.name}</Text>
                      <Text className="text-[10px] text-navy-400 truncate">{user.email}</Text>
                    </Box>
                    <Button
                      onClick={onSignOut}
                      className="flex items-center justify-start gap-3 w-full px-4 py-2.5 hover:bg-rose-50 text-rose-500 rounded-xl transition-all group"
                      variant="ghost"
                    >
                      <Icon as={LogOut} boxSize={3.5} />
                      <Text className="text-xs font-black uppercase tracking-widest">Sign Out</Text>
                    </Button>
                  </VStack>
                </Box>
              )}
            </Box>
          ) : (
            <Box className="w-8 h-8 rounded-full skeleton" />
          )}

          <Button
            className="btn-primary px-5 py-2.5 rounded-2xl flex items-center gap-2 text-[11px] font-black uppercase tracking-wider"
            onClick={() => router.push('/captures/scan')}
          >
            <Icon as={Plus} boxSize={3.5} />
            <Text display={{ base: 'none', sm: 'block' }}>New Scan</Text>
          </Button>
        </HStack>
      </Flex>
    </Box>
  );
}
