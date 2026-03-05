import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Flame } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const { signIn, user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div classname="min-h-screen flex flex-col items-center justify-center p-6 bg-base">
      <motion.div initial="{{" opacity:="" 0,="" y:="" 20="" }}="" animate="{{" opacity:="" 1,="" y:="" 0="" }}="" classname="w-full max-w-sm space-y-8 text-center">
        <div classname="flex justify-center">
          <div classname="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm">
            <flame classname="w-8 h-8 text-accent"/>
          </div>
        </div>
        
        <div classname="space-y-2">
          <h2 classname="text-2xl font-serif font-medium text-text">로그인</h2>
          <p classname="text-text/60">서비스 이용을 위해 로그인해주세요.</p>
        </div>

        <div classname="space-y-4 pt-4">
          <button onclick="{()" ==""> signIn()} 
            className="w-full bg-white text-text border border-gray-200 hover:bg-gray-50 shadow-sm relative"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" classname="w-5 h-5 absolute left-4" alt="Google"/>
            Google로 계속하기
          </Button>
          
          <div classname="relative">
            <div classname="absolute inset-0 flex items-center">
              <span classname="w-full border-t border-gray-200"/>
            </div>
            <div classname="relative flex justify-center text-xs uppercase">
              <span classname="bg-base px-2 text-text/40">또는</span>
            </div>
          </div>

          <button variant="outline" classname="w-full text-text border-accent" onclick="{()" ==""> signIn()} // Just mock sign in for now
          >
            이메일로 로그인
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
