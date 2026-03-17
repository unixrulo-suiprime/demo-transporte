import React, { useState, useRef } from 'react';
import { Camera, X, UploadCloud } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ImageUploadProps {
  label?: string;
  value?: string;
  onChange?: (file: File | null) => void;
  onDataUrl?: (base64: string | null) => void;
  className?: string;
}

const MAX_WIDTH = 800;
const QUALITY = 0.7;

function compressImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      if (width > MAX_WIDTH) {
        height = Math.round((height * MAX_WIDTH) / width);
        width = MAX_WIDTH;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', QUALITY));
    };
    img.src = URL.createObjectURL(file);
  });
}

export const ImageUpload = ({ label, value, onChange, onDataUrl, className }: ImageUploadProps) => {
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const dataUrl = await compressImage(file);
      setPreview(dataUrl);
      onDataUrl?.(dataUrl);
      onChange?.(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onChange?.(null);
    onDataUrl?.(null);
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <div 
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "relative group cursor-pointer aspect-video md:aspect-[4/3] rounded-xl border-2 border-dashed border-enterprise-border-light dark:border-enterprise-border-dark flex flex-col items-center justify-center overflow-hidden transition-all duration-200 hover:border-primary-500 hover:bg-primary-50/10",
          preview && "border-solid border-primary-500"
        )}
      >
        {preview ? (
          <>
            <img src={preview} alt="Vista previa" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="text-white" size={32} />
            </div>
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 transition-colors"
            >
              <X size={16} />
            </button>
          </>
        ) : (
          <div className="text-center p-6">
            <div className="inline-flex p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mb-3">
              <UploadCloud size={32} />
            </div>
            <p className="text-sm font-medium text-enterprise-text-light dark:text-enterprise-text-dark">
              Haz clic para subir imagen
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              JPG, PNG o WEBP (Máx. 5MB)
            </p>
          </div>
        )}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept="image/*"
        />
      </div>
    </div>
  );
};
