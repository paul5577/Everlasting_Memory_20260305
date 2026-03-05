import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMemorials, Memorial, ServiceType } from '@/lib/store';
import { useAuth } from '@/lib/auth';
import { HYMNS, SCRIPTURES } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { ChevronLeft, Upload, Music, User, Calendar, FileText, Check, Copy, Share2, Home, Video, Image as ImageIcon, Star, BookOpen, X, Sparkles, FileUp, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI } from "@google/genai";
import * as pdfjsLib from 'pdfjs-dist';
import imageCompression from 'browser-image-compression';

// PDF.js worker setup
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const EULOGY_TEMPLATES = [
  { title: '추모사 기본', content: `사랑하는 가족 여러분,

오늘 우리가 기억하는 ○○○님의 삶은
하나님께서 우리에게 주셨던 소중한 선물이었습니다.

사람의 생명은 하나님께로부터 왔고
또한 하나님께로 돌아갑니다.

우리는 육신의 이별로 인해 슬픔을 느끼지만
성경은 예수 그리스도를 믿는 자에게
영원한 생명이 있다고 말씀합니다.

그러므로 우리의 이별은 영원한 끝이 아니라
다시 만날 소망이 있는 이별입니다.

오늘 우리가 고인을 기억하며
슬픔 속에서도 하나님께 감사할 수 있는 것은
우리에게 영원한 소망이 있기 때문입니다.

이 시간을 통해 고인의 삶을 기억하며
우리도 하나님 안에서 의미 있는 삶을 살아가기를 다짐하는
귀한 시간이 되기를 바랍니다.` },
  { title: '부모님 추모', content: '사랑하는 나의 부모님, 당신의 헌신적인 사랑과 가르침을 영원히 잊지 않겠습니다. 우리를 위해 평생을 희생하신 그 손길을 기억하며, 이제는 아픔 없는 하늘나라에서 평안히 쉬시기를 기도합니다.' },
  { title: '배우자 추모', content: '나의 소중한 동반자여, 당신과 함께한 모든 시간이 축복이었습니다. 당신이 남긴 사랑의 향기가 우리 가족의 삶 속에 영원히 머물 것입니다. 다시 만날 그날까지 당신을 가슴 깊이 간직하겠습니다.' },
];

const SERMON_TEMPLATES = [
  { title: '천국 소망', content: '우리의 삶은 이 땅에서 잠시 머무는 나그네 길입니다. 하지만 하나님께서는 우리를 위해 영원한 하늘 처소를 예비하셨습니다. 고인은 이제 그 영광스러운 곳에서 주님과 함께 계십니다. 우리도 그 소망을 품고 살아갑시다.' },
  { title: '위로와 평안', content: '슬픔 가운데 있는 유가족 여러분, 하나님의 위로가 여러분과 함께하시기를 바랍니다. 죽음은 끝이 아니라 새로운 시작이며, 우리는 주님 안에서 다시 만날 약속을 받았습니다. 그 평안이 여러분의 마음을 지키시길 기도합니다.' },
];

const PRAYER_TEMPLATES = [
  { title: '대표 기도 예시', content: '주님, 오늘 우리는 사랑하는 고인을 기억하며 이 자리에 모였습니다. 고인의 삶을 통해 보여주신 은혜에 감사드립니다. 슬픔에 잠긴 유가족들에게 하늘의 위로와 소망을 더하여 주시옵소서. 부활의 주님을 믿으며 천국 소망을 확인하는 시간이 되게 하시고, 우리 가족이 더욱 믿음 안에서 화목하게 하옵소서. 예수님의 이름으로 기도드립니다. 아멘.' },
];

const PRESET_PHOTOS = [
  'https://picsum.photos/seed/grandpa/400/500',
  'https://picsum.photos/seed/grandma/400/500',
  'https://picsum.photos/seed/father/400/500',
  'https://picsum.photos/seed/mother/400/500',
];

