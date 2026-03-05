import { useState, useEffect, useCallback } from 'react';

export type ServiceType = 'simple' | 'standard' | 'formal';

export interface Memorial {
  id: string;
  name: string;
  birthDate: string;
  deathDate: string;
  photoUrl: string;
  relationship: string;
  eulogy: string; // For TTS
  sermon: string; // For TTS
  hymn1: string; // Audio URL or number
  hymn2: string; // Audio URL or number
  scriptureId: string; // ID of selected scripture
  representativePrayer: string; // Text for prayer
  isPremium: boolean;
  biography: string;
  gallery: string[];
  youtubeUrl: string;
  serviceType: ServiceType;
}

const DEFAULT_MEMORIALS: Memorial[] = [
  {
    id: '1',
    name: '홍길동',
    birthDate: '1940-05-20',
    deathDate: '2020-11-15',
    photoUrl: 'https://picsum.photos/seed/grandpa/400/500',
    relationship: '할아버지',
    eulogy: '사랑하는 할아버지, 우리 곁을 떠나신 지 벌써 1년이 되었습니다. 할아버지의 따뜻한 미소와 가르침을 영원히 기억하겠습니다. 하늘나라에서도 평안하시길 기도합니다.',
    sermon: '우리의 삶은 잠시 머무는 것이지만, 하나님 안에서의 생명은 영원합니다. 슬픔 가운데 있는 유가족들에게 하늘의 위로가 함께 하시기를 바랍니다.',
    hymn1: '405',
    hymn2: '438',
    scriptureId: 'john11',
    representativePrayer: '주님, 오늘 우리는 사랑하는 홍길동님을 기억하며 이 자리에 모였습니다. 고인의 삶을 통해 보여주신 은혜에 감사드립니다. 남은 가족들에게 하늘의 위로와 소망을 더하여 주시옵소서.',
    isPremium: true,
    biography: '홍길동님은 1940년 서울에서 태어나 평생을 교육자로서 헌신하셨습니다. 30년간 고등학교 교사로 재직하며 수많은 제자들을 양성하셨고, 퇴임 후에는 지역 사회 봉사활동에 힘쓰셨습니다. 가정에서는 자상한 남편이자 아버지였으며, 손주들에게는 언제나 따뜻한 할아버지였습니다.',
    gallery: [
      'https://picsum.photos/seed/mem1/400/300',
      'https://picsum.photos/seed/mem2/400/300',
      'https://picsum.photos/seed/mem3/400/300'
    ],
    youtubeUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Example embed
    serviceType: 'standard',
  },
];

export function useMemorials() {
  const [memorials, setMemorials] = useState<Memorial[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('memorials');
    return stored ? JSON.parse(stored) : DEFAULT_MEMORIALS;
  });

  useEffect(() => {
    // Sync to local storage whenever memorials change
    localStorage.setItem('memorials', JSON.stringify(memorials));
  }, [memorials]);

  const addMemorial = useCallback((memorial: Omit<Memorial, 'id'>) => {
    const newMemorial = { ...memorial, id: crypto.randomUUID() };
    setMemorials(prev => [...prev, newMemorial]);
    return newMemorial.id;
  }, []);

  const updateMemorial = useCallback((id: string, updatedData: Partial<Omit<Memorial, 'id'>>) => {
    setMemorials(prev => prev.map(m => m.id === id ? { ...m, ...updatedData } : m));
  }, []);

  const getMemorial = useCallback((id: string) => memorials.find((m) => m.id === id), [memorials]);

  return { memorials, addMemorial, updateMemorial, getMemorial };
}
