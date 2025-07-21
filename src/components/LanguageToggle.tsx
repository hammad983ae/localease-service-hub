
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const languages = [
    { code: 'en', label: 'EN' },
    { code: 'fr', label: 'FR' },
    { code: 'de', label: 'DE' },
  ] as const;

  return (
    <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
      {languages.map((lang) => (
        <Button
          key={lang.code}
          variant="ghost"
          size="sm"
          onClick={() => setLanguage(lang.code)}
          className={cn(
            "h-8 px-3 text-xs font-medium transition-all duration-200",
            language === lang.code
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
          )}
        >
          {lang.label}
        </Button>
      ))}
    </div>
  );
};

export default LanguageToggle;
