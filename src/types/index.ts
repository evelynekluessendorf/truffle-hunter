export interface SocialLinks {
  instagram?: string;
  tiktok?: string;
  facebook?: string;
}

export interface User {
  id: string;
  name: string;
  year: string;
  major: string;
  iceBreakers: string[];
  interests: string[];
  openers: string[];
  avatarColor: string;
  photoUri?: string;
  conversationCount?: number;
  distance?: string;
  latitude?: number;
  longitude?: number;
  socialLinks?: SocialLinks;
}

export interface Shoutout {
  id: string;
  authorName: string;
  authorYear: string;
  authorMajors: string;
  authorColor: string;
  message: string;
  distance: string;
  timeAgo: string;
}

export type RootTabParamList = {
  Home: undefined;
  Discover: { sendoffUser?: User; sayHiUser?: User } | undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Welcome: undefined;
  About: undefined;
  Registration1: { mode?: 'login' };
  RegistrationVerification: { mode?: 'login' };
  Registration2: undefined;
  Registration3: undefined;
  Registration4: undefined;
  Registration5: undefined;
  RegistrationFacts: undefined;
  RegistrationInterests: undefined;
  ShoutOut: undefined;
  Opener: { user: User };
  Login: undefined;
  Main: undefined;
  UserProfile: { user: User };
  MeetingSheet: { user: User };
};
