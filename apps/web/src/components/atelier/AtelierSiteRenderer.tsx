'use client';

import React from 'react';
import type { AuthorSite, Story, AtelierThemeMode } from '@readixon/core';
import { AtelierThemeProvider } from './AtelierThemeContext';
import { AtelierHeader } from './AtelierHeader';
import { AtelierHero } from './AtelierHero';
import { AtelierBookshelf } from './AtelierBookshelf';
import { AtelierUniverse } from './AtelierUniverse';
import { AtelierAbout } from './AtelierAbout';
import { AtelierEvents } from './AtelierEvents';
import { AtelierNewsletter } from './AtelierNewsletter';
import { AtelierSocial } from './AtelierSocial';
import { AtelierFooter } from './AtelierFooter';

interface Props {
  site: AuthorSite;
  initialStories?: Story[];
  overrideMode?: AtelierThemeMode;
}

export function AtelierSiteRenderer({ site, initialStories, overrideMode }: Props) {
  const blocksOrder = site.blocksOrder || ['hero', 'books', 'universe', 'about', 'events', 'newsletter', 'social'];

  const renderBlock = (blockKey: string) => {
    switch (blockKey) {
      case 'hero':
        return <AtelierHero key="hero" site={site} />;
      case 'books':
        return <AtelierBookshelf key="books" site={site} initialStories={initialStories} />;
      case 'universe':
        return <AtelierUniverse key="universe" site={site} />;
      case 'about':
        return <AtelierAbout key="about" site={site} />;
      case 'events':
        return <AtelierEvents key="events" site={site} />;
      case 'newsletter':
        return <AtelierNewsletter key="newsletter" site={site} />;
      case 'social':
        return <AtelierSocial key="social" site={site} />;
      default:
        return null;
    }
  };

  return (
    <AtelierThemeProvider site={site} overrideMode={overrideMode}>
      <div className="flex flex-col min-h-screen">
        <AtelierHeader site={site} />
        <main className="flex-1">
          {blocksOrder.map((blockKey) => renderBlock(blockKey))}
        </main>
        <AtelierFooter site={site} />
      </div>
    </AtelierThemeProvider>
  );
}

