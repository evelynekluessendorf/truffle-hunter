import React, { useState, useRef } from 'react';
import {
  View, Text, Image, TouchableOpacity, ScrollView,
  Dimensions, NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Truffle Hunter colors
const COLORS = {
  piggyPink: '#FFB0C7',
  piggyPinkBright: '#FF7D9E',
  keylinePurple: '#201642',
  cream: '#FAF9F6',
  accentCoral: '#FF6B35',
  accentCoralLight: '#FFF0EB',
  sunnyYellow: '#FFF1C6',
  sunnyYellowBright: '#E8A33D',
};

const progressTrack = '#FBD8CA';   // measured from the About1 comp
const titleRule = '#CF393F';        // the rule under the title is red, not coral
const bodyText = '#000000';         // comp uses black body copy against the purple title

const { width: screenWidth } = Dimensions.get('window');

/** Illustration sizing, per asset aspect. */
const pigWidth = screenWidth * 0.6;

type Line = {
  text: string;
  /** The pig's asides are set in italic in the comps. */
  italic?: boolean;
  /** Extra space below, for the comps' paragraph breaks. */
  gapAfter?: number;
};

/** The three onboarding beats. */
const PAGES: { title: string; lines: Line[]; cta: string }[] = [
  {
    title: 'Welcome to Truffle Hunter?',
    lines: [
      { text: 'Some things are worth looking for.' },
      { text: 'A great coffee.' },
      { text: 'A four-leaf clover.' },
      { text: '“A truffle!” 🐽.' },
      { text: 'A conversation that makes your day.' },
      { text: "Let's go find one." },
    ],
    cta: 'Next →',
  },
  {
    title: "Here's the deal",
    lines: [
      { text: "I'll help you find interesting people." },
      { text: 'You do the saying hello.' },
      // comp sets this italic, then breaks the paragraph before "Turn yourself visible"
      { text: '🐽 "Fair trade, right?"', italic: true, gapAfter: 36 },
      { text: 'Turn yourself visible.' },
      { text: "See who's around." },
      { text: 'Walk over.' },
      { text: 'The rest is up to you' },
    ],
    cta: 'Next →',
  },
  {
    title: 'How it works',
    lines: [
      { text: 'When you get close… oink! You’ll both hear it.' },
      // italic, with a wide break before the closing two lines
      { text: '🐽 "That\'s my cue to leave."', italic: true, gapAfter: 80 },
      { text: 'Now put the phone away.' },
      { text: 'Bye' },
    ],
    cta: 'Start hunting →',
  },
];

/** One illustration per page, sized from its own aspect ratio. */
const ART = [
  { source: require('../assets/illustrations/About 1.png'), aspect: 701 / 830 },
  null, // page 2 is copy-only, as before
  null, // About3 is copy-only in the comp
];

export default function AboutScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [page, setPage] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const lastPage = PAGES.length - 1;

  const goToPage = (index: number) => {
    scrollRef.current?.scrollTo({ x: index * screenWidth, animated: true });
    setPage(index);
  };

  const handleMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setPage(Math.round(e.nativeEvent.contentOffset.x / screenWidth));
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.cream }}>
      {/* Progress — fills a third at a time across the three pages */}
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 24 }}>
        <View style={{ width: '100%', height: 4, backgroundColor: progressTrack, borderRadius: 2 }}>
          <View
            style={{
              width: `${((page + 1) / PAGES.length) * 100}%`,
              height: 4,
              backgroundColor: COLORS.accentCoral,
              borderRadius: 2,
            }}
          />
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        style={{ flex: 1 }}>

        {PAGES.map((p, i) => {
          const art = ART[i];
          return (
            <View key={i} style={{ width: screenWidth }}>
              <ScrollView
                contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16 }}
                showsVerticalScrollIndicator={false}>

                <Text style={{ fontSize: 44, fontFamily: 'Fredoka_700Bold', color: COLORS.keylinePurple, marginBottom: 8 }}>
                  {p.title}
                </Text>
                <View style={{ height: 2, backgroundColor: titleRule, marginBottom: 24 }} />

                {p.lines.map((line, j) => (
                  <Text
                    key={j}
                    style={{
                      fontSize: 16,
                      fontFamily: 'PlusJakartaSans_500Medium',
                      fontStyle: line.italic ? 'italic' : 'normal',
                      color: bodyText,
                      lineHeight: 26,
                      marginBottom: 16 + (line.gapAfter ?? 0),
                    }}>
                    {line.text}
                  </Text>
                ))}

                {art && (
                  <View style={{ flex: 1, alignItems: 'flex-start', justifyContent: 'center', minHeight: 200, marginTop: 16 }}>
                    <Image
                      source={art.source}
                      style={{ width: pigWidth, height: pigWidth * art.aspect }}
                      resizeMode="contain"
                    />
                  </View>
                )}

                <View style={{ flex: 1 }} />
              </ScrollView>
            </View>
          );
        })}
      </ScrollView>

      <View
        style={{
          paddingHorizontal: 24, paddingTop: 8,
          paddingBottom: insets.bottom + 8, backgroundColor: COLORS.cream,
        }}>
        <TouchableOpacity
          onPress={() =>
            page < lastPage ? goToPage(page + 1) : navigation.navigate('Registration1', { mode: 'register' })
          }
          activeOpacity={0.85}
          style={{
            height: 56, borderRadius: 28, backgroundColor: COLORS.accentCoral,
            alignItems: 'center', justifyContent: 'center',
            boxShadow: '3px 3px 0px rgba(32,22,66,0.18)',
          } as any}>
          <Text style={{ color: '#FFFFFF', fontSize: 15, fontFamily: 'Fredoka_700Bold' }}>
            {PAGES[page].cta}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
