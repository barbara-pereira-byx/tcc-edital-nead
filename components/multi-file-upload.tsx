// components/multi-file-upload.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Upload, FileIcon } from "lucide-react";

interface MultiFileUploadProps {
  id: string;
  name: string;
  label: string;
  required?: boolean;
}

export function MultiFileUpload({ id, name, label, required }: MultiFileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-col">
        <label htmlFor={id} className="text-sm font-medium mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="flex items-center gap-2">
          <Input
            id={id}
            name={name}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileChange}
            required={required && files.length === 0}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById(id)?.click()}
            className="w-full flex items-center gap-2"
          >
            <Upload size={16} />
            Adicionar arquivo(s)
          </Button>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-2 mt-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-slate-50 p-2 rounded-md border"
            >
              <div className="flex items-center gap-2">
                <FileIcon size={16} className="text-blue-500" />
                <span className="text-sm truncate max-w-[200px]">
                  {file.name}
                </span>
                <span className="text-xs text-slate-500">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
                className="h-6 w-6 p-0"
              >
                <X size={14} />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
