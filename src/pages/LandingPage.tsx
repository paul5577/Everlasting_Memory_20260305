import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { BookHeart, Flame, Music, User } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="z-10 text-center max-w-md mx-auto space-y-8"
      >
        <div className="space-y-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="w-24 h-24 bg-white rounded-full mx-auto flex items-center justify-center shadow-md mb-6"
          >
            <Flame className="w-10 h-10 text-accent" strokeWidth={1.5} />
          </motion.div>
          
          <h1 className="text-4xl font-serif text-text font-medium leading-tight">
            Everlasting<br />Memory
          </h1>
          <p className="text-lg text-text/70 font-serif">영원히 기억할 당신</p>
        </div>

        <p className="text-text/80 leading-relaxed">
          사랑하는 고인을 추모하고,<br />
          의미 있는 추도 예배를 언제 어디서든<br />
          드릴 수 있도록 돕는 디지털 플랫폼입니다.
        </p>

        <div className="grid grid-cols-1 gap-4 w-full pt-8">
          <Button size="lg" onClick={() => navigate('/login')} className="w-full">
            시작하기
          </Button>
          <Button variant="ghost" size="sm" className="text-text/60">
            서비스 소개 보기
          </Button>
        </div>
      </motion.div>

      <div className="absolute bottom-8 text-center text-xs text-text/40 font-mono">
        v1.0.0 | © 2026 Everlasting Memory
      </div>
    </div>
  );
}
