'use client';

import { useState, useEffect } from 'react';
import { meService } from '@/services/me.service';
import { setDevAuth, isAuthenticated } from '@/lib/auth';
import { API_BASE_URL } from '@/lib/config';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Badge,
  Code,
  Container
} from '@chakra-ui/react';

export default function DebugPage() {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState(false);

  useEffect(() => {
    setAuthStatus(isAuthenticated());
  }, []);

  const fetchUserInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Attempting to fetch user info...');
      const me = await meService.getMyInfo();
      console.log('User info received:', me);
      setUserInfo(me);
    } catch (err: any) {
      console.error('Error fetching user info:', err);
      setError(err.message || 'Failed to fetch user info');
    } finally {
      setLoading(false);
    }
  };

  const setDevAuthAndFetch = async () => {
    setDevAuth();
    setAuthStatus(true);
    // Wait a bit then fetch
    setTimeout(fetchUserInfo, 100);
  };

  return (
    <Box minH="100vh" bg="#f8fafc" display="flex" alignItems="center" justifyContent="center" p={6}>
      <Container maxW="4xl">
        <Box
          bg="white"
          border="1px solid"
          borderColor="gray.100"
          rounded="3xl"
          boxShadow="2xl"
          p={{ base: 6, md: 8 }}
        >
          <VStack gap={6} align="start">
            <Heading size="lg" className="text-navy-950 font-black tracking-tight">
              Debug Console
            </Heading>
            
            {/* Authentication Status */}
            <Box p={4} bg="gray.50" rounded="2xl" w="full" border="1px solid" borderColor="gray.100">
              <Heading size="sm" mb={3} className="text-navy-900 font-black tracking-tight">
                Authentication Status
              </Heading>
              <HStack gap={2} flexWrap="wrap">
                <Badge
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    authStatus ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  {authStatus ? 'Authenticated' : 'Not Authenticated'}
                </Badge>
                <Text fontSize="sm" color="gray.600">
                  API Base URL: {API_BASE_URL}
                </Text>
              </HStack>
              {!authStatus && (
                <Button
                  mt={4}
                  onClick={setDevAuthAndFetch}
                  className="bg-navy-950 hover:bg-navy-900 text-white px-4 py-2 rounded-xl text-xs font-black tracking-widest uppercase"
                  size="sm"
                >
                  Set Dev Auth & Fetch User Info
                </Button>
              )}
            </Box>

            {/* User Info */}
            <Box p={4} bg="gray.50" rounded="2xl" w="full" border="1px solid" borderColor="gray.100">
              <HStack justify="space-between" mb={3}>
                <Heading size="sm" className="text-navy-900 font-black tracking-tight">
                  User Information
                </Heading>
                <Button
                  onClick={fetchUserInfo}
                  isLoading={loading}
                  disabled={!authStatus}
                  className="bg-navy-50 hover:bg-navy-100 text-navy-900 px-3 py-1.5 rounded-xl text-xs font-semibold"
                  size="sm"
                >
                  Fetch User Info
                </Button>
              </HStack>
              
              {error && (
                <Box p={3} bg="red.50" rounded="lg" mb={3}>
                  <Text color="red.600" fontSize="sm">Error: {error}</Text>
                </Box>
              )}
              
              {userInfo ? (
                <VStack align="start" gap={2} fontSize="sm">
                  <Text><strong>ID:</strong> {userInfo.id}</Text>
                  <Text><strong>Email:</strong> {userInfo.email}</Text>
                  <Text><strong>Name:</strong> {userInfo.name}</Text>
                  <Text>
                    <strong>Organization ID:</strong> 
                    {userInfo.organizationId ? (
                      <Badge ml={2} className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-xs">
                        {userInfo.organizationId}
                      </Badge>
                    ) : (
                      <Badge ml={2} className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full text-xs">
                        Not Found
                      </Badge>
                    )}
                  </Text>
                  <Box mt={2} w="full">
                    <Text fontSize="xs" fontWeight="bold" mb={1}>
                      Full Response
                    </Text>
                    <Code
                      p={3}
                      bg="white"
                      rounded="xl"
                      fontSize="xs"
                      whiteSpace="pre-wrap"
                      className="custom-scrollbar max-h-64 block"
                    >
                      {JSON.stringify(userInfo, null, 2)}
                    </Code>
                  </Box>
                </VStack>
              ) : (
                <Text color="gray.500" fontSize="sm">
                  No user information available yet. Authenticate and fetch to inspect payloads.
                </Text>
              )}
            </Box>

            {/* Instructions */}
            <Box p={4} bg="navy-950" rounded="2xl" w="full" color="white">
              <Heading size="sm" mb={2} className="font-black tracking-tight">
                Troubleshooting Steps
              </Heading>
              <VStack align="start" gap={1} fontSize="xs" className="text-white/80">
                <Text>1. If not authenticated, use &quot;Set Dev Auth&quot; to seed local auth.</Text>
                <Text>2. Click &quot;Fetch User Info&quot; to call the /me endpoint.</Text>
                <Text>3. Confirm an organization ID is present in the response payload.</Text>
                <Text>4. If missing, verify your backend user-to-organization mapping.</Text>
                <Text>5. Inspect the browser console and network tab for server errors.</Text>
              </VStack>
            </Box>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
}
