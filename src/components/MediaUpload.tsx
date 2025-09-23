
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AudioLines, Image, FileVideo, X } from 'lucide-react';

interface MediaUploadProps {
  onMediaUpload: (files: File[], type: 'image' | 'video' | 'audio') => void;
  className?: string;
}

const MediaUpload = ({ onMediaUpload, className }: MediaUploadProps) => {
  const [activeType, setActiveType] = useState<'image' | 'video' | 'audio' | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !activeType) return;
    
    const selectedFiles = Array.from(e.target.files);
    setFiles([...files, ...selectedFiles]);
    
    // Create preview URLs for the uploaded files
    const newPreviewUrls = selectedFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls([...previewUrls, ...newPreviewUrls]);
    
    // Notify parent component
    onMediaUpload([...files, ...selectedFiles], activeType);
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    const newPreviewUrls = [...previewUrls];
    
    // Revoke the URL to avoid memory leaks
    URL.revokeObjectURL(previewUrls[index]);
    
    newFiles.splice(index, 1);
    newPreviewUrls.splice(index, 1);
    
    setFiles(newFiles);
    setPreviewUrls(newPreviewUrls);
    
    // Notify parent component
    if (activeType) {
      onMediaUpload(newFiles, activeType);
    }
  };

  const renderPreviews = () => {
    if (!activeType || previewUrls.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-2 mt-4">
        {previewUrls.map((url, index) => (
          <div key={index} className="relative">
            {activeType === 'image' && (
              <img src={url} alt="Preview" className="w-20 h-20 object-cover rounded" />
            )}
            {activeType === 'video' && (
              <video src={url} className="w-20 h-20 object-cover rounded" controls />
            )}
            {activeType === 'audio' && (
              <div className="w-20 h-20 flex items-center justify-center bg-white rounded">
                <AudioLines size={24} />
              </div>
            )}
            <button
              type="button"
              className="absolute -top-2 -right-2 bg-black text-white rounded-full p-1"
              onClick={() => removeFile(index)}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={activeType === 'image' ? "default" : "outline"}
          onClick={() => setActiveType('image')}
        >
          <Image size={18} className="mr-2" />
          Photo
        </Button>
        <Button
          type="button"
          variant={activeType === 'video' ? "default" : "outline"}
          onClick={() => setActiveType('video')}
        >
          <FileVideo size={18} className="mr-2" />
          Video
        </Button>
        <Button
          type="button"
          variant={activeType === 'audio' ? "default" : "outline"}
          onClick={() => setActiveType('audio')}
        >
          <AudioLines size={18} className="mr-2" />
          Audio
        </Button>
      </div>
      
      {activeType && (
        <div className="mt-2">
          <input
            type="file"
            id="media-upload"
            className="hidden"
            accept={
              activeType === 'image' 
                ? 'image/*' 
                : activeType === 'video' 
                  ? 'video/*' 
                  : 'audio/*'
            }
            onChange={handleFileChange}
            multiple
          />
          <label htmlFor="media-upload">
            <div className="border-2 border-dashed border-black p-4 rounded-lg cursor-pointer hover:bg-white text-center">
              <p>
                Click to upload {activeType === 'image' ? 'photos' : activeType === 'video' ? 'videos' : 'audio recordings'}
              </p>
              <p className="text-sm text-black">
                {activeType === 'image' ? 'PNG, JPG, GIF' : activeType === 'video' ? 'MP4, WebM, Ogg' : 'MP3, WAV, Ogg'} files are supported
              </p>
            </div>
          </label>
        </div>
      )}
      
      {renderPreviews()}
    </div>
  );
};

export default MediaUpload;
