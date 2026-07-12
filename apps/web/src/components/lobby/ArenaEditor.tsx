import React, { useMemo } from 'react';
import { Typography } from '@readixon/ui';
import { AlertCircle } from 'lucide-react';

interface ArenaEditorProps {
  value: string;
  onChange: (value: string) => void;
  wordLimit: number;
  disabled?: boolean;
}

export const ArenaEditor: React.FC<ArenaEditorProps> = ({
  value,
  onChange,
  wordLimit,
  disabled = false
}) => {
  const wordCount = useMemo(() => {
    return value.trim().split(/\s+/).filter(word => word.length > 0).length;
  }, [value]);

  const isNearLimit = wordCount >= wordLimit - 50;
  const isOverLimit = wordCount > wordLimit;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    const currentWords = text.trim().split(/\s+/).filter(word => word.length > 0).length;
    
    // Eğer limit aşılmışsa ve kullanıcı hala kelime eklemeye çalışıyorsa izin verme
    // Geri silmesine izin vermeliyiz
    if (currentWords > wordLimit && text.length > value.length) {
       return; 
    }
    onChange(text);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    // Kopya/yapıştır tamamen engellendi.
  };

  return (
    <div className="flex flex-col gap-2 relative">
      <div className={`
        border-2 rounded-2xl overflow-hidden bg-background focus-within:ring-4 transition-all
        ${isOverLimit ? 'border-destructive focus-within:ring-destructive/20' : 
          isNearLimit ? 'border-amber-500 focus-within:ring-amber-500/20' : 
          'border-border focus-within:border-primary focus-within:ring-primary/20'}
      `}>
        <textarea
          className="w-full min-h-[400px] p-6 bg-transparent text-text resize-y outline-none leading-relaxed text-lg disabled:opacity-50"
          value={value}
          onChange={handleChange}
          onPaste={handlePaste}
          onCopy={(e) => e.preventDefault()}
          onCut={(e) => e.preventDefault()}
          placeholder="Kelime kelime inşa et. Kopyalamak yok, sadece sen ve düşüncelerin..."
          disabled={disabled}
          spellCheck={false}
        />
        <div className="flex justify-between items-center p-4 bg-card/50 border-t border-border/50">
          <div className="flex items-center gap-2">
            <Typography variant="caption" className="text-muted flex items-center gap-1 font-medium">
              <AlertCircle size={14} className="text-primary" />
              Kopyala/Yapıştır devredışı.
            </Typography>
          </div>
          
          <div className="flex items-center gap-2">
            <Typography variant="caption" className={`
              font-bold px-3 py-1 rounded-full
              ${isOverLimit ? 'bg-destructive/10 text-destructive' : 
                isNearLimit ? 'bg-amber-500/10 text-amber-500' : 
                'bg-primary/10 text-primary'}
            `}>
              {wordCount} / {wordLimit} Kelime
            </Typography>
          </div>
        </div>
      </div>
      
      {isNearLimit && !isOverLimit && (
        <Typography variant="caption" className="text-amber-500 px-2 animate-pulse">
          Kelime sınırına yaklaşıyorsunuz. Lütfen kurguyu toparlamaya başlayın.
        </Typography>
      )}
      
      {isOverLimit && (
        <Typography variant="caption" className="text-destructive px-2 font-bold animate-bounce">
          Kelime sınırını aştınız! Lütfen metni kısaltın.
        </Typography>
      )}
    </div>
  );
};