export default function CreateMemorial() {
  const navigate = useNavigate();
  const { id } = useParams(); // Get ID from URL if editing
  const { addMemorial, updateMemorial, getMemorial } = useMemorials();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<Omit<Memorial, 'id'>>({
    name: '',
    birthDate: '',
    deathDate: '',
    photoUrl: PRESET_PHOTOS[0],
    relationship: '',
    eulogy: '',
    sermon: '',
    hymn1: HYMNS[1].url,
    hymn2: HYMNS[3].url,
    scriptureId: SCRIPTURES[0].id,
    representativePrayer: '',
    isPremium: false,
    biography: '',
    gallery: [],
    youtubeUrl: '',
    serviceType: 'standard',
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [galleryInput, setGalleryInput] = useState('');
  const [pdfContext, setPdfContext] = useState('');
  const [pdfFileName, setPdfFileName] = useState<string | null>(null);
  const [isGeneratingEulogy, setIsGeneratingEulogy] = useState(false);
  const [isGeneratingBiography, setIsGeneratingBiography] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [isCompressingImages, setIsCompressingImages] = useState(false);

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

  const generateAIContent = async (type: 'eulogy' | 'biography') => {
    const keywords = type === 'eulogy' ? formData.eulogy : formData.biography;
    if (!keywords.trim()) {
      alert('간단한 키워드를 입력해주세요.');
      return;
    }

    if (type === 'eulogy') setIsGeneratingEulogy(true);
    else setIsGeneratingBiography(true);

    try {
      const prompt = `
        고인 성함: ${formData.name}
        관계: ${formData.relationship}
        생년월일: ${formData.birthDate}
        기일: ${formData.deathDate}
        추가 정보 (PDF 내용): ${pdfContext}
        입력된 키워드: ${keywords}

        위 정보를 바탕으로 ${type === 'eulogy' ? '추모사' : '고인의 약력'}를 작성해주세요.
        정중하고 따뜻하며 위로가 되는 문체로 작성해주세요. 한국어로 작성해주세요.
        
        ${type === 'eulogy' ? `
        추모사 작성 가이드라인:
        - "사랑하는 가족 여러분"으로 시작해주세요.
        - 고인의 삶이 하나님께서 주신 소중한 선물이었음을 언급해주세요.
        - 생명이 하나님께로부터 왔고 다시 돌아감을 표현해주세요.
        - 육신의 이별은 슬프지만 예수 그리스도 안에서 영원한 생명과 다시 만날 소망이 있음을 강조해주세요.
        - 고인을 기억하며 하나님 안에서 의미 있는 삶을 살아가기를 다짐하는 내용으로 마무리해주세요.
        ` : '고인의 생애와 업적을 기리는 약력입니다.'}
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const result = response.text || '';
      setFormData(prev => ({ ...prev, [type]: result }));
    } catch (error) {
      console.error('AI Generation Error:', error);
      alert('AI 생성 중 오류가 발생했습니다.');
    } finally {
      if (type === 'eulogy') setIsGeneratingEulogy(false);
      else setIsGeneratingBiography(false);
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPdfFileName(file.name);
    setIsUploadingPdf(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n';
      }
      setPdfContext(fullText);
      alert('PDF 내용이 성공적으로 분석되었습니다. AI 생성 시 참고자료로 사용됩니다.');
    } catch (error) {
      console.error('PDF Upload Error:', error);
      alert('PDF 파일을 읽는 중 오류가 발생했습니다.');
    } finally {
      setIsUploadingPdf(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (formData.gallery.length + files.length > 10) {
      alert('갤러리 이미지는 최대 10개까지만 업로드 가능합니다.');
      return;
    }

    setIsCompressingImages(true);
    try {
      const compressedImages: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const options = {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1280,
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(file, options);
        const base64 = await imageCompression.getDataUrlFromFile(compressedFile);
        compressedImages.push(base64);
      }
      setFormData(prev => ({ ...prev, gallery: [...prev.gallery, ...compressedImages] }));
    } catch (error) {
      console.error('Image Compression Error:', error);
      alert('이미지 압축 중 오류가 발생했습니다.');
    } finally {
      setIsCompressingImages(false);
    }
  };

  // Load existing data if editing
  useEffect(() => {
    if (id) {
      const existing = getMemorial(id);
      if (existing) {
        setFormData({
          name: existing.name,
          birthDate: existing.birthDate,
          deathDate: existing.deathDate,
          photoUrl: existing.photoUrl,
          relationship: existing.relationship,
          eulogy: existing.eulogy,
          sermon: existing.sermon || '',
          hymn1: existing.hymn1 || existing.hymn || HYMNS[1].url,
          hymn2: existing.hymn2 || HYMNS[3].url,
          scriptureId: existing.scriptureId || SCRIPTURES[0].id,
          representativePrayer: existing.representativePrayer || '',
          isPremium: existing.isPremium || false,
          biography: existing.biography || '',
          gallery: existing.gallery || [],
          youtubeUrl: existing.youtubeUrl || '',
          serviceType: existing.serviceType || 'standard',
        });
      }
    } else if (user?.isAdmin) {
      // Auto-enable premium for admins creating new memorials
      setFormData(prev => ({ ...prev, isPremium: true }));
    }
  }, [id, getMemorial, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleServiceTypeChange = (type: ServiceType) => {
    setFormData(prev => ({ ...prev, serviceType: type }));
  };

  const handleAddGalleryImage = () => {
    if (galleryInput.trim()) {
      setFormData(prev => ({ ...prev, gallery: [...prev.gallery, galleryInput.trim()] }));
      setGalleryInput('');
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    setFormData(prev => ({ ...prev, gallery: prev.gallery.filter((_, i) => i !== index) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let targetId = id;
    if (id) {
      updateMemorial(id, formData);
    } else {
      targetId = addMemorial(formData);
    }
    if (targetId) {
      setCreatedId(targetId);
      setShowSuccess(true);
    }
  };

  const handleCopyLink = () => {
    if (!createdId) return;
    const url = `${window.location.origin}/memorial/${createdId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-base">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="border-primary/20 shadow-xl">
            <CardContent className="pt-8 pb-8 text-center space-y-6">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={40} strokeWidth={3} />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-serif font-medium text-text">
                  {id ? '수정이 완료되었습니다' : '추모 공간이 생성되었습니다'}
                </h2>
                <p className="text-text/60">
                  아래 링크를 복사하여 가족들과 공유하세요.
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between gap-3">
                <div className="text-sm text-text/60 truncate flex-1 text-left">
                  {window.location.origin}/memorial/{createdId}
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className={copied ? "bg-green-50 text-green-600 border-green-200" : ""}
                  onClick={handleCopyLink}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/dashboard')}
                >
                  <Home size={18} className="mr-2" /> 홈으로
                </Button>
                <Button 
                  className="w-full bg-accent text-white hover:bg-accent/90"
                  onClick={() => navigate(`/memorial/${createdId}`)}
                >
                  <Share2 size={18} className="mr-2" /> 바로 가기
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-32"> {/* Increased bottom padding for fixed button */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="p-0">
          <ChevronLeft />
        </Button>
        <h2 className="text-xl font-serif font-medium text-text">{id ? '추모 정보 수정' : '새로운 추모 생성'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardContent className="space-y-4 pt-6">
            <label className="text-sm font-medium text-text/70 flex items-center">
              <FileUp size={16} className="mr-2" /> 참고 자료 업로드 (PDF)
            </label>
            <p className="text-xs text-text/50">고인의 약력이나 추모사 작성 시 참고할 PDF 파일을 업로드해주세요.</p>
            <div className="w-full">
              <label 
                htmlFor="pdf-upload" 
                className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-primary/40 rounded-xl cursor-pointer bg-base/30 hover:bg-base/50 transition-colors"
              >
                <div className="flex flex-col items-center justify-center">
                  {isUploadingPdf ? (
                    <Loader2 className="w-8 h-8 text-accent animate-spin" />
                  ) : pdfFileName ? (
                    <>
                      <FileText className="w-8 h-8 text-accent mb-2" />
                      <p className="text-sm text-text font-medium">{pdfFileName}</p>
                      <p className="text-xs text-text/40 mt-1">클릭하여 파일 변경</p>
                    </>
                  ) : (
                    <>
                      <FileUp className="w-8 h-8 text-text/40 mb-2" />
                      <p className="text-sm text-text/60">PDF 파일 선택</p>
                    </>
                  )}
                </div>
                <input id="pdf-upload" type="file" accept=".pdf" className="hidden" onChange={handlePdfUpload} disabled={isUploadingPdf} />
              </label>
            </div>
            {pdfContext && (
              <div className="flex items-center text-xs text-green-600 bg-green-50 p-2 rounded-lg">
                <Check size={14} className="mr-1" /> PDF 내용이 로드되었습니다. ({pdfContext.length}자)
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 1: Basic Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="flex items-center justify-between">
                 <label className="text-sm font-medium text-text/70 flex items-center">
                  <Star size={16} className="mr-2 text-yellow-500" /> 프리미엄 기능
                  {user?.isAdmin && <span className="ml-2 text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">관리자 권한</span>}
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isPremium"
                    id="isPremium"
                    checked={formData.isPremium}
                    onChange={handleCheckboxChange}
                    className="mr-2 w-4 h-4 accent-accent"
                  />
                  <label htmlFor="isPremium" className="text-sm text-text/60">활성화</label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-text/70 flex items-center">
                  <User size={16} className="mr-2" /> 고인 성함
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="예: 홍길동"
                  className="w-full px-4 py-3 rounded-xl border border-primary/30 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all bg-base/50"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text/70 flex items-center">
                    <Calendar size={16} className="mr-2" /> 생년월일
                  </label>
                  <input
                    type="date"
                    name="birthDate"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-primary/30 focus:border-accent outline-none bg-base/50"
                    value={formData.birthDate}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text/70">기일</label>
                  <input
                    type="date"
                    name="deathDate"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-primary/30 focus:border-accent outline-none bg-base/50"
                    value={formData.deathDate}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-text/70">관계</label>
                <input
                  type="text"
                  name="relationship"
                  required
                  placeholder="예: 할아버지, 어머니"
                  className="w-full px-4 py-3 rounded-xl border border-primary/30 focus:border-accent outline-none bg-base/50"
                  value={formData.relationship}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 pt-6">
              <label className="text-sm font-medium text-text/70 flex items-center">
                <Upload size={16} className="mr-2" /> 영정 사진 선택
              </label>
              
              {/* File Upload Input */}
              <div className="w-full">
                <label 
                  htmlFor="photo-upload" 
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-primary/40 rounded-xl cursor-pointer bg-base/30 hover:bg-base/50 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 text-text/40 mb-2" />
                    <p className="text-sm text-text/60">클릭하여 사진 업로드</p>
                  </div>
                  <input id="photo-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {PRESET_PHOTOS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, photoUrl: url }))}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${formData.photoUrl === url ? 'border-accent ring-2 ring-accent/20' : 'border-transparent'}`}
                  >
                    <img src={url} alt="Preset" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
              
              {/* Preview Selected Image */}
              {formData.photoUrl && (
                <div className="mt-4 text-center">
                  <p className="text-xs text-text/50 mb-2">선택된 사진 미리보기</p>
                  <div className="w-32 h-40 mx-auto rounded-lg overflow-hidden border border-primary shadow-sm">
                    <img src={formData.photoUrl} alt="Selected" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text/70 flex items-center mb-2">
                  <BookOpen size={16} className="mr-2" /> 예배 순서 선택
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'simple', label: '간단' },
                    { id: 'standard', label: '중간' },
                    { id: 'formal', label: '정식' }
                  ].map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => handleServiceTypeChange(type.id as ServiceType)}
                      className={`py-2 px-1 rounded-lg text-sm border transition-all ${
                        formData.serviceType === type.id 
                          ? 'bg-accent text-white border-accent' 
                          : 'bg-white text-text/60 border-primary/30 hover:bg-gray-50'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-text/70 flex items-center">
                    <FileText size={16} className="mr-2" /> 대표 기도문
                  </label>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {PRAYER_TEMPLATES.map((t, i) => (
                    <Button 
                      key={i} 
                      type="button" 
                      variant="outline" 
                      size="xs" 
                      className="text-[10px] h-6 px-2 rounded-full"
                      onClick={() => setFormData(prev => ({ ...prev, representativePrayer: t.content }))}
                    >
                      {t.title} 복사
                    </Button>
                  ))}
                </div>
                <textarea
                  name="representativePrayer"
                  rows={4}
                  placeholder="가족 중 한 분 또는 인도자가 기도할 내용을 적어주세요."
                  className="w-full px-4 py-3 rounded-xl border border-primary/30 focus:border-accent outline-none bg-base/50 resize-none"
                  value={formData.representativePrayer}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-text/70 flex items-center mb-2">
                  <BookOpen size={16} className="mr-2" /> 성경 말씀 선택
                </label>
                <select
                  name="scriptureId"
                  className="w-full px-4 py-3 rounded-xl border border-primary/30 focus:border-accent outline-none bg-base/50"
                  value={formData.scriptureId}
                  onChange={handleChange}
                >
                  {SCRIPTURES.map((s) => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
                <div className="p-3 bg-white/50 rounded-lg border border-primary/10 text-xs text-text/70 italic">
                  {SCRIPTURES.find(s => s.id === formData.scriptureId)?.content}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-text/70 flex items-center">
                    <FileText size={16} className="mr-2" /> 추모사 (TTS 나레이션용)
                  </label>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="text-accent h-8"
                    onClick={() => generateAIContent('eulogy')}
                    disabled={isGeneratingEulogy}
                  >
                    {isGeneratingEulogy ? <Loader2 size={14} className="mr-1 animate-spin" /> : <Sparkles size={14} className="mr-1" />}
                    AI 자동생성
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {EULOGY_TEMPLATES.map((t, i) => (
                    <Button 
                      key={i} 
                      type="button" 
                      variant="outline" 
                      size="xs" 
                      className="text-[10px] h-6 px-2 rounded-full"
                      onClick={() => setFormData(prev => ({ ...prev, eulogy: t.content }))}
                    >
                      {t.title} 복사
                    </Button>
                  ))}
                </div>
                <textarea
                  name="eulogy"
                  required
                  rows={6}
                  placeholder="간단한 키워드를 입력하고 'AI 자동생성' 버튼을 누르거나, 직접 내용을 적어주세요."
                  className="w-full px-4 py-3 rounded-xl border border-primary/30 focus:border-accent outline-none bg-base/50 resize-none"
                  value={formData.eulogy}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-text/70 flex items-center">
                    <FileText size={16} className="mr-2" /> 추도 예배문 (Sermon)
                  </label>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {SERMON_TEMPLATES.map((t, i) => (
                    <Button 
                      key={i} 
                      type="button" 
                      variant="outline" 
                      size="xs" 
                      className="text-[10px] h-6 px-2 rounded-full"
                      onClick={() => setFormData(prev => ({ ...prev, sermon: t.content }))}
                    >
                      {t.title} 복사
                    </Button>
                  ))}
                </div>
                <textarea
                  name="sermon"
                  rows={6}
                  placeholder="예배 시 낭독할 말씀을 적어주세요."
                  className="w-full px-4 py-3 rounded-xl border border-primary/30 focus:border-accent outline-none bg-base/50 resize-none"
                  value={formData.sermon}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text/70 flex items-center">
                    <Music size={16} className="mr-2" /> 첫 번째 찬송가 선택
                  </label>
                  <div className="space-y-3">
                    <select
                      name="hymn1_select"
                      className="w-full px-4 py-3 rounded-xl border border-primary/30 focus:border-accent outline-none bg-base/50"
                      value={HYMNS.some(h => h.url === formData.hymn1) ? formData.hymn1 : 'custom'}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'custom') {
                          setFormData(prev => ({ ...prev, hymn1: '' }));
                        } else {
                          setFormData(prev => ({ ...prev, hymn1: val }));
                        }
                      }}
                    >
                      {HYMNS.map((hymn, idx) => (
                        <option key={idx} value={hymn.url}>{hymn.title}</option>
                      ))}
                    </select>
                    {(!HYMNS.some(h => h.url === formData.hymn1) || formData.hymn1 === '') && (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          name="hymn1"
                          placeholder="찬송가 번호 입력"
                          className="flex-1 px-4 py-3 rounded-xl border border-primary/30 focus:border-accent outline-none bg-base/50"
                          value={formData.hymn1}
                          onChange={handleChange}
                        />
                        <span className="text-sm text-text/60">장</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-text/70 flex items-center">
                    <Music size={16} className="mr-2" /> 두 번째 찬송가 선택
                  </label>
                  <div className="space-y-3">
                    <select
                      name="hymn2_select"
                      className="w-full px-4 py-3 rounded-xl border border-primary/30 focus:border-accent outline-none bg-base/50"
                      value={HYMNS.some(h => h.url === formData.hymn2) ? formData.hymn2 : 'custom'}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'custom') {
                          setFormData(prev => ({ ...prev, hymn2: '' }));
                        } else {
                          setFormData(prev => ({ ...prev, hymn2: val }));
                        }
                      }}
                    >
                      {HYMNS.map((hymn, idx) => (
                        <option key={idx} value={hymn.url}>{hymn.title}</option>
                      ))}
                    </select>
                    {(!HYMNS.some(h => h.url === formData.hymn2) || formData.hymn2 === '') && (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          name="hymn2"
                          placeholder="찬송가 번호 입력"
                          className="flex-1 px-4 py-3 rounded-xl border border-primary/30 focus:border-accent outline-none bg-base/50"
                          value={formData.hymn2}
                          onChange={handleChange}
                        />
                        <span className="text-sm text-text/60">장</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Premium Features Section */}
          {formData.isPremium && (
            <Card className="border-accent/30 bg-accent/5">
              <CardContent className="space-y-4 pt-6">
                <h3 className="text-lg font-serif font-medium text-accent mb-4 flex items-center">
                  <Star size={18} className="mr-2 fill-accent" /> 프리미엄 정보
                </h3>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-text/70 flex items-center">
                      <BookOpen size={16} className="mr-2" /> 고인 약력 (Biography)
                    </label>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className="text-accent h-8"
                      onClick={() => generateAIContent('biography')}
                      disabled={isGeneratingBiography}
                    >
                      {isGeneratingBiography ? <Loader2 size={14} className="mr-1 animate-spin" /> : <Sparkles size={14} className="mr-1" />}
                      AI 자동생성
                    </Button>
                  </div>
                  <textarea
                    name="biography"
                    rows={4}
                    placeholder="간단한 키워드를 입력하고 'AI 자동생성' 버튼을 누르거나, 직접 내용을 적어주세요."
                    className="w-full px-4 py-3 rounded-xl border border-primary/30 focus:border-accent outline-none bg-white/80 resize-none"
                    value={formData.biography}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-text/70 flex items-center">
                    <Video size={16} className="mr-2" /> 유튜브 영상 링크
                  </label>
                  <input
                    type="text"
                    name="youtubeUrl"
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-4 py-3 rounded-xl border border-primary/30 focus:border-accent outline-none bg-white/80"
                    value={formData.youtubeUrl}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-text/70 flex items-center">
                    <ImageIcon size={16} className="mr-2" /> 갤러리 이미지 추가 (최대 10개)
                  </label>
                  <div className="w-full">
                    <label 
                      htmlFor="gallery-upload" 
                      className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-primary/40 rounded-xl cursor-pointer bg-white/50 hover:bg-white/80 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center">
                        {isCompressingImages ? (
                          <Loader2 className="w-8 h-8 text-accent animate-spin" />
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-text/40 mb-2" />
                            <p className="text-sm text-text/60">이미지 파일 선택 (다중 선택 가능)</p>
                          </>
                        )}
                      </div>
                      <input id="gallery-upload" type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUpload} disabled={isCompressingImages} />
                    </label>
                  </div>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="이미지 URL 직접 입력"
                      className="flex-1 px-4 py-2 rounded-xl border border-primary/30 focus:border-accent outline-none bg-white/80"
                      value={galleryInput}
                      onChange={(e) => setGalleryInput(e.target.value)}
                    />
                    <Button type="button" onClick={handleAddGalleryImage} size="sm" className="bg-accent text-white">
                      추가
                    </Button>
                  </div>
                  
                  {formData.gallery && formData.gallery.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {formData.gallery.map((url, idx) => (
                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group">
                          <img src={url} alt={`Gallery ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <button
                            type="button"
                            onClick={() => handleRemoveGalleryImage(idx)}
                            className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

        </motion.div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-primary/20 max-w-md mx-auto z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <Button type="submit" className="w-full shadow-lg bg-accent text-white hover:bg-accent/90" size="lg">
            {id ? '수정사항 저장하기' : '추모 공간 생성하기'}
          </Button>
        </div>
      </form>
    </div>
  );
}
