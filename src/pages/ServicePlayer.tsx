import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMemorials } from '@/lib/store';
import { generateSpeech } from '@/lib/tts';
import { SCRIPTURES, LORD_PRAYER } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Volume2, VolumeX, Play, Pause, X } from 'lucide-react';

const STEPS_SIMPLE = [
  { id: 'intro', title: '추도 예배', subtitle: '잠시 후 예배가 시작됩니다.' },
  { id: 'eulogy', title: '추모사', subtitle: '고인을 기억하며...' },
  { id: 'hymn1', title: '찬송', subtitle: '함께 찬송가를 부릅니다.' },
  { id: 'lord_prayer', title: '주기도문', subtitle: '주님 가르쳐 주신 기도로 예배를 마칩니다.' },
  { id: 'closing', title: '폐회', subtitle: '예배를 마칩니다.' },
];

const STEPS_STANDARD = [
  { id: 'intro', title: '추도 예배', subtitle: '잠시 후 예배가 시작됩니다.' },
  { id: 'prayer', title: '묵도', subtitle: '마음을 모아 고인을 추모합니다.' },
  { id: 'hymn1', title: '찬송', subtitle: '함께 찬송가를 부릅니다.' },
  { id: 'representative_prayer', title: '대표 기도', subtitle: '가족 중 한 분 또는 인도자가 기도합니다.' },
  { id: 'scripture', title: '성경 봉독', subtitle: '말씀을 묵상합니다.' },
  { id: 'sermon', title: '추도 예배문', subtitle: '말씀을 나눕니다.' },
  { id: 'eulogy', title: '추모사', subtitle: '고인을 기억하며...' },
  { id: 'hymn2', title: '찬송', subtitle: '함께 찬송가를 부릅니다.' },
  { id: 'lord_prayer', title: '주기도문', subtitle: '주님 가르쳐 주신 기도로 예배를 마칩니다.' },
  { id: 'closing', title: '폐회', subtitle: '예배를 마칩니다.' },
];

const STEPS_FORMAL = [
  { id: 'intro', title: '추도 예배', subtitle: '잠시 후 예배가 시작됩니다.' },
  { id: 'prayer', title: '묵도', subtitle: '마음을 모아 고인을 추모합니다.' },
  { id: 'hymn1', title: '찬송', subtitle: '함께 찬송가를 부릅니다.' },
  { id: 'representative_prayer', title: '대표 기도', subtitle: '가족 중 한 분 또는 인도자가 기도합니다.' },
  { id: 'scripture', title: '성경 봉독', subtitle: '말씀을 묵상합니다.' },
  { id: 'history', title: '약력 소개', subtitle: '고인의 발자취를 돌아봅니다.' },
  { id: 'sermon', title: '추도 예배문', subtitle: '말씀을 나눕니다.' },
  { id: 'eulogy', title: '추모사', subtitle: '고인을 기억하며...' },
  { id: 'gallery', title: '추모 영상 및 갤러리', subtitle: '생전의 모습을 기억합니다.' },
  { id: 'hymn2', title: '찬송', subtitle: '함께 찬송가를 부릅니다.' },
  { id: 'lord_prayer', title: '주기도문', subtitle: '주님 가르쳐 주신 기도로 예배를 마칩니다.' },
  { id: 'closing', title: '폐회', subtitle: '예배를 마칩니다.' },
];

