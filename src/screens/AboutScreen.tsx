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
const PIG_ASPECT = 858 / 942;
const pigWidth = screenWidth * 0.6;
const pigHeight = pigWidth * PIG_ASPECT;

const STEPS = [
  { title: 'Create your profile', body: 'Tell people who you are' },
  { title: 'Share fun facts', body: 'This will help people start talking. Everybody has fun facts!' },
  { title: 'Go visible', body: "Signal you're open to meeting" },
  { title: "See who's nearby", body: 'Browse people actually around you' },
  { title: 'Get a starter & connect', body: 'We crack the ice, you take it from there. Bye.' },
];

export default function AboutScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [page, setPage] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const goToPage = (index: number) => {
    scrollRef.current?.scrollTo({ x: index * screenWidth, animated: true });
    setPage(index);
  };

  const handleMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setPage(Math.round(e.nativeEvent.contentOffset.x / screenWidth));
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.cream }}>
      {/* Progress — halves on the first page, full on the second */}
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 24, alignItems: 'center' }}>
        <View style={{ width: '55%', height: 3, backgroundColor: progressTrack, borderRadius: 2 }}>
          <View
            style={{
              width: page === 0 ? '50%' : '100%',
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

        {/* ── PAGE 1 — what it is ── */}
        <View style={{ width: screenWidth }}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16 }}
            showsVerticalScrollIndicator={false}>

            <Text style={{ fontSize: 44, fontFamily: 'Fredoka_700Bold', color: COLORS.keylinePurple, marginBottom: 8 }}>
              What's Truffle Hunter?
            </Text>
            <View style={{ height: 2, backgroundColor: COLORS.accentCoral, marginBottom: 24 }} />

            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 18, fontFamily: 'Fredoka_700Bold', color: COLORS.keylinePurple, marginBottom: 8 }}>
                A way to meet people
              </Text>
              <Text style={{ fontSize: 14, fontFamily: 'PlusJakartaSans_400Regular', color: '#666', lineHeight: 20 }}>
                Without the fear of rejection or awkward hello. No swiping, no algorithm, no matching. But hey, also no messaging and no feeds. Let go of that phone! When you're visible, everyone nearby knows you're game, so don't let anyone down.
              </Text>
            </View>

            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 18, fontFamily: 'Fredoka_700Bold', color: COLORS.keylinePurple, marginBottom: 8 }}>
                A helping hand with the hello
              </Text>
              <Text style={{ fontSize: 14, fontFamily: 'PlusJakartaSans_400Regular', color: '#666', lineHeight: 20 }}>
                We provide the conversation starter so you can focus on the real connection that follows.
              </Text>
            </View>

            <View style={{ flex: 1, alignItems: 'flex-start', justifyContent: 'center', minHeight: 220 }}>
              <Text style={{ fontSize: 18, fontFamily: 'Fredoka_700Bold', color: COLORS.keylinePurple, marginBottom: 8 }}>
                That's it! Get that oinc!
              </Text>
              <Image
                source={require('../assets/illustrations/About 1.png')}
                style={{ width: pigWidth, height: pigHeight }}
                resizeMode="contain"
              />
            </View>
          </ScrollView>
        </View>

        {/* ── PAGE 2 — how it works ── */}
        <View style={{ width: screenWidth }}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 24 }}
            showsVerticalScrollIndicator={false}>

            <Text
              style={{
                fontSize: 34, fontFamily: 'Fredoka_700Bold', color: COLORS.keylinePurple,
                textAlign: 'center', marginBottom: 24,
              }}>
              How it works
            </Text>

            {STEPS.map((step, i) => (
              <View key={i} style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 20, fontFamily: 'Fredoka_700Bold', color: COLORS.keylinePurple, marginBottom: 4 }}>
                  {step.title}
                </Text>
                <Text
                  style={{
                    fontSize: 16, fontFamily: 'PlusJakartaSans_400Regular',
                    color: COLORS.keylinePurple, lineHeight: 24,
                  }}>
                  {step.body}
                </Text>
              </View>
            ))}

            <View style={{ flex: 1 }} />
          </ScrollView>
        </View>
      </ScrollView>

      <View
        style={{
          paddingHorizontal: 24, paddingTop: 8,
          paddingBottom: insets.bottom + 8, backgroundColor: COLORS.cream,
        }}>
        <TouchableOpacity
          onPress={() => (page === 0 ? goToPage(1) : navigation.navigate('Registration1', { mode: 'register' }))}
          activeOpacity={0.85}
          style={{
            height: 56, borderRadius: 28, backgroundColor: COLORS.accentCoral,
            alignItems: 'center', justifyContent: 'center',
            boxShadow: '3px 3px 0px rgba(32,22,66,0.18)',
          } as any}>
          <Text style={{ color: '#FFFFFF', fontSize: 15, fontFamily: 'Fredoka_700Bold' }}>
            {page === 0 ? 'Next →' : 'Start →'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
