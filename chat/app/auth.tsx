import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../src/lib/supabase';
import { Colors } from '../src/lib/colors';

const C = Colors.dark;

export default function AuthScreen() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [name, setName]         = useState('');
  const [mode, setMode]         = useState<'signin' | 'signup' | 'magic'>('signin');
  const [loading, setLoading]   = useState(false);
  const [sent, setSent]         = useState(false);

  async function handleMagicLink() {
    if (!email.trim()) { Alert.alert('Enter your email'); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true },
    });
    setLoading(false);
    if (error) Alert.alert('Error', error.message);
    else setSent(true);
  }

  async function handleEmailAuth() {
    if (!email.trim() || !password.trim()) { Alert.alert('Fill in all fields'); return; }
    setLoading(true);
    let error;
    if (mode === 'signup') {
      if (!name.trim()) { Alert.alert('Enter your name'); setLoading(false); return; }
      const res = await supabase.auth.signUp({ email: email.trim(), password });
      error = res.error;
      if (!error && res.data.user) {
        await supabase.from('profiles').upsert({
          id: res.data.user.id,
          display_name: name.trim(),
        });
      }
    } else {
      const res = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      error = res.error;
    }
    setLoading(false);
    if (error) Alert.alert('Error', error.message);
    else router.replace('/');
  }

  if (sent) {
    return (
      <View style={[s.root, { justifyContent: 'center', alignItems: 'center', gap: 18 }]}>
        <Text style={{ fontSize: 48 }}>✉️</Text>
        <Text style={s.title}>Check your inbox</Text>
        <Text style={s.sub}>Magic link sent to{'\n'}{email}</Text>
        <TouchableOpacity onPress={() => setSent(false)}>
          <Text style={[s.link, { marginTop: 8 }]}>Try a different email</Text>
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
          <Text style={s.logo}>✦</Text>
          <Text style={s.title}>Welcome to Dharya</Text>
          <Text style={s.sub}>Your private space</Text>

          {mode === 'signup' && (
            <TextInput
              style={s.input}
              placeholder="Your name"
              placeholderTextColor={C.textMuted}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          )}

          <TextInput
            style={s.input}
            placeholder="Email address"
            placeholderTextColor={C.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          {mode !== 'magic' && (
            <TextInput
              style={s.input}
              placeholder="Password"
              placeholderTextColor={C.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          )}

          <TouchableOpacity
            style={[s.btn, loading && { opacity: 0.7 }]}
            onPress={mode === 'magic' ? handleMagicLink : handleEmailAuth}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.btnTxt}>
                  {mode === 'magic' ? 'Send magic link' : mode === 'signup' ? 'Create account' : 'Sign in'}
                </Text>
            }
          </TouchableOpacity>

          <View style={s.row}>
            <TouchableOpacity onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>
              <Text style={s.link}>
                {mode === 'signin' ? 'No account? Sign up' : 'Have an account? Sign in'}
              </Text>
            </TouchableOpacity>
            <Text style={{ color: C.textMuted }}>  ·  </Text>
            <TouchableOpacity onPress={() => setMode(mode === 'magic' ? 'signin' : 'magic')}>
              <Text style={s.link}>{mode === 'magic' ? 'Use password' : 'Magic link'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: C.bg },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  card:   {
    backgroundColor: C.surface, borderRadius: 26, padding: 28, gap: 14,
    borderWidth: 1, borderColor: C.border,
    shadowColor: '#c026d3', shadowOpacity: 0.18, shadowRadius: 32, shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  logo:   { fontSize: 42, textAlign: 'center', color: C.accent },
  title:  { fontSize: 22, fontWeight: '800', color: C.text, textAlign: 'center', letterSpacing: 0.4 },
  sub:    { fontSize: 14, color: C.textSecondary, textAlign: 'center' },
  input:  {
    backgroundColor: C.inputBg, borderRadius: 13, padding: 14, fontSize: 15,
    color: C.text, borderWidth: 1, borderColor: C.border,
  },
  btn:    { backgroundColor: C.accent, borderRadius: 14, padding: 15, alignItems: 'center' },
  btnTxt: { color: '#fff', fontWeight: '700', fontSize: 15 },
  row:    { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' },
  link:   { color: C.accent, fontSize: 13 },
});
