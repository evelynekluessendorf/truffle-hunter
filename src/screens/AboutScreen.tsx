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

const progressTrack = 'rgba(255,107,53,0.25)';

const { width: screenWidth } = Dimensions.get('window');

/** Illustration sizing, per asset aspect. */
const pigWidth = screenWidth * 0.6;

type Line = { text: string; pig?: boolean };

/** The three onboarding beats. `pig` lines are the truffle pig's asides. */
const PAGES: { title: string; lines: Line[]; cta: string }[] = [
  {
    title: 'Welcome to Truffle Hunter',
    lines: [
      { text: 'Some things are worth looking for.' },
      { text: 'A great coffee.' },
      { text: 'A four-leaf clover.' },
      { text: '“A truffle!” 🐽.', pig: true },
      { text: 'A conversation that makes your day.' },
      { text: "Let's go find one." },
    ],
    cta: 'Next →',
  },
  {
    title: "Here's the deal.",
    lines: [
      { text: "I'll help you find interesting people." },
      { text: 'You do the saying hello.' },
      { text: '🐽 "Fair trade, right?"', pig: true },
      { text: 'Turn yourself visible.' },
      { text: "See who's around." },
      { text: 'Walk over.' },
      { text: 'The rest is up to you' },
    ],
    cta: 'Next →',
  },
  {
    title: 'Listen for the oink.',
    lines: [
      { text: 'When you get close… oink! You’ll both hear it.' },
      { text: '🐽 "That\'s my cue to leave."', pig: true },
      { text: 'Now put the phone away.' },
      { text: 'Bye' },
    ],
    cta: 'Start Hunting →',
  },
];

/** One illustration per page, sized from its own aspect ratio. */
const ART = [
  { source: require('../assets/illustrations/About 1.png'), aspect: 701 / 830 },
  null, // page 2 is copy-only, as before
  { source: require('../assets/illustrations/sleeping-pig.png'), aspect: 1026 / 968 },
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
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 24, alignItems: 'center' }}>
        <View style={{ width: '55%', height: 3, backgroundColor: progressTrack, borderRadius: 2 }}>
          <View
            style={{
              width: `${((page + 1) / PAGES.length) * 100}%`,
              height: 3,
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
                <View style={{ height: 2, backgroundColor: COLORS.accentCoral, marginBottom: 24 }} />

                {p.lines.map((line, j) => (
                  <Text
                    key={j}
                    style={{
                      fontSize: line.pig ? 17 : 16,
                      fontFamily: line.pig ? 'Fredoka_700Bold' : 'PlusJakartaSans_400Regular',
                      color: line.pig ? COLORS.accentCoral : COLORS.keylinePurple,
                      lineHeight: 28,
                      marginTop: line.pig ? 6 : 0,
                      marginBottom: line.pig ? 6 : 0,
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
