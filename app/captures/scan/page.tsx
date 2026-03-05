'use client';

import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { meService } from '@/services/me.service';
import { authService } from '@/services/auth.service';
import { captureService } from '@/services/capture.service';
import AuthGuard from '@/components/AuthGuard';
import {
  Box,
  Flex,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Icon,
  Spinner,
} from '@chakra-ui/react';
import { ChevronLeft, Check, Archive, LogOut, ChevronRight, Upload, Camera } from 'lucide-react';
import React from 'react';
import { showErrorToast, showSuccessToast } from '@/lib/toast';

function normalizeOrgId(raw: string | null): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (/^[a-f0-9]{12}$/i.test(trimmed)) return trimmed;
  if (/^[a-f0-9]{24}$/i.test(trimmed)) return trimmed.slice(-12);
  const match = trimmed.match(/\/orgs\/([a-f0-9]{12,24})/i);
  if (match?.[1]) {
    const candidate = match[1];
    if (/^[a-f0-9]{12}$/i.test(candidate)) return candidate;
    if (/^[a-f0-9]{24}$/i.test(candidate)) return candidate.slice(-12);
  }
  return null;
}

export default function ScanPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [loading, setLoading] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [rawInfo, setRawInfo] = useState<unknown>(null);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [showCameraView, setShowCameraView] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleSignOut = async () => {
    try { await authService.signout(); } finally { router.push('/auth/signin'); }
  };

  useEffect(() => {
    setIsClient(true);
    setShowCameraView(true);
    if (typeof window !== 'undefined' && navigator.mediaDevices) startCamera();

    const fetchUser = async () => {
      try {
        const storedOrgIdRaw = typeof window !== 'undefined' ? localStorage.getItem('orgId') : null;
        const storedOrgId = normalizeOrgId(storedOrgIdRaw);
        const storedMember = typeof window !== 'undefined' ? localStorage.getItem('memberData') : null;
        const storedWorkId = typeof window !== 'undefined' ? localStorage.getItem('workId') : null;

        if (storedMember) {
          try {
            const member = JSON.parse(storedMember);
            if (member?.name && member?.email) setUser({ name: member.name, email: member.email });
          } catch {
            // ignore parse errors
          }
        }
        if (storedOrgId) {
          setOrgId(storedOrgId);
        } else if (storedOrgIdRaw) {
          localStorage.removeItem('orgId');
        }
        if (storedOrgId && storedMember && storedWorkId) return;

        const me = await meService.getMyInfo();
        setUser({ name: me.member.name, email: me.member.email });
        const orgIdToUse = storedOrgId || normalizeOrgId(me.member.org.id) || me.member.org.id;
        const workIdToUse = me.myEngagingWork?.id || storedWorkId || null;
        if (typeof window !== 'undefined') {
          localStorage.setItem('orgId', orgIdToUse);
          localStorage.setItem('memberData', JSON.stringify(me.member));
          if (workIdToUse) localStorage.setItem('workId', workIdToUse);
        }
        setOrgId(orgIdToUse);
      } catch (err) {
        setOrgId(null); setUser(null);
      }
    };

    if (isClient) fetchUser();
    return () => stopCamera();
  }, [isClient]);

  const startCamera = async () => {
    setCameraError(null);
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera not supported. Please use file upload.');
      return;
    }
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
    } catch (err: any) {
      const msgs: Record<string, string> = {
        NotAllowedError: 'Camera permission denied. Please allow access and refresh.',
        NotFoundError: 'No camera found on your device.',
        NotReadableError: 'Camera is in use by another application.',
      };
      setCameraError(msgs[err.name] || 'Could not access camera.');
    }
  };

  const stopCamera = () => {
    if (stream) stream.getTracks().forEach(t => t.stop());
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video.videoWidth === 0) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    setCapturedImage(canvas.toDataURL('image/jpeg'));
    stopCamera();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { showErrorToast('Please select an image file'); return; }
    if (file.size > 10 * 1024 * 1024) { showErrorToast('File must be less than 10MB'); return; }
    setUploadFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => { setCapturedImage(ev.target?.result as string); stopCamera(); };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    const orgIdRaw = typeof window !== 'undefined' ? localStorage.getItem('orgId') : null;
    const orgId = normalizeOrgId(orgIdRaw);
    let workId = typeof window !== 'undefined' ? localStorage.getItem('workId') : null;
    if (!orgId) {
      if (typeof window !== 'undefined') localStorage.removeItem('orgId');
      showErrorToast('Organization ID is invalid or missing. Please refresh.');
      return;
    }

    if (!workId) {
      try {
        const me = await meService.getMyInfo();
        workId = me.myEngagingWork?.id || null;
        if (workId && typeof window !== 'undefined') {
          localStorage.setItem('workId', workId);
        }
      } catch {
        // ignore workId lookup errors; backend might accept scans without work-Id
      }
    }
    if (!uploadFile && !capturedImage) { showErrorToast('No image to scan.'); return; }

    try {
      setLoading(true);
      let imageBlob: Blob;
      let fileName = 'capture.jpg';
      if (uploadFile) { imageBlob = uploadFile; fileName = uploadFile.name; }
      else { imageBlob = await (await fetch(capturedImage!)).blob(); }

      const res = await captureService.scanCard(orgId, imageBlob, workId || undefined);
      if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);

      const data = await res.json();
      const newCapture = data.content?.[0] ?? data;
      setRawInfo(newCapture);

      if (newCapture?.id) router.push(`/captures/${newCapture.id}`);
      setCapturedImage(null); setUploadFile(null); setCameraError(null);
      startCamera();
    } catch (error) {
      showErrorToast(`Scan failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      retake();
    } finally {
      setLoading(false);
    }
  };

  const retake = () => {
    setCapturedImage(null); setUploadFile(null); setRawInfo(null); setCameraError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    stopCamera();
    setTimeout(startCamera, 100);
  };

  return (
    <AuthGuard>
      <Box minH="100vh" className="gradient-mesh" display="flex" flexDirection="column" alignItems="center" p={{ base: 4, md: 6 }}>
        <Box w="full" maxW="3xl" display="flex" flexDirection="column" gap={6}>

          {/* Header */}
          <Box className="premium-glass rounded-[1.5rem] px-5 py-3.5 shadow-sm">
            <Flex justify="space-between" align="center" padding={15}>
              {/* Back */}
              <Button
                onClick={() => router.push('/captures')}
                className="btn-primary flex items-center gap-2 py-2.5 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest"
              >
                <Icon as={ChevronLeft} boxSize={3.5} />
                Registry
              </Button>

              {/* Title */}
              <VStack textAlign="center" gap={0}>
                <HStack gap={2}>
                  <Box w={1.5} h={1.5} borderRadius="full" bg="#0ea5e9" className="animate-pulse" style={{ boxShadow: '0 0 8px rgba(14,165,233,0.8)' }} />
                  <Heading size="sm" className="text-navy-950 font-black tracking-tight uppercase">
                    Intelligence Capture
                  </Heading>
                </HStack>
                <Text className="text-[9px] font-black uppercase tracking-[0.35em] text-navy-400">
                  Neural Sync Protocol
                </Text>
              </VStack>

              {/* User menu */}
              <Box minW="120px" display="flex" justifyContent="flex-end">
                {/* {user ? (
                  <Box position="relative">
                    <Button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 bg-navy-950 hover:bg-navy-800 border border-white/10 px-2.5 py-1.5 rounded-2xl transition-all shadow-lg"
                    >
                      <Box className="w-7 h-7 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                        <Text className="text-[10px] font-black text-navy-950">
                          {user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                        </Text>
                      </Box>
                      <Icon as={ChevronRight} boxSize={3} className={`text-white/50 transition-transform ${showUserMenu ? 'rotate-90' : ''}`} />
                    </Button>
                    {showUserMenu && (
                      <Box position="absolute" top="calc(100% + 8px)" right={0}
                        className="bg-white rounded-2xl shadow-2xl border border-navy-100/40 p-2 min-w-[200px] z-[200]"
                      >
                        <VStack gap={1} align="stretch">
                          <Box className="px-4 py-3 border-b border-navy-50">
                            <Text className="text-[9px] font-black text-navy-300 uppercase tracking-widest mb-0.5">Authenticated As</Text>
                            <Text className="text-sm font-black text-navy-950 truncate">{user.name}</Text>
                          </Box>
                          <Button onClick={handleSignOut} className="flex items-center justify-start gap-3 w-full px-4 py-2.5 hover:bg-rose-50 text-rose-500 rounded-xl" variant="ghost">
                            <Icon as={LogOut} boxSize={3.5} />
                            <Text className="text-xs font-black uppercase tracking-widest">Sign Out</Text>
                          </Button>
                        </VStack>
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Box className="w-8 h-8 rounded-full skeleton" />
                )} */}
              </Box>
            </Flex>
          </Box>

          {/* Camera / Preview Area */}
          <Box
            position="relative"
            className="w-full bg-navy-950 overflow-hidden shadow-2xl shadow-navy-950/30"
            borderRadius="2.5rem"
            border="10px solid white"
            style={{ aspectRatio: '4/3' }}
          >
            {capturedImage ? (
              <img src={capturedImage} alt="Captured" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : cameraError ? (
              <Flex direction="column" align="center" justify="center" h="full" p={8} textAlign="center" gap={5}>
                <Box className="w-16 h-16 bg-accent-blue/10 rounded-3xl flex items-center justify-center">
                  <Icon as={Upload} className="text-accent-blue" boxSize={8} />
                </Box>
                <VStack gap={2}>
                  <Text className="text-white font-black text-lg">File Upload Mode</Text>
                  <Text className="text-white/50 text-sm leading-relaxed max-w-xs">
                    Camera not available. Upload a business card image to extract contact data.
                  </Text>
                </VStack>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-accent-blue hover:bg-sky-500 text-white font-black py-3 px-7 rounded-2xl transition-all shadow-lg text-sm"
                >
                  <Icon as={Upload} boxSize={4} mr={2} />
                  Choose File
                </Button>
              </Flex>
            ) : isClient && showCameraView ? (
              <>
                <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} className="opacity-90" />
                {/* HUD */}
                <Box position="absolute" inset={0} pointerEvents="none" display="flex" alignItems="center" justifyContent="center">
                  <Box className="w-4/5 h-3/5 border border-white/10 rounded-3xl relative overflow-hidden">
                    <Box className="scanner-line" />
                    <Box className="absolute -top-1 -left-1 w-10 h-10 border-t-[3px] border-l-[3px] border-accent-blue rounded-tl-2xl" style={{ boxShadow: '0 0 15px rgba(14,165,233,0.5)' }} />
                    <Box className="absolute -top-1 -right-1 w-10 h-10 border-t-[3px] border-r-[3px] border-accent-blue rounded-tr-2xl" style={{ boxShadow: '0 0 15px rgba(14,165,233,0.5)' }} />
                    <Box className="absolute -bottom-1 -left-1 w-10 h-10 border-b-[3px] border-l-[3px] border-accent-blue rounded-bl-2xl" style={{ boxShadow: '0 0 15px rgba(14,165,233,0.5)' }} />
                    <Box className="absolute -bottom-1 -right-1 w-10 h-10 border-b-[3px] border-r-[3px] border-accent-blue rounded-br-2xl" style={{ boxShadow: '0 0 15px rgba(14,165,233,0.5)' }} />
                  </Box>
                </Box>
                {/* Controls */}
                <Flex position="absolute" bottom={8} insetX={0} justifyContent="center" gap={4} alignItems="center">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white/90 hover:bg-white text-navy-950 font-bold py-3 px-5 rounded-2xl flex items-center gap-2 shadow-lg text-sm"
                  >
                    <Icon as={Upload} boxSize={4} />
                    Upload
                  </Button>
                  <Button
                    onClick={capturePhoto}
                    className="w-[72px] h-[72px] bg-white rounded-full shadow-2xl hover:scale-105 active:scale-90 transition-all"
                    p={0}
                  >
                    <Box className="w-full h-full rounded-full flex items-center justify-center p-2">
                      <Box className="w-full h-full rounded-full border-2 border-navy-950 flex items-center justify-center">
                        <Box className="w-[80%] h-[80%] rounded-full bg-navy-950" />
                      </Box>
                    </Box>
                  </Button>
                </Flex>
              </>
            ) : null}

            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />
          </Box>

          {/* Actions */}
          {capturedImage && !rawInfo && (
            <Flex gap={4} w="full">
              <Button
                onClick={retake}
                className="flex-1 bg-white hover:bg-navy-50 text-navy-600 font-black py-5 rounded-[1.5rem] border border-navy-100 transition-all shadow-sm uppercase tracking-widest text-xs"
              >
                Retake
              </Button>
              <Button
                onClick={handleUpload}
                disabled={loading}
                className="flex-[2] btn-primary py-5 rounded-[1.5rem] flex items-center justify-center gap-3 uppercase tracking-widest text-xs pulse-glow"
                opacity={loading ? 0.7 : 1}
              >
                {loading ? (
                  <><Spinner size="sm" color="white" /><span>Synchronizing...</span></>
                ) : (
                  <><span>Finalize Capture</span><Icon as={Check} boxSize={5} strokeWidth={3} /></>
                )}
              </Button>
            </Flex>
          )}

          {/* Results */}
          {!!rawInfo && (
            <Box className="premium-card p-8 animate-fade-up">
              <VStack gap={6} align="stretch">
                <HStack gap={3}>
                  <Box className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" style={{ boxShadow: '0 0 10px rgba(16,185,129,0.5)' }} />
                  <Text className="text-[11px] font-black uppercase tracking-[0.4em] text-emerald-600">Sync Success</Text>
                </HStack>

                <Heading size="xl" className="text-navy-950 font-black tracking-tight uppercase">Identity Matrix Extracted</Heading>

                <Box className="code-block p-6 relative overflow-hidden">
                  <Box className="absolute -top-4 -right-4 opacity-5">
                    <Icon as={Archive} boxSize={28} className="text-white" />
                  </Box>
                  <Box as="pre" className="text-[13px] font-mono text-blue-100 leading-relaxed overflow-x-auto max-h-[300px] custom-scrollbar">
                    {JSON.stringify(rawInfo, null, 2)}
                  </Box>
                </Box>

                <Flex gap={4}>
                  <Button onClick={() => router.push('/captures')} className="flex-1 bg-white hover:bg-navy-50 text-navy-950 font-black py-4 rounded-2xl border border-navy-100 uppercase tracking-widest text-xs">
                    Registry
                  </Button>
                  <Button onClick={retake} className="flex-[2] btn-primary py-4 rounded-2xl uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                    <Icon as={Camera} boxSize={4} />
                    New Scan
                  </Button>
                </Flex>
              </VStack>
            </Box>
          )}
        </Box>
      </Box>
    </AuthGuard>
  );
}
