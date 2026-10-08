'use client';

import React from 'react';
import { Typography } from '@readixon/ui';
import { 
  Target, Users, MessageSquare, Globe, PenLine, Layers, 
  Scissors, Rocket, Swords, Wand2, ArrowRight
} from 'lucide-react';
import { AcademyCategory, AcademyLesson } from '../types';

interface CategoriesSectionProps {
  categories: AcademyCategory[];
  lessons: AcademyLesson[];
  onSelectCategory: (categoryTitle: string) => void;
}

export default function CategoriesSection({
  categories,
  lessons,
  onSelectCategory
}: CategoriesSectionProps) {
  const getCategoryIcon = (iconName: string, color: string) => {
    const props = { size: 20, className: color };
    switch (iconName) {
      case 'Target':
        return <Target {...props} />;
      case 'Users':
        return <Users {...props} />;
      case 'MessageSquare':
        return <MessageSquare {...props} />;
      case 'Globe':
        return <Globe {...props} />;
      case 'PenLine':
        return <PenLine {...props} />;
      case 'Layers':
        return <Layers {...props} />;
      case 'Scissors':
        return <Scissors {...props} />;
      case 'Rocket':
        return <Rocket {...props} />;
      case 'Swords':
        return <Swords {...props} />;
      case 'Wand2':
      default:
        return <Wand2 {...props} />;
    }
  };

  return (
    <div className="space-y-5 mb-12">
      <div>
        <span className="text-xs font-extrabold uppercase tracking-widest text-primary block mb-1">
          UZMANLAŞ
        </span>
        <h2 className="text-2xl font-black text-text tracking-tight">
          Uzmanlık Alanları
        </h2>
        <p className="text-sm text-muted">
          Belirli bir edebi veya teknik alanda derinleşmek için kategorileri keşfet.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map((cat) => {
          const catLessonCount = lessons.filter((l) => l.category.includes(cat.title.split('&')[0].trim())).length;

          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.title)}
              className="p-5 rounded-3xl border border-border/50 bg-card/60 hover:border-primary/40 hover:bg-card transition-all cursor-pointer flex flex-col justify-between group shadow-xs hover:shadow-md"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-muted/10 border border-border/40 flex items-center justify-center group-hover:scale-105 transition-transform">
                  {getCategoryIcon(cat.iconName, cat.color)}
                </div>

                <h3 className="font-extrabold text-text text-base group-hover:text-primary transition-colors">
                  {cat.title}
                </h3>

                <p className="text-xs text-muted leading-relaxed line-clamp-2">
                  {cat.description}
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-border/30 flex items-center justify-between text-xs">
                <span className="text-muted font-semibold">
                  {catLessonCount > 0 ? `${catLessonCount} Ders` : 'Genişliyor'}
                </span>
                <span className="text-primary font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  İncele <ArrowRight size={13} />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
