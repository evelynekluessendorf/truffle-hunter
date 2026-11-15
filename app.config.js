module.exports = {
  expo: {
    name: "Meex",
    slug: "meex",
    version: "1.0.0",
    orientation: "portrait",
    // Derived from src/assets/launcher-icon-bold/launcher-icon-bold.png:
    // 1024×1024 and flattened onto cream, because iOS app icons may not carry
    // an alpha channel — transparent corners render black on device.
    icon: "./assets/launcher-icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#FEF0E8"
    },
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        // Same mark, kept transparent and inset to the 66% safe zone so the
        // launcher's mask (circle / squircle / rounded square) can't clip the
        // keyline ring. The cream field comes from backgroundColor.
        foregroundImage: "./assets/launcher-adaptive-foreground.png",
        backgroundColor: "#FAF9F6"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: "com.evekluessendorf.meex",
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
        }
      }
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      eas: {
        projectId: "553d9283-78fd-4e15-88d1-aa7d46848c26"
      }
    },
    runtimeVersion: {
      policy: "appVersion"
    },
    // updates: {
    //   url: "https://u.expo.dev/553d9283-78fd-4e15-88d1-aa7d46848c26"
    // },
    plugins: [
      "expo-font",
      [
        "expo-image-picker",
        {
          photosPermission: "Allow Meex to access your photos so you can set a profile picture."
        }
      ]
    ]
  }
};
