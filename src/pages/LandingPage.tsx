import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { BookHeart, Flame, Music, User, X, CheckCircle2, Sparkles, PlayCircle } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [showIntro, setShowIntro] = React.useState(false);

  return (
    <div classname="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-base">
      {/* Background decoration */}
      <div classname="absolute inset-0 z-0 opacity-30 pointer-events-none">
        <div classname="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary blur-[100px]"/>
        <div classname="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary blur-[100px]"/>
      </div>

      <motion.div initial="{{" opacity:="" 0,="" y:="" 20="" }}="" animate="{{" opacity:="" 1,="" y:="" 0="" }}="" transition="{{" duration:="" 0.8="" }}="" classname="z-10 text-center max-w-md mx-auto space-y-8">
        <div classname="space-y-4">
          <motion.div initial="{{" scale:="" 0.9,="" opacity:="" 0="" }}="" animate="{{" scale:="" 1,="" opacity:="" 1="" }}="" transition="{{" delay:="" 0.2,="" duration:="" 0.8="" }}="" classname="w-24 h-24 bg-white rounded-full mx-auto flex items-center justify-center shadow-md mb-6">
            <flame classname="w-10 h-10 text-accent" strokewidth="{1.5}"/>
          </motion.div>
          
          <h1 classname="text-4xl font-serif text-text font-medium leading-tight">
            Everlasting<br/>Memory
          </h1>
          <p classname="text-lg text-text/70 font-serif">영원히 기억할 당신</p>
        </div>

        <p classname="text-text/80 leading-relaxed">
          사랑하는 고인을 추모하고,<br/>
          의미 있는 추도 예배를 언제 어디서든<br/>
          드릴 수 있도록 돕는 디지털 플랫폼입니다.
        </p>

        <div classname="grid grid-cols-1 gap-4 w-full pt-8">
          <button size="lg" onclick="{()" ==""> navigate('/login')} className="w-full">
            시작하기
          </Button>
          <button variant="ghost" size="sm" classname="text-text/60" onclick="{()" ==""> setShowIntro(true)}
          >
            서비스 소개 보기
          </Button>
        </div>
      </motion.div>

      {/* Service Introduction Modal */}
      {showIntro && (
        <div classname="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div initial="{{" opacity:="" 0,="" scale:="" 0.95="" }}="" animate="{{" opacity:="" 1,="" scale:="" 1="" }}="" classname="bg-white rounded-3xl w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-2xl relative">
            <button onclick="{()" ==""> setShowIntro(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <x classname="w-6 h-6 text-text/40"/>
            </button>

            <div classname="p-8 space-y-8">
              <div classname="space-y-2">
                <h2 classname="text-2xl font-serif font-medium text-text">서비스 소개</h2>
                <p classname="text-text/60">Everlasting Memory - 영원히 기억할 당신</p>
              </div>

              <section classname="space-y-4">
                <h3 classname="text-lg font-serif font-medium text-accent flex items-center gap-2">
                  <sparkles classname="w-5 h-5"/> 주요 특징
                </h3>
                <div classname="grid gap-3">
                  {[
                    { title: 'AI 추모사 & 설교 생성', desc: '고인의 삶을 바탕으로 따뜻한 추모사와 설교를 AI가 작성해 드립니다.' },
                    { title: '찬송가 & 성경 말씀', desc: '엄선된 찬송가 음원과 성경 말씀을 예배 순서에 맞춰 제공합니다.' },
                    { title: '디지털 예배 플레이어', desc: '음성 낭독(TTS)과 함께 진행되는 경건한 추도 예배를 경험하세요.' },
                    { title: '개인 맞춤형 추모', desc: '참고 자료(PDF)를 업로드하여 더욱 개인화된 추모 콘텐츠를 생성합니다.' },
                  ].map((item, i) => (
                    <div key="{i}" classname="flex gap-3 p-4 bg-primary/10 rounded-2xl">
                      <checkcircle2 classname="w-5 h-5 text-accent shrink-0 mt-0.5"/>
                      <div>
                        <h4 classname="font-medium text-text">{item.title}</h4>
                        <p classname="text-sm text-text/70">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section classname="space-y-4">
                <h3 classname="text-lg font-serif font-medium text-accent flex items-center gap-2">
                  <playcircle classname="w-5 h-5"/> 사용 방법
                </h3>
                <ol classname="space-y-3 text-text/80">
                  <li classname="flex gap-3">
                    <span classname="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-xs shrink-0">1</span>
                    <p>구글 계정으로 간편하게 로그인합니다.</p>
                  </li>
                  <li classname="flex gap-3">
                    <span classname="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-xs shrink-0">2</span>
                    <p>추모할 고인의 정보와 예배 유형을 선택하여 추모 공간을 생성합니다.</p>
                  </li>
                  <li classname="flex gap-3">
                    <span classname="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-xs shrink-0">3</span>
                    <p>AI 템플릿을 활용해 추모사와 설교 내용을 다듬고 찬송가를 선택합니다.</p>
                  </li>
                  <li classname="flex gap-3">
                    <span classname="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-xs shrink-0">4</span>
                    <p>'예배 시작' 버튼을 눌러 가족들과 함께 경건한 추모의 시간을 가집니다.</p>
                  </li>
                </ol>
              </section>

              <button onclick="{()" ==""> setShowIntro(false)} className="w-full py-6 rounded-2xl">
                확인했습니다
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      <div classname="absolute bottom-8 text-center text-xs text-text/40 font-mono">
        v1.0.0 | © 2026 Everlasting Memory
      </div>
    </div>
  );
}
