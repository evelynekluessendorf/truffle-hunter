import type { ProfileData } from '../components/ProfileView';

/**
 * MOCK profile data. Swap for real API/context data later —
 * the shape matches ProfileData exactly.
 */

/**
 * Shared interaction ring — 5 distinct people, max-quality 400x400.
 * Every URL here is verified live (200); the previous slots 3 and 4
 * pointed at Unsplash IDs that 404, which is why they rendered empty.
 */
const AVATAR_RING = [
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&h=400&q=100',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=100',
  'https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&w=400&h=400&q=100',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&h=400&q=100',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&h=400&q=100',
];

const ring = () => AVATAR_RING.map((uri, i) => ({ id: String(i), avatar: { uri } }));

/** Upgrade any Unsplash URL to a full-bleed, max-quality hero image. */
export const heroUrl = (url: string) =>
  `${url.split('?')[0]}?auto=format&fit=crop&w=1200&h=1200&q=100`;

/** Generate social handles from a display name. */
export const socialsFor = (name: string): Record<string, string> => {
  const handle = name.trim().toLowerCase().replace(/\s+/g, '');
  return {
    instagram: `https://instagram.com/${handle}`,
    tiktok: `https://tiktok.com/@${handle}`,
    x: `https://x.com/${handle}`,
    facebook: `https://facebook.com/${handle}`,
  };
};

export const MOCK_PROFILES: ProfileData[] = [
  {
    profilePhoto: { uri: 'https://images.unsplash.com/photo-1521252659862-eec69941b071?auto=format&fit=crop&w=1200&h=1200&q=100' },
    name: 'Amy',
    year: 'Junior',
    major: 'Physical Therapy',
    recentInteractions: ring(),
    convoCount: 7,
    daySpan: 30,
    interests: ['Music', 'Food', 'Nature', 'Photography'],
    icebreakers: [
      'I built a robot that makes pancakes',
      'I once cycled across an entire country in a week',
      'I have memorised pi to 50 decimal places',
    ],
    socialMedia: {
      instagram: 'https://instagram.com/amysmith',
      tiktok: 'https://tiktok.com/@amysmith',
      x: 'https://x.com/amysmith',
      facebook: 'https://facebook.com/amysmith',
    },
  },
  {
    profilePhoto: { uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&h=1200&q=100' },
    name: 'Marcus',
    year: 'Senior',
    major: 'Computer Science',
    recentInteractions: ring(),
    convoCount: 23,
    daySpan: 30,
    interests: ['Tech', 'Gaming', 'Running', 'Podcasts'],
    icebreakers: [
      'I can code an entire app in one weekend',
      "I've competed in three hackathons and won twice",
      'I speak five programming languages fluently',
      'I once debugged code that stumped a senior engineer',
    ],
    socialMedia: {
      instagram: 'https://instagram.com/marcusjones',
      tiktok: 'https://tiktok.com/@marcusjones',
      x: 'https://x.com/marcusjones',
      facebook: 'https://facebook.com/marcusjones',
    },
  },
  {
    profilePhoto: { uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&h=1200&q=100' },
    name: 'Sophie',
    year: 'Junior',
    major: 'Business',
    recentInteractions: ring(),
    convoCount: 42,
    daySpan: 30,
    interests: ['Art', 'Film', 'Travel', 'Reading', 'Theatre'],
    icebreakers: [
      'I started a side business in high school',
      "I've volunteered at three nonprofits",
      'I can teach anyone to make sourdough',
      "I'm fluent in three languages",
      'I won a public speaking competition last year',
    ],
    // Deliberately only 3 links — no TikTok, to exercise a varying count.
    socialMedia: {
      instagram: 'https://instagram.com/sophiebrown',
      x: 'https://x.com/sophiebrown',
      facebook: 'https://facebook.com/sophiebrown',
    },
  },
];

export const DEFAULT_PROFILE = MOCK_PROFILES[0];
