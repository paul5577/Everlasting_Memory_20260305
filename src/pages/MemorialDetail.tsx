import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMemorials } from '@/lib/store';
import { generateSpeech } from '@/lib/tts';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { ChevronLeft, Play, BookOpen, Image as ImageIcon, Video, Home, Volume2, Pause } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MemorialDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getMemorial } = useMemorials();
  const memorial = getMemorial(id || '');
  const [activeTab, setActiveTab] = useState<'home' | 'history' | 'gallery' | 'video'>('home');
  const [isLoadingTTS, setIsLoadingTTS] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<htmlaudioelement |="" null="">(null);

  const handleNarration = async (text: string) => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    setIsLoadingTTS(true);
    try {
      const base64 = await generateSpeech(text);
      if (base64) {
        const url = `data:audio/mp3;base64,${base64}`;
        const audio = new Audio(url);
        audio.onended = () => setIsPlaying(false);
        audio.play();
        audioRef.current = audio;
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Narration error:", error);
    } finally {
      setIsLoadingTTS(false);
    }
  };

  if (!memorial) {
    return (
      <div classname="min-h-screen flex items-center justify-center">
        <div classname="text-center">
          <p classname="text-text/60 mb-4">추모 공간을 찾을 수 없습니다.</p>
          <button onclick="{()" ==""> navigate('/dashboard')}>홈으로 돌아가기</Button>
        </div>
      </div>
    );
  }

  return (
    <div classname="min-h-screen bg-base pb-24">
      {/* Header Image */}
      <div classname="relative h-64 w-full overflow-hidden">
        <img src="{memorial.photoUrl}" alt="{memorial.name}" classname="w-full h-full object-cover blur-sm scale-110 opacity-60" referrerpolicy="no-referrer"/>
        <div classname="absolute inset-0 bg-gradient-to-b from-transparent to-base"/>
        <div classname="absolute bottom-0 left-0 right-0 p-6 text-center">
          <div classname="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg mb-4">
             <img src="{memorial.photoUrl}" alt="{memorial.name}" classname="w-full h-full object-cover" referrerpolicy="no-referrer"/>
          </div>
          <h1 classname="text-2xl font-serif font-bold text-text mb-1">{memorial.name}</h1>
          <p classname="text-sm text-text/60">{memorial.birthDate} - {memorial.deathDate}</p>
        </div>
        
        <button onclick="{()" ==""> navigate('/dashboard')} 
          className="absolute top-4 left-4 p-2 bg-white/50 rounded-full hover:bg-white/80 transition-colors"
        >
          <chevronleft size="{24}"/>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div classname="flex justify-center border-b border-primary/20 mb-6 bg-white sticky top-0 z-10 shadow-sm">
        <button onclick="{()" ==""> setActiveTab('home')}
          className={`flex-1 py-3 text-sm font-medium flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-accent border-b-2 border-accent' : 'text-text/50'}`}
        >
          <home size="{18}"/> 홈
        </button>
        <button onclick="{()" ==""> setActiveTab('history')}
          className={`flex-1 py-3 text-sm font-medium flex flex-col items-center gap-1 ${activeTab === 'history' ? 'text-accent border-b-2 border-accent' : 'text-text/50'}`}
        >
          <bookopen size="{18}"/> 약력
        </button>
        <button onclick="{()" ==""> setActiveTab('gallery')}
          className={`flex-1 py-3 text-sm font-medium flex flex-col items-center gap-1 ${activeTab === 'gallery' ? 'text-accent border-b-2 border-accent' : 'text-text/50'}`}
        >
          <imageicon size="{18}"/> 갤러리
        </button>
        <button onclick="{()" ==""> setActiveTab('video')}
          className={`flex-1 py-3 text-sm font-medium flex flex-col items-center gap-1 ${activeTab === 'video' ? 'text-accent border-b-2 border-accent' : 'text-text/50'}`}
        >
          <video size="{18}"/> 영상
        </button>
      </div>

      {/* Content Area */}
      <div classname="px-4 max-w-md mx-auto">
        <motion.div key="{activeTab}" initial="{{" opacity:="" 0,="" y:="" 10="" }}="" animate="{{" opacity:="" 1,="" y:="" 0="" }}="" transition="{{" duration:="" 0.3="" }}="">
          {activeTab === 'home' && (
            <div classname="space-y-6 text-center">
              <card classname="border-primary/20 bg-white/50">
                <cardcontent classname="pt-8 pb-8 space-y-4">
                  <h2 classname="text-xl font-serif text-text">추도 예배</h2>
                  <p classname="text-text/70 text-sm leading-relaxed">
                    사랑하는 {memorial.name}님을 기억하며<br/>
                    마음을 모아 예배를 드립니다.
                  </p>
                  <button classname="w-full bg-accent text-white hover:bg-accent/90 shadow-lg mt-4" size="lg" onclick="{()" ==""> navigate(`/service/${memorial.id}`)}
                  >
                    <play size="{20}" classname="mr-2 fill-current"/> 예배 시작하기
                  </Button>
                </CardContent>
              </Card>

              <div classname="grid grid-cols-2 gap-4">
                <div classname="bg-white p-4 rounded-xl border border-primary/10 shadow-sm">
                  <p classname="text-xs text-text/50 mb-1">예배 순서</p>
                  <p classname="font-medium text-text">
                    {memorial.serviceType === 'simple' ? '간단 (약식)' : 
                     memorial.serviceType === 'formal' ? '정식 (전통)' : '중간 (표준)'}
                  </p>
                </div>
                <div classname="bg-white p-4 rounded-xl border border-primary/10 shadow-sm">
                  <p classname="text-xs text-text/50 mb-1">관계</p>
                  <p classname="font-medium text-text">{memorial.relationship}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div classname="space-y-4">
              <div classname="flex items-center justify-between mb-2">
                <h2 classname="text-lg font-serif font-medium text-text">고인의 발자취</h2>
                {memorial.biography && (
                  <button variant="ghost" size="sm" classname="text-accent hover:bg-accent/10 rounded-full" onclick="{()" ==""> handleNarration(memorial.biography)}
                    disabled={isLoadingTTS}
                  >
                    {isLoadingTTS ? (
                      <div classname="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin mr-2"/>
                    ) : isPlaying ? (
                      <pause size="{16}" classname="mr-2"/>
                    ) : (
                      <volume2 size="{16}" classname="mr-2"/>
                    )}
                    {isPlaying ? '중지' : '나레이션'}
                  </Button>
                )}
              </div>
              {memorial.biography ? (
                <card>
                  <cardcontent classname="pt-6">
                    <p classname="text-text/80 leading-relaxed whitespace-pre-wrap">
                      {memorial.biography}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div classname="text-center py-12 text-text/40 bg-white rounded-xl border border-dashed border-primary/30">
                  <p>등록된 약력이 없습니다.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'gallery' && (
            <div classname="space-y-4">
              <h2 classname="text-lg font-serif font-medium text-text mb-2">추억 갤러리</h2>
              {memorial.gallery && memorial.gallery.length > 0 ? (
                <div classname="grid grid-cols-2 gap-3">
                  {memorial.gallery.map((url, idx) => (
                    <div key="{idx}" classname="aspect-square rounded-xl overflow-hidden shadow-sm bg-gray-100">
                      <img src="{url}" alt="{`Gallery" ${idx}`}="" classname="w-full h-full object-cover hover:scale-105 transition-transform duration-500" referrerpolicy="no-referrer"/>
                    </div>
                  ))}
                </div>
              ) : (
                <div classname="text-center py-12 text-text/40 bg-white rounded-xl border border-dashed border-primary/30">
                  <p>등록된 사진이 없습니다.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'video' && (
            <div classname="space-y-4">
              <h2 classname="text-lg font-serif font-medium text-text mb-2">추모 영상</h2>
              {memorial.youtubeUrl ? (
                <card classname="overflow-hidden">
                  <div classname="aspect-video w-full bg-black">
                    <iframe width="100%" height="100%" src="{memorial.youtubeUrl.replace(&#39;watch?v=&#39;," 'embed="" ')}="" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen=""></iframe>
                  </div>
                  <cardcontent classname="pt-4">
                    <p classname="text-sm text-text/60">
                      고인과 함께했던 소중한 순간들을 영상으로 만나보세요.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div classname="text-center py-12 text-text/40 bg-white rounded-xl border border-dashed border-primary/30">
                  <p>등록된 영상이 없습니다.</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
