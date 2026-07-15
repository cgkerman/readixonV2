import { Timestamp } from 'firebase/firestore';

export interface ModuleA {
  characterTraits: string;
  showTraitsWays: string;
  hook: string;
  characterDevelopment: string;
  internalState: string;
  mystery: string;
  atmosphere: string[];
  atmosphereNotes: string;
  closure: string;
}

export interface ModuleC {
  perceptionIllusion: string;
  motivations: string;
  unknownDetails: string;
  surpriseEventForReader: string;
  surpriseEventForCharacter: string;
  impactAnalysis: string;
}

export interface ModuleD {
  protagonistEnding: string;
  antagonistEnding: string;
  startingPoint: string;
  endingPoint: string;
  symbolOfChange: string;
  whoRemained: string;
  emotionalImpact: string;
  pricePaid: string;
  alternativeEnding: string;
}

export interface StoryPlanner {
  storyId: string;
  moduleA?: Partial<ModuleA>;
  moduleC?: Partial<ModuleC>;
  moduleD?: Partial<ModuleD>;
  updatedAt: Timestamp;
}

export interface ModuleB {
  todoList: { id: string; text: string; isCompleted: boolean }[];
  internalStateStart: string;
  internalStateEnd: string;
  externalStateStart: string;
  externalStateEnd: string;
  importantDetails: string;
  mainConflict?: string;
  risingAction?: string;
  chapterClimax?: string;
  fallingAction?: string;
  hookForNext?: string;
}

export interface ChapterPlanner {
  chapterId: string;
  storyId: string;
  moduleB?: Partial<ModuleB>;
  updatedAt: Timestamp;
}
