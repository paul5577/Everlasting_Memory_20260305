import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMemorials } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, Calendar, ChevronRight, Edit2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { memorials } = useMemorials();
  const navigate = useNavigate();

  return (
    <div classname="space-y-6">
      <div classname="flex items-center justify-between">
        <h2 classname="text-xl font-serif font-medium text-text">나의 추모 목록</h2>
        <button size="sm" variant="ghost" onclick="{()" ==""> navigate('/create')}>
          <plus size="{20}"/>
        </Button>
      </div>

      <div classname="grid gap-4">
        {memorials.map((memorial, index) => (
          <motion.div key="{memorial.id}" initial="{{" opacity:="" 0,="" y:="" 20="" }}="" animate="{{" opacity:="" 1,="" y:="" 0="" }}="" transition="{{" delay:="" index="" *="" 0.1="" }}="">
            <card classname="cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99] relative group">
              <cardcontent classname="p-0 flex" onclick="{()" ==""> navigate(`/memorial/${memorial.id}`)}>
                <div classname="w-24 h-24 bg-gray-200 shrink-0">
                  <img src="{memorial.photoUrl}" alt="{memorial.name}" classname="w-full h-full object-cover" referrerpolicy="no-referrer"/>
                </div>
                <div classname="flex-1 p-4 flex flex-col justify-center">
                  <div classname="flex justify-between items-start">
                    <div>
                      <h3 classname="font-serif text-lg font-medium text-text">{memorial.name}</h3>
                      <p classname="text-sm text-text/60">{memorial.relationship}</p>
                    </div>
                    <chevronright classname="text-text/30" size="{20}"/>
                  </div>
                  <div classname="mt-2 flex items-center text-xs text-text/50">
                    <calendar size="{12}" classname="mr-1"/>
                    <span>기일: {memorial.deathDate}</span>
                  </div>
                </div>
              </CardContent>
              
              {/* Edit Button - Visible on hover or always on mobile */}
              <button classname="absolute top-2 right-2 p-2 bg-white/80 rounded-full shadow-sm text-text/60 hover:text-accent z-10" onclick="{(e)" ==""> {
                  e.stopPropagation();
                  navigate(`/edit/${memorial.id}`);
                }}
              >
                <edit2 size="{16}"/>
              </button>
            </Card>
          </motion.div>
        ))}

        {memorials.length === 0 && (
          <div classname="text-center py-12 text-text/40 bg-white rounded-2xl border border-dashed border-primary">
            <p>등록된 추모 대상이 없습니다.</p>
            <button variant="ghost" classname="mt-2 text-accent" onclick="{()" ==""> navigate('/create')}>
              새로 등록하기
            </Button>
          </div>
        )}
      </div>

      <div classname="pt-8">
        <div classname="bg-primary/20 rounded-xl p-6 text-center space-y-3">
          <h3 classname="font-serif font-medium text-text">프리미엄 멤버십</h3>
          <p classname="text-sm text-text/70">
            더 많은 추모 기능과<br/>무제한 나레이션을 이용해보세요.
          </p>
          <button classname="w-full bg-text text-white hover:bg-text/90">
            구독하기 (PayPal)
          </Button>
        </div>
      </div>
    </div>
  );
}
