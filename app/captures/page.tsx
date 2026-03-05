'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { captureService, Capture } from '@/services/capture.service';
import { useCaptureSSE } from '@/hooks/useCaptureSSE';
import { meService } from '@/services/me.service';
import { authService } from '@/services/auth.service';
import AuthGuard from '@/components/AuthGuard';
import CaptureHeader from '@/components/captures/CaptureHeader';
import CaptureTitleRow from '@/components/captures/CaptureTitleRow';
import CaptureBanners from '@/components/captures/CaptureBanners';
import CaptureEmptyState from '@/components/captures/CaptureEmptyState';
import CaptureGrid from '@/components/captures/CaptureGrid';
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Spinner,
  Container,
} from '@chakra-ui/react';

const ITEM_HEIGHT = 120;

function debounce<T extends (...args: any[]) => void>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout;
  return ((...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}

export default function CaptureListPage() {
  const [captures, setCaptures] = useState<Capture[]>([]);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [pendingCaptures, setPendingCaptures] = useState<Capture[]>([]);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<number>(0);
  const [isMounted, setIsMounted] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const observerTargetRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const isScrolledDown = () => (scrollContainerRef.current?.scrollTop || 0) >= 50;

  const handleSignOut = async () => {
    try {
      await authService.signout();
      router.push('/auth/signin');
    } catch (err) {
      router.push('/auth/signin');
    }
  };

  const handleScroll = useCallback(
    debounce(() => {
      if (scrollContainerRef.current) {
        const scrollTop = scrollContainerRef.current.scrollTop;
        sessionStorage.setItem('captureListScrollPos', scrollTop.toString());
        const containerHeight = scrollContainerRef.current.clientHeight;
        const start = Math.floor(scrollTop / ITEM_HEIGHT);
        const end = Math.min(start + Math.ceil(containerHeight / ITEM_HEIGHT) + 5, captures.length);
        setVisibleRange({ start: Math.max(0, start), end });
      }
    }, 100),
    [captures.length]
  );

  useEffect(() => {
    const init = async () => {
      try {
        const storedOrgId = typeof window !== 'undefined' ? localStorage.getItem('orgId') : null;
        const storedMember = typeof window !== 'undefined' ? localStorage.getItem('memberData') : null;

        if (storedOrgId) setOrgId(storedOrgId);
        if (storedMember) {
          try {
            const member = JSON.parse(storedMember);
            if (member?.name && member?.email) setUser({ name: member.name, email: member.email });
          } catch {
            // ignore parse errors
          }
        }

        if (storedOrgId && storedMember) return;

        const me = await meService.getMyInfo();
        const orgIdToUse = storedOrgId || me.member.org.id;
        localStorage.setItem('orgId', orgIdToUse);
        localStorage.setItem('memberData', JSON.stringify(me.member));
        setUser({ name: me.member.name, email: me.member.email });
        setOrgId(orgIdToUse);
      } catch (err) {
        setUser(null);
      }
    };
    init();
    setIsMounted(true);
    setLastRefresh(Date.now());
    const savedPos = sessionStorage.getItem('captureListScrollPos');
    if (savedPos && scrollContainerRef.current) {
      setTimeout(() => {
        if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = parseInt(savedPos, 10);
      }, 100);
    }
  }, []);

  useEffect(() => {
    if (!orgId) return;
    fetchCaptures(true);
  }, [orgId]);

  const fetchCaptures = async (initial = false) => {
    if (!orgId || loading || (!hasMore && !initial)) return;
    setLoading(true);
    setError(null);
    try {
      const res = await captureService.getCaptures(orgId, initial ? undefined : cursor);
      if (res.ok) {
        const data = await res.json();
        const newItems = Array.isArray(data.content) ? data.content : [];
        setCaptures(prev => initial ? newItems : [...prev, ...newItems]);
        setCursor(data.nextCursor);
        setHasMore(!!data.nextCursor);
        setRetryCount(0);
      } else {
        if (res.status === 401) {
          setError('Session expired. Redirecting...');
          setTimeout(() => router.push('/auth/signin'), 2000);
        } else {
          setError(`Failed to load (${res.status})`);
        }
        setHasMore(false);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Network error';
      if (retryCount < 3) {
        setRetryCount(prev => prev + 1);
        setError(`Retrying... (${retryCount + 1}/3)`);
        setTimeout(() => fetchCaptures(initial), Math.pow(2, retryCount) * 1000);
        return;
      }
      setError(msg.includes('Network') ? 'Network connection failed.' : 'Server unavailable.');
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const handleNewCapture = useCallback((capture: Capture) => {
    if (isScrolledDown()) {
      setPendingCaptures(prev => {
        if (prev.some(c => c.id === capture.id)) return prev;
        return [capture, ...prev];
      });
      return;
    }

    setCaptures(prev => {
      if (prev.some(c => c.id === capture.id)) return prev;
      return [capture, ...prev];
    });
  }, []); // isScrolledDown reads from a ref, so it's stable enough for here if we don't mind it being stale-ish (though ref.current is always current)

  const handleUpdateCapture = useCallback((updated: Capture) => {
    setCaptures(prev => prev.map(c => c.id === updated.id ? updated : c));
    setPendingCaptures(prev => prev.map(c => c.id === updated.id ? updated : c));
  }, []);

  useCaptureSSE({
    orgId,
    onNewCapture: handleNewCapture,
    onUpdateCapture: handleUpdateCapture
  });

  const refreshCaptures = async () => {
    if (!orgId || isRefreshing) return;
    setIsRefreshing(true);
    try {
      setCaptures([]); setCursor(undefined); setHasMore(true); setError(null); setRetryCount(0);
      setPendingCaptures([]);
      await fetchCaptures(true);
      setLastRefresh(Date.now());
    } finally {
      setIsRefreshing(false);
    }
  };

  const loadingRef = useRef(loading);
  useEffect(() => { loadingRef.current = loading; }, [loading]);

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const [target] = entries;
    if (target.isIntersecting && hasMore && !loadingRef.current) {
      setTimeout(() => { if (hasMore && !loadingRef.current) fetchCaptures(); }, 200);
    }
  }, [hasMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.1, rootMargin: '200px' });
    const currentTarget = observerTargetRef.current;
    if (currentTarget) observer.observe(currentTarget);
    return () => { if (currentTarget) observer.unobserve(currentTarget); observer.disconnect(); };
  }, [handleObserver]);

  const filteredCaptures = captures.filter(c =>
    searchQuery === '' || c.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewLatest = () => {
    if (pendingCaptures.length > 0) {
      const pendingToMerge = pendingCaptures;
      setCaptures(prev => {
        const existingIds = new Set(prev.map(c => c.id));
        const toAdd = pendingToMerge.filter(c => !existingIds.has(c.id));
        return [...toAdd, ...prev];
      });
      setPendingCaptures([]);
    }
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AuthGuard>
      <Box h="100vh" display="flex" flexDirection="column" overflow="hidden" className="gradient-mesh">
        {/* Header */}
        <CaptureHeader
          user={user}
          showUserMenu={showUserMenu}
          setShowUserMenu={setShowUserMenu}
          isRefreshing={isRefreshing}
          lastRefresh={lastRefresh}
          isMounted={isMounted}
          onRefresh={refreshCaptures}
          onSignOut={handleSignOut}
        />

        {/* Main content */}
        <Box
          flex={1}
          overflowY="auto"
          className="custom-scrollbar"
          ref={scrollContainerRef}
          onScroll={handleScroll}
        >
          <Container maxW="7xl" py={8} px={{ base: 4, md: 8 }}>
            <VStack gap={5} width="full" align="stretch">

              <CaptureTitleRow
                captureCount={captures.length}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />

              <CaptureBanners
                error={error}
                onRetry={() => {
                  setError(null);
                  setRetryCount(0);
                  fetchCaptures(true);
                }}
                pendingCapturesCount={pendingCaptures.length}
                onViewLatest={handleViewLatest}
              />

              {/* Empty state */}
              {captures.length === 0 && !loading && !error && (
                <CaptureEmptyState onStartFirstScan={() => router.push('/captures/scan')} />
              )}

              <CaptureGrid
                captures={captures}
                filteredCaptures={filteredCaptures}
                searchQuery={searchQuery}
                visibleRange={visibleRange}
                itemHeight={ITEM_HEIGHT}
                loading={loading}
                onCaptureClick={(id) => router.push(`/captures/${id}`)}
              />
            </VStack>

            {/* Infinite scroll trigger */}
            <Flex ref={observerTargetRef} h={24} align="center" justify="center" mt={4}>
              {loading ? (
                <HStack gap={2} className="text-navy-400">
                  <Spinner size="xs" />
                  <Text className="text-xs font-bold uppercase tracking-widest">Loading more...</Text>
                </HStack>
              ) : !hasMore && captures.length > 0 ? (
                <VStack gap={2}>
                  <Box className="divider" w={16} />
                  <Text className="text-[10px] text-navy-300 font-black uppercase tracking-[0.3em]">
                    End of Stream
                  </Text>
                </VStack>
              ) : null}
            </Flex>
          </Container>
        </Box>
      </Box>
    </AuthGuard>
  );
}
