import { Stack } from 'expo-router';

/**
 * Layout for the /study/* route group.
 * Uses a slide-from-right stack with no native header
 * (each screen draws its own header for full control).
 */
export default function StudyLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[subject]" />
    </Stack>
  );
}
