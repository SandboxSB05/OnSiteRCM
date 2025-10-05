import React, { useState, useRef } from 'react';
import { UploadFile } from '@/api/integrations';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

export default function PhotoUploader({ photos, onChange }) {
  const safePhotos = Array.isArray(photos) ? photos : [];
  const [isUploading, setIsUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef(null);
  const { toast } = useToast();

  const handleFiles = async (files) => {
    if (!files) return;
    
    setIsUploading(true);
    try {
      const fileArray = Array.from(files);
      const acceptedFiles = fileArray.filter(file => file && file.type && file.type.startsWith('image/'));
      
      if (acceptedFiles.length === 0) {
         setIsUploading(false);
         return;
      }
      
      const uploadPromises = acceptedFiles.map(file => UploadFile({ file }));
      const results = await Promise.all(uploadPromises);
      const newPhotos = results.map(res => res.file_url).filter(url => url);
      
      if (onChange) {
        onChange([...safePhotos, ...newPhotos]);
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      toast({
        title: "Upload Failed",
        description: "Could not upload one or more photos.",
        variant: "destructive",
      });
    }
    setIsUploading(false);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target && e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };
  
  const onDivClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleRemove = (index) => {
    if (onChange && typeof index === 'number' && index >= 0 && index < safePhotos.length) {
      const newPhotos = safePhotos.filter((_, i) => i !== index);
      onChange(newPhotos);
    }
  };

  return (
    <div>
      <div
        onClick={onDivClick}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input 
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />
        {isUploading ? (
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
            <p>Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <p>Drag & drop photos here, or click to select</p>
          </div>
        )}
      </div>

      {safePhotos.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mt-4">
          {safePhotos.map((photo, index) => (
            <div key={`photo-${index}`} className="relative group">
              <img src={photo} alt={`progress ${index + 1}`} className="w-full h-24 object-cover rounded-md" />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemove(index)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}