export default function ServicePlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getMemorial } = useMemorials();
  const memorial = getMemorial(id || '');
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string |="" null="">(null);
  const [isLoadingTTS, setIsLoadingTTS] = useState(false);
  const [ttsCache, setTtsCache] = useState<record<string, string="">>({});
  const [loadingTexts, setLoadingTexts] = useState<set<string>>(new Set());
  const shouldPlayWhenLoadedRef = useRef<string |="" null="">(null);
  const audioRef = useRef<htmlaudioelement |="" null="">(null);
  const audioContextRef = useRef<audiocontext |="" null="">(null);
  const sourceNodeRef = useRef<audiobuffersourcenode |="" null="">(null);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Determine steps based on service type
  const steps = React.useMemo(() => {
    if (!memorial) return STEPS_STANDARD;
    switch (memorial.serviceType) {
      case 'simple': return STEPS_SIMPLE;
      case 'formal': return STEPS_FORMAL;
      default: return STEPS_STANDARD;
    }
  }, [memorial]);

  useEffect(() => {
    if (!memorial) {
      navigate('/dashboard');
    }
  }, [memorial, navigate]);

  // Handle step changes
  useEffect(() => {
    // Stop previous audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
    }
    setAudioUrl(null);

    if (!memorial) return;

    const step = steps[currentStep];

    if ((step.id === 'hymn1' || step.id === 'hymn2')) {
      const hymnVal = step.id === 'hymn1' ? memorial.hymn1 : memorial.hymn2;
      if (hymnVal) {
        const isNumber = /^\d+$/.test(hymnVal);
        const url = isNumber 
          ? `/hymn/찬송가_${hymnVal.padStart(3, '0')}장.mp3` 
          : hymnVal;
        setAudioUrl(url); 
      }
    } else {
      // Pre-load TTS for steps that have fixed text or memorial data
      let textToPreload = '';
      if (step.id === 'prayer') {
        textToPreload = `사랑하는 가족 여러분, 오늘 우리는 하나님 앞에서 ${memorial.name}님의 삶을 기억하며 추도예배를 드리려고 합니다. 우리의 생명은 하나님께로부터 왔고, 또한 하나님께로 돌아갑니다. 우리는 슬픔 가운데 있지만, 예수 그리스도 안에서 부활과 영원한 생명의 소망을 가지고 있습니다. 오늘 예배를 통해 하나님께 감사하며, 고인을 기억하고, 남은 우리 가족들이 믿음 안에서 서로 위로받는 시간이 되기를 바랍니다. 이제 하나님께 예배를 드리겠습니다.`;
      } else if (step.id === 'representative_prayer') {
        textToPreload = memorial.representativePrayer || `주님, 오늘 우리는 사랑하는 고인을 기억하며 이 자리에 모였습니다. 고인의 삶을 통해 보여주신 은혜에 감사드립니다. 슬픔에 잠긴 유가족들에게 하늘의 위로와 소망을 더하여 주시옵소서. 부활의 주님을 믿으며 천국 소망을 확인하는 시간이 되게 하시고, 우리 가족이 더욱 믿음 안에서 화목하게 하옵소서. 예수님의 이름으로 기도드립니다. 아멘.`;
      } else if (step.id === 'scripture') {
        const script = SCRIPTURES.find(s => s.id === memorial.scriptureId) || SCRIPTURES[0];
        textToPreload = `${script.content}. ${script.title} 말씀.`;
      } else if (step.id === 'sermon') {
        textToPreload = memorial.sermon || `우리의 삶은 잠시 머무는 것이지만, 하나님 안에서의 생명은 영원합니다. 슬픔 가운데 있는 유가족들에게 하늘의 위로가 함께 하시기를 바랍니다.`;
      } else if (step.id === 'history' && memorial.biography) {
        textToPreload = `고인의 약력을 소개합니다. ${memorial.biography}`;
      } else if (step.id === 'eulogy' && memorial.eulogy) {
        textToPreload = memorial.eulogy;
      } else if (step.id === 'lord_prayer') {
        textToPreload = LORD_PRAYER;
      }

      if (textToPreload) {
        loadTTS(textToPreload, false); // Preload without auto-play
      }
    }
  }, [currentStep, memorial, steps]);

  const loadTTS = async (text: string, autoPlay: boolean = true) => {
    if (!text) return;
    
    // Check cache first
    if (ttsCache[text]) {
      const url = ttsCache[text];
      setAudioUrl(url);
      if (autoPlay) playAudio(url);
      return;
    }

    // If already loading this text
    if (loadingTexts.has(text)) {
      if (autoPlay) {
        shouldPlayWhenLoadedRef.current = text;
        setIsLoadingTTS(true);
      }
      return;
    }

    if (autoPlay) {
      setIsLoadingTTS(true);
      shouldPlayWhenLoadedRef.current = text;
    }

    setLoadingTexts(prev => new Set(prev).add(text));

    try {
      // Add a timeout to the speech generation
      const speechPromise = generateSpeech(text);
      const timeoutPromise = new Promise<null>((_, reject) => 
        setTimeout(() => reject(new Error("TTS Timeout")), 15000)
      );

      const base64 = await Promise.race([speechPromise, timeoutPromise]);
      
      if (!isMounted.current) return;
      
      if (base64) {
        const url = `data:audio/mp3;base64,${base64}`;
        setTtsCache(prev => ({ ...prev, [text]: url }));
        setAudioUrl(url);
        
        if (shouldPlayWhenLoadedRef.current === text || autoPlay) {
          playAudio(url);
          shouldPlayWhenLoadedRef.current = null;
        }
      }
    } catch (error) {
      console.error("TTS loading error:", error);
      if (shouldPlayWhenLoadedRef.current === text) shouldPlayWhenLoadedRef.current = null;
    } finally {
      if (isMounted.current) {
        setLoadingTexts(prev => {
          const next = new Set(prev);
          next.delete(text);
          return next;
        });
        if (shouldPlayWhenLoadedRef.current === text || autoPlay) {
          setIsLoadingTTS(false);
        }
      }
    }
  };

  const playAudio = async (url: string) => {
    if (!isMounted.current) return;
    
    // Stop any current playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
      } catch (e) { /* ignore */ }
      sourceNodeRef.current = null;
    }

    // If it's a data URL from TTS, it might be raw PCM
    if (url.startsWith('data:audio/pcm') || url.startsWith('data:audio/mp3;base64,')) {
      try {
        const base64Data = url.split(',')[1];
        const binaryString = window.atob(base64Data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        
        const context = audioContextRef.current;
        
        // The TTS API returns 16-bit PCM at 24000Hz
        // We need to convert the Uint8Array to Float32Array
        const int16Data = new Int16Array(bytes.buffer);
        const float32Data = new Float32Array(int16Data.length);
        for (let i = 0; i < int16Data.length; i++) {
          float32Data[i] = int16Data[i] / 32768.0;
        }

        const audioBuffer = context.createBuffer(1, float32Data.length, 24000);
        audioBuffer.getChannelData(0).set(float32Data);

        const source = context.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(context.destination);
        source.onended = () => {
          if (isMounted.current) setIsPlaying(false);
        };
        
        source.start();
        sourceNodeRef.current = source;
        setIsPlaying(true);
        return;
      } catch (error) {
        console.error("PCM Playback error, falling back to standard Audio:", error);
      }
    }
    
    // Fallback to standard Audio element (for hymns or if PCM fails)
    const audio = new Audio(url);
    audio.onended = () => {
      if (isMounted.current) setIsPlaying(false);
    };
    audio.onerror = (e) => {
      console.error("Audio playback error:", e);
      if (isMounted.current) setIsPlaying(false);
    };
    
    try {
      await audio.play();
      audioRef.current = audio;
      setIsPlaying(true);
    } catch (e) {
      console.error("Playback failed:", e);
      if (isMounted.current) setIsPlaying(false);
    }
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } else if (sourceNodeRef.current) {
      if (isPlaying) {
        try { sourceNodeRef.current.stop(); } catch(e) {}
        setIsPlaying(false);
      } else if (audioUrl) {
        playAudio(audioUrl);
      }
    } else if (audioUrl) {
      playAudio(audioUrl);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(c => c + 1);
    } else {
      navigate(`/memorial/${id}`); // Go back to memorial detail instead of dashboard
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(c => c - 1);
    }
  };

  if (!memorial) return null;

  const step = steps[currentStep];

  return (
    <div classname="fixed inset-0 bg-black text-white z-50 flex flex-col">
      {/* Header */}
      <div classname="h-16 flex items-center justify-between px-4 absolute top-0 w-full z-10">
        <button onclick="{()" ==""> navigate(`/memorial/${id}`)} className="p-2 text-white/70 hover:text-white">
          <x size="{24}"/>
        </button>
        <div classname="text-sm font-medium text-white/70">
          {currentStep + 1} / {steps.length}
        </div>
        <div classname="w-10"/> {/* Spacer */}
      </div>

      {/* Main Content */}
      <div classname="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
        {/* Background Image with Blur */}
        <div classname="absolute inset-0 z-0">
          <img src="{memorial.photoUrl}" alt="Background" classname="w-full h-full object-cover opacity-30 blur-xl scale-110" referrerpolicy="no-referrer"/>
          <div classname="absolute inset-0 bg-black/40"/>
        </div>

        <animatepresence mode="wait">
          <motion.div key="{currentStep}" initial="{{" opacity:="" 0,="" y:="" 20="" }}="" animate="{{" opacity:="" 1,="" y:="" 0="" }}="" exit="{{" opacity:="" 0,="" y:="" -20="" }}="" transition="{{" duration:="" 0.5="" }}="" classname="z-10 text-center max-w-md w-full space-y-8">
            <div classname="space-y-2">
              <h2 classname="text-3xl font-serif font-medium text-primary">{step.title}</h2>
              <p classname="text-white/60 font-light">{step.subtitle}</p>
            </div>

            {/* Step Specific Content */}
            <div classname="min-h-[200px] flex flex-col items-center justify-center">
              {step.id === 'intro' && (
                <div classname="space-y-6">
                  <div classname="w-40 h-40 rounded-full overflow-hidden border-4 border-primary/20 mx-auto shadow-2xl">
                    <img src="{memorial.photoUrl}" alt="{memorial.name}" classname="w-full h-full object-cover" referrerpolicy="no-referrer"/>
                  </div>
                  <div>
                    <h3 classname="text-2xl font-serif">{memorial.name}</h3>
                    <p classname="text-white/60 mt-1">{memorial.birthDate} - {memorial.deathDate}</p>
                  </div>
                </div>
              )}

              {step.id === 'prayer' && (
                <div classname="space-y-6">
                  <div classname="text-base leading-relaxed font-serif text-white/90 text-left max-w-lg mx-auto p-6 bg-white/5 rounded-2xl border border-white/10">
                    사랑하는 가족 여러분,<br/>
                    오늘 우리는 하나님 앞에서 {memorial.name}님의 삶을 기억하며 추도예배를 드리려고 합니다.<br/><br/>
                    우리의 생명은 하나님께로부터 왔고, 또한 하나님께로 돌아갑니다.<br/>
                    우리는 슬픔 가운데 있지만, 예수 그리스도 안에서 부활과 영원한 생명의 소망을 가지고 있습니다.<br/><br/>
                    오늘 예배를 통해 하나님께 감사하며, 고인을 기억하고,<br/>
                    남은 우리 가족들이 믿음 안에서 서로 위로받는 시간이 되기를 바랍니다.<br/><br/>
                    이제 하나님께 예배를 드리겠습니다.
                  </div>
                  <div classname="flex justify-center">
                    <button variant="outline" size="sm" classname="rounded-full border-white/30 text-white/70 hover:text-white hover:bg-white/10" onclick="{()" ==""> loadTTS(`사랑하는 가족 여러분, 오늘 우리는 하나님 앞에서 ${memorial.name}님의 삶을 기억하며 추도예배를 드리려고 합니다. 우리의 생명은 하나님께로부터 왔고, 또한 하나님께로 돌아갑니다. 우리는 슬픔 가운데 있지만, 예수 그리스도 안에서 부활과 영원한 생명의 소망을 가지고 있습니다. 오늘 예배를 통해 하나님께 감사하며, 고인을 기억하고, 남은 우리 가족들이 믿음 안에서 서로 위로받는 시간이 되기를 바랍니다. 이제 하나님께 예배를 드리겠습니다.`)}
                      disabled={isLoadingTTS && !ttsCache[`사랑하는 가족 여러분, 오늘 우리는 하나님 앞에서 ${memorial.name}님의 삶을 기억하며 추도예배를 드리려고 합니다. 우리의 생명은 하나님께로부터 왔고, 또한 하나님께로 돌아갑니다. 우리는 슬픔 가운데 있지만, 예수 그리스도 안에서 부활과 영원한 생명의 소망을 가지고 있습니다. 오늘 예배를 통해 하나님께 감사하며, 고인을 기억하고, 남은 우리 가족들이 믿음 안에서 서로 위로받는 시간이 되기를 바랍니다. 이제 하나님께 예배를 드리겠습니다.`]}
                    >
                      {isLoadingTTS && !ttsCache[`사랑하는 가족 여러분, 오늘 우리는 하나님 앞에서 ${memorial.name}님의 삶을 기억하며 추도예배를 드리려고 합니다. 우리의 생명은 하나님께로부터 왔고, 또한 하나님께로 돌아갑니다. 우리는 슬픔 가운데 있지만, 예수 그리스도 안에서 부활과 영원한 생명의 소망을 가지고 있습니다. 오늘 예배를 통해 하나님께 감사하며, 고인을 기억하고, 남은 우리 가족들이 믿음 안에서 서로 위로받는 시간이 되기를 바랍니다. 이제 하나님께 예배를 드리겠습니다.`] ? (
                        <div classname="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"/>
                      ) : isPlaying ? (
                        <pause size="{16}" classname="mr-2"/>
                      ) : (
                        <volume2 size="{16}" classname="mr-2"/>
                      )}
                      {isPlaying ? '중지' : '나레이션 듣기'}
                    </Button>
                  </div>
                </div>
              )}

              {(step.id === 'hymn1' || step.id === 'hymn2') && (
                <div classname="space-y-6 w-full">
                  <div classname="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto animate-pulse">
                    <volume2 size="{32}" classname="text-primary"/>
                  </div>
                  <p classname="text-sm text-white/60">
                    {(() => {
                      const val = step.id === 'hymn1' ? memorial.hymn1 : memorial.hymn2;
                      return /^\d+$/.test(val) ? `찬송가 ${val}장` : '선택한 찬송가';
                    })()}
                  </p>
                  {/* Audio Controls */}
                  <div classname="flex justify-center">
                    <button variant="outline" classname="rounded-full w-16 h-16 border-white/30 text-white hover:bg-white/10" onclick="{toggleAudio}">
                      {isPlaying ? <pause fill="currentColor"/> : <play fill="currentColor" classname="ml-1"/>}
                    </Button>
                  </div>
                </div>
              )}

              {step.id === 'representative_prayer' && (
                <div classname="space-y-6 w-full max-w-lg">
                  <div classname="p-6 bg-white/5 rounded-2xl border border-white/10 text-left max-h-[400px] overflow-y-auto">
                    <p classname="text-white/80 leading-relaxed whitespace-pre-wrap font-serif">
                      {memorial.representativePrayer || "주님, 오늘 우리는 사랑하는 고인을 기억하며 이 자리에 모였습니다. 고인의 삶을 통해 보여주신 은혜에 감사드립니다. 슬픔에 잠긴 유가족들에게 하늘의 위로와 소망을 더하여 주시옵소서. 부활의 주님을 믿으며 천국 소망을 확인하는 시간이 되게 하시고, 우리 가족이 더욱 믿음 안에서 화목하게 하옵소서. 예수님의 이름으로 기도드립니다. 아멘."}
                    </p>
                  </div>
                  <div classname="flex justify-center">
                    <button variant="outline" size="sm" classname="rounded-full border-white/30 text-white/70 hover:text-white hover:bg-white/10" onclick="{()" ==""> loadTTS(memorial.representativePrayer || `주님, 오늘 우리는 사랑하는 고인을 기억하며 이 자리에 모였습니다. 고인의 삶을 통해 보여주신 은혜에 감사드립니다. 슬픔에 잠긴 유가족들에게 하늘의 위로와 소망을 더하여 주시옵소서. 부활의 주님을 믿으며 천국 소망을 확인하는 시간이 되게 하시고, 우리 가족이 더욱 믿음 안에서 화목하게 하옵소서. 예수님의 이름으로 기도드립니다. 아멘.`)}
                      disabled={isLoadingTTS && !ttsCache[memorial.representativePrayer || `주님, 오늘 우리는 사랑하는 고인을 기억하며 이 자리에 모였습니다. 고인의 삶을 통해 보여주신 은혜에 감사드립니다. 슬픔에 잠긴 유가족들에게 하늘의 위로와 소망을 더하여 주시옵소서. 부활의 주님을 믿으며 천국 소망을 확인하는 시간이 되게 하시고, 우리 가족이 더욱 믿음 안에서 화목하게 하옵소서. 예수님의 이름으로 기도드립니다. 아멘.`]}
                    >
                      {isLoadingTTS && !ttsCache[memorial.representativePrayer || `주님, 오늘 우리는 사랑하는 고인을 기억하며 이 자리에 모였습니다. 고인의 삶을 통해 보여주신 은혜에 감사드립니다. 슬픔에 잠긴 유가족들에게 하늘의 위로와 소망을 더하여 주시옵소서. 부활의 주님을 믿으며 천국 소망을 확인하는 시간이 되게 하시고, 우리 가족이 더욱 믿음 안에서 화목하게 하옵소서. 예수님의 이름으로 기도드립니다. 아멘.`] ? (
                        <div classname="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"/>
                      ) : isPlaying ? (
                        <pause size="{16}" classname="mr-2"/>
                      ) : (
                        <volume2 size="{16}" classname="mr-2"/>
                      )}
                      {isPlaying ? '중지' : '나레이션 듣기'}
                    </Button>
                  </div>
                </div>
              )}

              {step.id === 'scripture' && (
                <div classname="space-y-6">
                  {(() => {
                    const script = SCRIPTURES.find(s => s.id === memorial.scriptureId) || SCRIPTURES[0];
                    return (
                      <>
                        <div classname="space-y-4">
                          <p classname="text-xl font-serif leading-relaxed whitespace-pre-wrap">
                            {script.content}
                          </p>
                          <p classname="text-sm text-primary">- {script.title} -</p>
                        </div>
                        <div classname="flex justify-center">
                          <button variant="outline" size="sm" classname="rounded-full border-white/30 text-white/70 hover:text-white hover:bg-white/10" onclick="{()" ==""> loadTTS(`${script.content}. ${script.title} 말씀.`)}
                            disabled={isLoadingTTS && !ttsCache[`${script.content}. ${script.title} 말씀.`]}
                          >
                            {isLoadingTTS && !ttsCache[`${script.content}. ${script.title} 말씀.`] ? (
                              <div classname="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"/>
                            ) : isPlaying ? (
                              <pause size="{16}" classname="mr-2"/>
                            ) : (
                              <volume2 size="{16}" classname="mr-2"/>
                            )}
                            {isPlaying ? '중지' : '나레이션 듣기'}
                          </Button>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              {step.id === 'history' && (
                <div classname="space-y-6 w-full max-w-lg">
                  <div classname="p-6 bg-white/5 rounded-2xl border border-white/10 text-left max-h-[400px] overflow-y-auto">
                    <h3 classname="text-xl font-serif mb-4 text-primary">고인의 약력</h3>
                    <p classname="text-white/80 leading-relaxed whitespace-pre-wrap font-serif">
                      {memorial.biography || "등록된 약력이 없습니다."}
                    </p>
                  </div>
                  {memorial.biography && (
                    <div classname="flex justify-center">
                      <button variant="outline" size="sm" classname="rounded-full border-white/30 text-white/70 hover:text-white hover:bg-white/10" onclick="{()" ==""> loadTTS(`고인의 약력을 소개합니다. ${memorial.biography}`)}
                        disabled={isLoadingTTS && !ttsCache[`고인의 약력을 소개합니다. ${memorial.biography}`]}
                      >
                        {isLoadingTTS && !ttsCache[`고인의 약력을 소개합니다. ${memorial.biography}`] ? (
                          <div classname="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"/>
                        ) : isPlaying ? (
                          <pause size="{16}" classname="mr-2"/>
                        ) : (
                          <volume2 size="{16}" classname="mr-2"/>
                        )}
                        {isPlaying ? '중지' : '나레이션 듣기'}
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {step.id === 'gallery' && (
                <div classname="space-y-6 w-full max-w-2xl">
                  {memorial.youtubeUrl && (
                    <div classname="aspect-video w-full rounded-xl overflow-hidden border border-white/10 bg-black">
                      <iframe width="100%" height="100%" src="{memorial.youtubeUrl.replace(&#39;watch?v=&#39;," 'embed="" ')}="" title="Memorial Video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen=""></iframe>
                    </div>
                  )}
                  
                  {memorial.gallery && memorial.gallery.length > 0 && (
                    <div classname="grid grid-cols-3 gap-2">
                      {memorial.gallery.map((url, idx) => (
                        <div key="{idx}" classname="aspect-square rounded-lg overflow-hidden bg-white/5">
                          <img src="{url}" alt="{`Gallery" ${idx}`}="" classname="w-full h-full object-cover" referrerpolicy="no-referrer"/>
                        </div>
                      ))}
                    </div>
                  )}

                  {!memorial.youtubeUrl && (!memorial.gallery || memorial.gallery.length === 0) && (
                    <p classname="text-white/50">등록된 영상이나 사진이 없습니다.</p>
                  )}
                </div>
              )}

              {step.id === 'sermon' && (
                <div classname="space-y-6">
                  <div classname="p-6 bg-white/5 rounded-2xl border border-white/10 text-left max-h-[300px] overflow-y-auto">
                    <p classname="text-white/80 leading-relaxed whitespace-pre-wrap font-serif">
                      {memorial.sermon || "우리의 삶은 잠시 머무는 것이지만, 하나님 안에서의 생명은 영원합니다. 슬픔 가운데 있는 유가족들에게 하늘의 위로가 함께 하시기를 바랍니다."}
                    </p>
                  </div>
                  <div classname="flex justify-center">
                    <button variant="outline" size="sm" classname="rounded-full border-white/30 text-white/70 hover:text-white hover:bg-white/10" onclick="{()" ==""> loadTTS(memorial.sermon || `우리의 삶은 잠시 머무는 것이지만, 하나님 안에서의 생명은 영원합니다. 슬픔 가운데 있는 유가족들에게 하늘의 위로가 함께 하시기를 바랍니다.`)}
                      disabled={isLoadingTTS && !ttsCache[memorial.sermon || `우리의 삶은 잠시 머무는 것이지만, 하나님 안에서의 생명은 영원합니다. 슬픔 가운데 있는 유가족들에게 하늘의 위로가 함께 하시기를 바랍니다.`]}
                    >
                      {isLoadingTTS && !ttsCache[memorial.sermon || `우리의 삶은 잠시 머무는 것이지만, 하나님 안에서의 생명은 영원합니다. 슬픔 가운데 있는 유가족들에게 하늘의 위로가 함께 하시기를 바랍니다.`] ? (
                        <div classname="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"/>
                      ) : isPlaying ? (
                        <pause size="{16}" classname="mr-2"/>
                      ) : (
                        <volume2 size="{16}" classname="mr-2"/>
                      )}
                      {isPlaying ? '중지' : '나레이션 듣기'}
                    </Button>
                  </div>
                </div>
              )}

              {step.id === 'eulogy' && (
                <div classname="space-y-6 w-full">
                  <div classname="p-6 bg-white/5 rounded-2xl border border-white/10 text-left max-h-[300px] overflow-y-auto">
                    <p classname="text-white/80 leading-relaxed whitespace-pre-wrap font-serif">
                      {memorial.eulogy}
                    </p>
                  </div>
                  <div classname="flex justify-center">
                    <button variant="outline" classname="rounded-full h-12 px-6 border-white/30 text-white hover:bg-white/10" onclick="{()" ==""> loadTTS(memorial.eulogy)}
                      disabled={isLoadingTTS && !ttsCache[memorial.eulogy]}
                    >
                      {isLoadingTTS && !ttsCache[memorial.eulogy] ? (
                        <div classname="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"/>
                      ) : isPlaying ? (
                        <pause size="{20}" fill="currentColor" classname="mr-2"/>
                      ) : (
                        <volume2 size="{20}" classname="mr-2"/>
                      )}
                      {isPlaying ? '중지' : '나레이션 듣기'}
                    </Button>
                  </div>
                </div>
              )}

              {step.id === 'lord_prayer' && (
                <div classname="space-y-6 w-full max-w-lg">
                  <div classname="p-6 bg-white/5 rounded-2xl border border-white/10 text-left max-h-[400px] overflow-y-auto">
                    <p classname="text-sm text-white/80 leading-relaxed font-serif whitespace-pre-wrap">
                      {LORD_PRAYER}
                    </p>
                  </div>
                  <div classname="flex justify-center">
                    <button variant="outline" size="sm" classname="rounded-full border-white/30 text-white/70 hover:text-white hover:bg-white/10" onclick="{()" ==""> loadTTS(LORD_PRAYER)}
                      disabled={isLoadingTTS && !ttsCache[LORD_PRAYER]}
                    >
                      {isLoadingTTS && !ttsCache[LORD_PRAYER] ? (
                        <div classname="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"/>
                      ) : isPlaying ? (
                        <pause size="{16}" classname="mr-2"/>
                      ) : (
                        <volume2 size="{16}" classname="mr-2"/>
                      )}
                      {isPlaying ? '중지' : '나레이션 듣기'}
                    </Button>
                  </div>
                </div>
              )}

              {step.id === 'closing' && (
                <div classname="space-y-6">
                  <p classname="text-lg text-white/80">
                    이것으로 {memorial.name}님의<br/>
                    추도 예배를 마칩니다.
                  </p>
                  <button classname="bg-primary text-text hover:bg-primary/90" onclick="{()" ==""> navigate(`/memorial/${id}`)}
                  >
                    나가기
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Controls */}
      <div classname="h-24 px-4 sm:px-8 pb-8 flex items-center justify-between z-10">
        <button variant="ghost" classname="text-white/50 hover:text-white hover:bg-white/10 whitespace-nowrap flex-shrink-0" onclick="{prevStep}" disabled="{currentStep" =="=" 0}="">
          <chevronleft classname="mr-1 sm:mr-2"/> 이전
        </Button>

        <div classname="flex space-x-1 sm:space-x-2 px-2">
          {steps.map((_, i) => (
            <div key="{i}" classname="{`w-1.5" h-1.5="" sm:w-2="" sm:h-2="" rounded-full="" transition-colors="" ${i="==" currentstep="" ?="" 'bg-primary'="" :="" 'bg-white="" 20'}`}=""/>
          ))}
        </div>

        {currentStep < steps.length - 1 ? (
          <button classname="bg-accent text-white hover:bg-accent/90 border-none whitespace-nowrap flex-shrink-0" onclick="{nextStep}">
            다음 <chevronright classname="ml-1 sm:ml-2"/>
          </Button>
        ) : (
          <div classname="w-20 sm:w-24"/>
        )}
      </div>
    </div>
  );
}
