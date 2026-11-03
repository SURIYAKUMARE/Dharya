import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ActivityIndicator, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Eye, EyeOff, ShieldCheck, Heart } from 'lucide-react-native';
import { supabase } from '../src/lib/supabase';
import { Colors } from '../src/lib/colors';

const C = Colors.dark;

export default function AuthScreen() {
  const [selectedPersona, setSelectedPersona] = useState<'surya' | 'sadhana'>('surya');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<'signin' | 'signup' | 'magic'>('signin');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSelectPersona = (persona: 'surya' | 'sadhana') => {
    setSelectedPersona(persona);
    setErrorMessage(null);
    if (!email) {
      setEmail(persona === 'surya' ? 'surya@dharya.app' : 'sadhana@dharya.app');
    }
  };

  async function handleMagicLink() {
    setErrorMessage(null);
    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true },
    });
    setLoading(false);
    if (error) {
      setErrorMessage(error.message);
    } else {
      setSent(true);
    }
  }

  async function handleEmailAuth() {
    setErrorMessage(null);
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both email and password.');
      return;
    }
    setLoading(true);
    let error;
    if (mode === 'signup') {
      const displayName = name.trim() || (selectedPersona === 'sadhana' ? 'Sadhana' : 'Surya');
      const res = await supabase.auth.signUp({ email: email.trim(), password });
      error = res.error;
      if (!error && res.data.user) {
        await supabase.from('profiles').upsert({
          id: res.data.user.id,
          display_name: displayName,
        });
      }
    } else {
      const res = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      error = res.error;
    }
    setLoading(false);
    if (error) {
      setErrorMessage(error.message);
    } else {
      router.replace('/');
    }
  }

  if (sent) {
    return (
      <View style={[s.root, { justifyContent: 'center', alignItems: 'center', padding: 24, gap: 16 }]}>
        <View style={s.iconBadge}>
          <ShieldCheck size={36} color={C.accent} />
        </View>
        <Text style={s.title}>Check your inbox</Text>
        <Text style={s.sub}>
          A secure sign-in link was sent to{'\n'}
          <Text style={{ color: C.text, fontWeight: '600' }}>{email}</Text>
        </Text>
        <TouchableOpacity style={[s.btn, { width: '100%', marginTop: 8 }]} onPress={() => setSent(false)}>
          <Text style={s.btnTxt}>Try a different email</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <View style={s.card}>
          {/* Header */}
          <View style={s.headerBox}>
            <View style={s.brandRow}>
              <Heart size={18} color={selectedPersona === 'sadhana' ? C.accentRose : C.accent} fill={selectedPersona === 'sadhana' ? C.accentRose : C.accent} />
              <Text style={s.brandLabel}>Dharya</Text>
            </View>
            <Text style={s.title}>Private Space</Text>
            <Text style={s.sub}>A quiet personal connection for two</Text>
          </View>

          {/* Persona Selection Cards */}
          <Text style={s.label}>Select your profile</Text>
          <View style={s.personaGrid}>
            <TouchableOpacity
              style={[
                s.personaCard,
                selectedPersona === 'surya' && { borderColor: C.accent, backgroundColor: C.bubbleSent },
              ]}
              onPress={() => handleSelectPersona('surya')}
              activeOpacity={0.8}
            >
              <View style={[s.avatarCircle, { backgroundColor: C.accent }]}>
                <Text style={s.avatarText}>S</Text>
              </View>
              <View>
                <Text style={[s.personaName, selectedPersona === 'surya' && { color: C.accent }]}>
                  Surya
                </Text>
                <Text style={s.personaRole}>Partner</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                s.personaCard,
                selectedPersona === 'sadhana' && { borderColor: C.accentRose, backgroundColor: '#281E21' },
              ]}
              onPress={() => handleSelectPersona('sadhana')}
              activeOpacity={0.8}
            >
              <View style={[s.avatarCircle, { backgroundColor: C.accentRose }]}>
                <Text style={s.avatarText}>S</Text>
              </View>
              <View>
                <Text style={[s.personaName, selectedPersona === 'sadhana' && { color: C.accentRose }]}>
                  Sadhana
                </Text>
                <Text style={s.personaRole}>Partner</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Inline Error Message */}
          {errorMessage && (
            <View style={s.errorBox}>
              <Text style={s.errorText}>{errorMessage}</Text>
            </View>
          )}

          {/* Form Fields */}
          {mode === 'signup' && (
            <View style={s.inputWrap}>
              <Text style={s.label}>Your Name</Text>
              <TextInput
                style={s.input}
                placeholder="Your display name"
                placeholderTextColor={C.textMuted}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoComplete="name"
              />
            </View>
          )}

          <View style={s.inputWrap}>
            <Text style={s.label}>Email Address</Text>
            <TextInput
              style={s.input}
              placeholder="e.g. surya@dharya.app"
              placeholderTextColor={C.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
            />
          </View>

          {mode !== 'magic' && (
            <View style={s.inputWrap}>
              <Text style={s.label}>Password</Text>
              <View style={s.passwordRow}>
                <TextInput
                  style={[s.input, { flex: 1, paddingRight: 44 }]}
                  placeholder="Enter password"
                  placeholderTextColor={C.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete="current-password"
                  textContentType="password"
                />
                <TouchableOpacity
                  style={s.eyeBtn}
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  {showPassword ? (
                    <EyeOff size={18} color={C.iconDefault} />
                  ) : (
                    <Eye size={18} color={C.iconDefault} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Submit CTA */}
          <TouchableOpacity
            style={[
              s.btn,
              selectedPersona === 'sadhana' && { backgroundColor: C.accentRose },
              loading && { opacity: 0.7 },
            ]}
            onPress={mode === 'magic' ? handleMagicLink : handleEmailAuth}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={s.btnTxt}>
                {mode === 'magic'
                  ? 'Send sign-in link'
                  : mode === 'signup'
                  ? 'Create account'
                  : `Sign in as ${selectedPersona === 'sadhana' ? 'Sadhana' : 'Surya'}`}
              </Text>
            )}
          </TouchableOpacity>

          {/* Navigation Links */}
          <View style={s.row}>
            <TouchableOpacity onPress={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setErrorMessage(null); }}>
              <Text style={s.link}>
                {mode === 'signin' ? 'New here? Create account' : 'Have an account? Sign in'}
              </Text>
            </TouchableOpacity>
            <Text style={{ color: C.textMuted }}> · </Text>
            <TouchableOpacity onPress={() => { setMode(mode === 'magic' ? 'signin' : 'magic'); setErrorMessage(null); }}>
              <Text style={s.link}>{mode === 'magic' ? 'Use password' : 'Magic link'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  card: {
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 24,
    gap: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  headerBox: { alignItems: 'center', gap: 4, marginBottom: 8 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  brandLabel: { fontSize: 13, fontWeight: '700', color: C.textSecondary, letterSpacing: 1.5, textTransform: 'uppercase' },
  title: { fontSize: 24, fontWeight: '700', color: C.text, letterSpacing: -0.3 },
  sub: { fontSize: 13, color: C.textSecondary, textAlign: 'center' },
  label: { fontSize: 12, fontWeight: '600', color: C.textSecondary, letterSpacing: 0.3 },
  personaGrid: { flexDirection: 'row', gap: 10 },
  personaCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.card,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  personaName: { fontSize: 14, fontWeight: '700', color: C.text },
  personaRole: { fontSize: 11, color: C.textMuted },
  inputWrap: { gap: 6 },
  input: {
    backgroundColor: C.inputBg,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: C.text,
    borderWidth: 1,
    borderColor: C.border,
    minHeight: 48,
  },
  passwordRow: { position: 'relative', justifyContent: 'center' },
  eyeBtn: { position: 'absolute', right: 12, top: 14, padding: 2 },
  errorBox: {
    backgroundColor: 'rgba(224, 109, 109, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(224, 109, 109, 0.3)',
    borderRadius: 10,
    padding: 10,
  },
  errorText: { color: C.errorText, fontSize: 12, textAlign: 'center' },
  btn: {
    backgroundColor: C.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    marginTop: 4,
  },
  btnTxt: { color: '#fff', fontWeight: '700', fontSize: 15 },
  row: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 4 },
  link: { color: C.accent, fontSize: 13, fontWeight: '500' },
  iconBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
});
