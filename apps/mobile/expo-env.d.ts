/// <reference types="nativewind/types" />

// Augment PressableProps with nativewind className (nativewind v2 types.d.ts omits this)
declare module 'react-native' {
  interface PressableProps {
    className?: string;
    tw?: string;
  }
  interface ScrollViewProps {
    className?: string;
    tw?: string;
    contentContainerClassName?: string;
  }
  interface KeyboardAvoidingViewProps {
    className?: string;
    tw?: string;
  }
  interface SafeAreaViewProps {
    className?: string;
    tw?: string;
  }
}
