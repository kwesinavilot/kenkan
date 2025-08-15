// Voice definitions for Kenkan TTS Engine

export interface VoiceProfile {
  name: string;
  language: string;
  description: string;
  characteristics: {
    gender: 'male' | 'female';
    age: string;
    tone: string;
    pace: string;
    accent?: string;
    specialties: string[];
  };
  audioQuality: string;
}

export const KENKAN_VOICES: Record<string, VoiceProfile> = {
  Sandra: {
    name: "Sandra",
    language: "English",
    description: "A warm, friendly African female voice in her late 20s. Light, conversational tone with a gentle rhythm that feels like catching up with a close friend. Slight West African lilt adds cultural warmth. Speaks at a relaxed pace with soft inflections and cheerful energy. Perfect for casual updates and relatable content.",
    characteristics: {
      gender: 'female',
      age: 'late 20s',
      tone: 'warm, friendly, conversational',
      pace: 'relaxed',
      accent: 'West African lilt',
      specialties: ['casual content', 'friendly updates', 'relatable content']
    },
    audioQuality: "Clean studio sound"
  },

  Kwesi: {
    name: "Kwesi",
    language: "English",
    description: "A deep, confident male voice of a seasoned African news anchor in his early 40s. Smooth, commanding tone with a refined, articulate delivery that radiates authority and trust. Speaks at a measured, deliberate pace with clear enunciation and no slang. Ideal for formal news reads and serious commentary.",
    characteristics: {
      gender: 'male',
      age: 'early 40s',
      tone: 'deep, confident, commanding',
      pace: 'measured, deliberate',
      accent: 'African',
      specialties: ['news', 'formal content', 'serious commentary', 'authoritative content']
    },
    audioQuality: "Broadcast-quality audio"
  },

  Kwame: {
    name: "Kwame",
    language: "English",
    description: "A rich, expressive African voice of a seasoned storyteller in their mid-40s. Warm and engaging tone with steady pacing, dynamic modulation, and dramatic pauses for emphasis. Sounds like a trusted radio documentarian or podcast narrator with a smooth West African cadence. Perfect for longform summaries or deep dives.",
    characteristics: {
      gender: 'male',
      age: 'mid-40s',
      tone: 'rich, expressive, warm, engaging',
      pace: 'steady with dynamic modulation',
      accent: 'West African cadence',
      specialties: ['storytelling', 'documentaries', 'podcasts', 'longform content', 'deep dives']
    },
    audioQuality: "High-quality audio"
  },

  Akua: {
    name: "Akua",
    language: "French",
    description: "A warm, eloquent West African French female voice in her early 30s. Graceful and articulate with a smooth, lyrical cadence that reflects the Francophone cultures of West Africa. Speaks with clear Parisian-French pronunciation softened by subtle regional intonations, adding authenticity and charm. Maintains a gentle rhythm with expressive rises and falls, making her ideal for storytelling, educational content, and heartfelt messages.",
    characteristics: {
      gender: 'female',
      age: 'early 30s',
      tone: 'warm, eloquent, graceful, articulate',
      pace: 'gentle rhythm with expressive modulation',
      accent: 'West African French with Parisian pronunciation',
      specialties: ['storytelling', 'educational content', 'heartfelt messages', 'French content']
    },
    audioQuality: "High-fidelity studio sound"
  }
};

export type KenkanVoiceName = keyof typeof KENKAN_VOICES;