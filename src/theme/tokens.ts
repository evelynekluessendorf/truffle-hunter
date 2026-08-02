// Truffle Hunter design tokens — see .claude/skills/truffle-hunter-design

export const ColorPrimitives = {
  cream: '#FAF9F6',
  white: '#FFFFFF',
  piggyPink: '#FFB0C7',
  piggyPinkBright: '#FF7D9E',
  keylinePurple: '#201642',
  gray500: '#6B7280',
  gray300: '#D1D5DB',
  gray100: '#F3F4F6',
  accentCoral: '#FF6B35',
  accentCoralLight: '#FFF0EB',
  sunnyYellow: '#FFF1C6',
  sunnyYellowBright: '#E8A33D',
  black: '#000000',
} as const;

export const Colors = {
  background: ColorPrimitives.cream,
  surface: ColorPrimitives.white,
  elevated: ColorPrimitives.gray100,
  textPrimary: ColorPrimitives.keylinePurple,
  textSecondary: ColorPrimitives.gray500,
  brand: ColorPrimitives.piggyPink,
  cta: ColorPrimitives.accentCoral,
  strokeStrong: ColorPrimitives.keylinePurple,
  strokeSubtle: ColorPrimitives.gray300,
  availabilityFill: ColorPrimitives.sunnyYellow,
  availabilityDot: ColorPrimitives.sunnyYellowBright,
} as const;

export const Spacing = {
  space1: 4,
  space2: 8,
  space3: 12,
  space4: 16,
  space5: 20,
  space6: 24,
  space7: 32,
  space8: 48,
  space9: 64,
} as const;

export const Radius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 999,
} as const;

export type ColorPrimitiveName = keyof typeof ColorPrimitives;
export type ColorName = keyof typeof Colors;
export type SpacingName = keyof typeof Spacing;
export type RadiusName = keyof typeof Radius;
