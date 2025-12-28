import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, Loader2, X, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface ResumeUploadProps {
  userId: string;
  currentResumeUrl?: string | null;
  onUploadComplete: (resumeUrl: string) => void;
}

export function ResumeUpload({
  userId,
  currentResumeUrl,
  onUploadComplete,
}: ResumeUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(currentResumeUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const acceptedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!acceptedTypes.includes(file.type)) {
      toast({
        variant: 'destructive',
        title: 'Invalid file type',
        description: 'Please upload a PDF or DOCX file.',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'File too large',
        description: 'Maximum file size is 5MB.',
      });
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !userId) return;

    setIsUploading(true);

    try {
      // Upload to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const filePath = `${userId}/resume.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, selectedFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('resumes')
        .getPublicUrl(filePath);

      const resumeUrl = urlData.publicUrl;
      setUploadedUrl(resumeUrl);

      onUploadComplete(resumeUrl);

      toast({
        title: 'Resume uploaded successfully!',
        description: 'Your resume has been saved.',
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: error.message || 'Failed to upload resume',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Already uploaded indicator */}
      {uploadedUrl && !selectedFile && (
        <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-green-700 dark:text-green-400">Resume uploaded</p>
              <p className="text-sm text-green-600 dark:text-green-500">Your resume is ready</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setUploadedUrl(null);
              }}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Replace
            </Button>
          </div>
        </div>
      )}

      {/* File input */}
      {(!uploadedUrl || selectedFile) && (
        <>
          <div
            className={cn(
              'relative border-2 border-dashed rounded-xl p-6 transition-all cursor-pointer',
              'hover:border-primary/50 hover:bg-primary/5',
              selectedFile ? 'border-primary bg-primary/5' : 'border-border'
            )}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="flex flex-col items-center justify-center gap-3 text-center">
              {selectedFile ? (
                <>
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearFile();
                    }}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </>
              ) : (
                <>
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">Upload your resume</p>
                    <p className="text-sm text-muted-foreground">
                      PDF or DOCX (max 5MB)
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Upload button */}
          {selectedFile && (
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Resume
                </>
              )}
            </Button>
          )}
        </>
      )}
    </div>
  );
}
