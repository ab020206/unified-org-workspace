import React, { useRef, useState } from 'react';
import { TicketAttachmentDto, UserPayload } from '@workspace/shared-types';
import { Paperclip, Image, FileText, Archive, Upload, Trash2 } from 'lucide-react';

interface Props {
  attachments: TicketAttachmentDto[];
  currentUser: UserPayload | null;
  onUpload: (file: File) => Promise<void>;
  onDelete: (attachmentId: string) => Promise<void>;
}

export function AttachmentUpload({
  attachments,
  currentUser: _currentUser,
  onUpload,
  onDelete,
}: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('File size exceeds maximum limit of 10MB');
      return;
    }

    setIsUploading(true);
    try {
      await onUpload(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setErrorMsg(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const renderFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="w-4 h-4 text-blue-500" />;
    if (mimeType.includes('pdf')) return <FileText className="w-4 h-4 text-rose-500" />;
    if (mimeType.includes('zip')) return <Archive className="w-4 h-4 text-amber-500" />;
    return <Paperclip className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-bold text-foreground">
        <Paperclip className="w-4 h-4 text-primary" />
        <span>Attachments ({attachments.length})</span>
      </div>

      <div className="space-y-2">
        {attachments.map((att) => (
          <div
            key={att.id}
            className="p-3 rounded-xl border border-border bg-card shadow-2xs flex items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-center gap-2 min-w-0">
              {renderFileIcon(att.mimeType)}
              <span className="font-semibold text-foreground truncate">{att.fileName}</span>
              <span className="text-[10px] text-muted-foreground font-mono">
                ({formatFileSize(att.fileSize)})
              </span>
            </div>

            <button
              onClick={() => onDelete(att.id)}
              className="p-1 rounded text-muted-foreground hover:text-rose-500 hover:bg-secondary transition-colors"
              title="Delete attachment"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      <div className="pt-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          id="file-upload-input"
        />
        <label
          htmlFor="file-upload-input"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-secondary text-secondary-foreground text-xs font-semibold hover:bg-secondary/80 cursor-pointer transition-colors"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>{isUploading ? 'Uploading...' : 'Upload File (Max 10MB)'}</span>
        </label>
        {errorMsg && <p className="text-xs text-rose-500 mt-1 font-mono">{errorMsg}</p>}
      </div>
    </div>
  );
}
