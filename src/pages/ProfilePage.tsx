import React, { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { User, CreditCard, Settings, LogOut, Heart, Camera, Edit2, Check, X } from 'lucide-react';

export default function ProfilePage() {
  const { user, signOut, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');

  if (!user) return null;

  const startEditing = () => {
    setEditName(user.displayName);
    setIsEditing(true);
  };

  const saveProfile = async () => {
    await updateProfile({ displayName: editName });
    setIsEditing(false);
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateProfile({ photoURL: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center space-x-4 mb-8">
        <div className="relative group">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary">
            <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <label htmlFor="profile-upload" className="absolute bottom-0 right-0 p-1.5 bg-accent text-white rounded-full shadow-md cursor-pointer hover:bg-accent/90 transition-colors">
            <Camera size={14} />
            <input id="profile-upload" type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </label>
        </div>
        
        <div className="flex-1">
          {isEditing ? (
            <div className="flex items-center space-x-2">
              <input 
                type="text" 
                value={editName} 
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-primary/30 focus:border-accent outline-none bg-white text-sm"
                autoFocus
              />
              <button onClick={saveProfile} className="p-1.5 bg-accent text-white rounded-full hover:bg-accent/90">
                <Check size={14} />
              </button>
              <button onClick={cancelEditing} className="p-1.5 bg-gray-200 text-text/60 rounded-full hover:bg-gray-300">
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-serif font-medium text-text flex items-center gap-2">
                  {user.displayName}
                </h2>
                <p className="text-sm text-text/60">{user.email}</p>
              </div>
              <button onClick={startEditing} className="p-2 text-text/40 hover:text-accent">
                <Edit2 size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4 border-b border-primary/10">
          <h3 className="font-medium text-text flex items-center">
            <CreditCard size={18} className="mr-2 text-accent" /> 멤버십 및 결제
          </h3>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="bg-base p-4 rounded-xl flex justify-between items-center">
            <div>
              <p className="font-medium text-text">{user.isAdmin ? '프리미엄 플랜 (관리자)' : '무료 플랜 이용 중'}</p>
              <p className="text-xs text-text/60">{user.isAdmin ? '모든 기능을 제한 없이 이용할 수 있습니다.' : '기본 기능만 제공됩니다.'}</p>
            </div>
            <span className={`px-2 py-1 text-xs rounded ${user.isAdmin ? 'bg-accent/10 text-accent' : 'bg-gray-200 text-text/60'}`}>
              {user.isAdmin ? 'Premium' : 'Free'}
            </span>
          </div>
          
          {!user.isAdmin && (
            <>
              <Button className="w-full bg-[#003087] text-white hover:bg-[#003087]/90 relative overflow-hidden group">
                <span className="relative z-10 flex items-center justify-center">
                  <span className="font-bold italic mr-1">PayPal</span> 로 프리미엄 구독하기
                </span>
              </Button>
              <p className="text-xs text-center text-text/40">
                * 프리미엄 구독 시 무제한 TTS 나레이션과<br/>추가 찬송가 라이브러리가 제공됩니다.
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4 border-b border-primary/10">
          <h3 className="font-medium text-text flex items-center">
            <Heart size={18} className="mr-2 text-accent" /> 기부하기
          </h3>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-sm text-text/70 mb-4">
            Everlasting Memory는 여러분의 후원으로 운영됩니다.<br/>
            더 나은 서비스를 위해 마음을 모아주세요.
          </p>
          <Button variant="outline" className="w-full border-accent text-accent hover:bg-accent/5">
            후원하기
          </Button>
        </CardContent>
      </Card>

      <div className="pt-4">
        <Button 
          variant="ghost" 
          className="w-full text-red-500 hover:bg-red-50 hover:text-red-600"
          onClick={() => signOut()}
        >
          <LogOut size={18} className="mr-2" /> 로그아웃
        </Button>
      </div>
      
      <div className="text-center text-xs text-text/30 pt-8 pb-4">
        Everlasting Memory v1.0.0<br/>
        Terms of Service | Privacy Policy
      </div>
    </div>
  );
}
