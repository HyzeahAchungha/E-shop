import { isLoaded } from 'expo-font';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, typography } from '@/theme';

// Reserved destination. The signup form will follow the user's next reference.
export default function SignupRoute() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <Text accessibilityRole="header" style={[
          styles.heading, { fontFamily: isLoaded(typography.brand) ? typography.brand : undefined },
        ]}>Sign up</Text>
        <Text style={[
          styles.description, { fontFamily: isLoaded(typography.body) ? typography.body : undefined },
        ]}>Sign up will be available soon.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, justifyContent: 'center' },
  content: { padding: 24, alignItems: 'center' },
  heading: { fontSize: 28, fontWeight: '600', color: colors.primary, textAlign: 'center' },
  description: { marginTop: 16, fontSize: 16, lineHeight: 24, color: colors.textMuted, textAlign: 'center' },
});
