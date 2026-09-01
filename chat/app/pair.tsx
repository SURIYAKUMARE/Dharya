import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, Share, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../src/lib/supabase';
import { useAuthStore } from '../src/store/authStore';
import { Colors } from '../src/lib/colors';

const C = Colors.dark;

function makeCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function PairScreen() {
  const { user, setChatId, setPartnerId } = useAuthStore();
  const [myCode, setMyCode]     = useState('');
  const [theirCode, setTheirCode] = useState('');
  const [loading, setLoading]   = useState(false);
  const [generating, setGenerating] = useState(false);

  async function generateCode() {
    if (!user) return;
    setGenerating(true);
    // Create new chat
    const { data: chat, error: chatErr } = await supabase.from('chats').insert({}).select().single();
    if (chatErr || !chat) { setGenerating(false); Alert.alert('Error', 'Could not create chat'); return; }
    // Add self
    await supabase.from('chat_members').insert({ chat_id: chat.id, user_id: user.id });
    const code = makeCode();
    await supabase.from('invite_codes').insert({ code, owner_id: user.id, chat_id: chat.id });
    setMyCode(code);
    setGenerating(false);
  }

  async function joinWithCode() {
    if (!user || !theirCode.trim()) return;
    setLoading(true);
    const { data: invite } = await supabase
      .from('invite_codes')
      .select('*')
      .eq('code', theirCode.trim().toUpperCase())
      .is('used_by', null)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (!invite) { setLoading(false); Alert.alert('Invalid code', 'Code not found or expired.'); return; }
    if (invite.owner_id === user.id) { setLoading(false); Alert.alert('Oops', "That's your own code!"); return; }

    await supabase.from('invite_codes').update({ used_by: user.id }).eq('code', invite.code);
    await supabase.from('chat_members').insert({ chat_id: invite.chat_id, user_id: user.id });

    setChatId(invite.chat_id);
    setPartnerId(invite.owner_id);
    setLoading(false);
    router.replace('/chat');
  }

  async function shareCode() {
    await Share.share({ message: `Join my private chat on Dharya! Code: ${myCode}` });
  }

  return (
    <SafeAreaView style={s.root}>
      <ScrollView contentContainerStyle={s.content}>
        <Text style={s.title}>Connect with your person ✦</Text>
        <Text style={s.sub}>Generate a code and share it, or enter theirs.</Text>

        {/* Generate */}
        <View style={s.card}>
          <Text style={s.sectionTitle}>Your invite code</Text>
          {myCode ? (
            <>
              <Text style={s.code}>{myCode}</Text>
              <TouchableOpacity style={s.btn} onPress={shareCode}>
                <Text style={s.btnTxt}>Share code</Text>
              </TouchableOpacity>
              <Text style={s.hint}>Valid for 24 hours. Share with your partner.</Text>
            </>
          ) : (
            <TouchableOpacity style={s.btn} onPress={generateCode} disabled={generating}>
              {generating ? <ActivityIndicator color="#fff" /> : <Text style={s.btnTxt}>Generate code</Text>}
            </TouchableOpacity>
          )}
        </View>

        {/* Join */}
        <View style={s.card}>
          <Text style={s.sectionTitle}>Enter their code</Text>
          <TextInput
            style={s.input}
            placeholder="e.g. AB12CD"
            placeholderTextColor={C.textMuted}
            value={theirCode}
            onChangeText={(t) => setTheirCode(t.toUpperCase())}
            autoCapitalize="characters"
            maxLength={6}
            autoCorrect={false}
          />
          <TouchableOpacity
            style={[s.btn, (!theirCode.trim() || loading) && { opacity: 0.5 }]}
            onPress={joinWithCode}
            disabled={loading || !theirCode.trim()}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnTxt}>Join chat</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: C.bg },
  content:     { padding: 24, gap: 20 },
  title:       { fontSize: 22, fontWeight: '800', color: C.text, marginTop: 20, letterSpacing: 0.3 },
  sub:         { fontSize: 14, color: C.textSecondary, lineHeight: 20 },
  card:        { backgroundColor: C.surface, borderRadius: 20, padding: 22, gap: 14, borderWidth: 1, borderColor: C.border },
  sectionTitle:{ fontSize: 12, fontWeight: '700', color: C.textSecondary, textTransform: 'uppercase', letterSpacing: 1.2 },
  code:        { fontSize: 38, fontWeight: '900', color: C.accent, letterSpacing: 8, textAlign: 'center' },
  input:       {
    backgroundColor: C.inputBg, borderRadius: 13, padding: 14, fontSize: 26,
    fontWeight: '700', color: C.text, textAlign: 'center', borderWidth: 1,
    borderColor: C.border, letterSpacing: 6,
  },
  btn:         { backgroundColor: C.accent, borderRadius: 13, padding: 14, alignItems: 'center' },
  btnTxt:      { color: '#fff', fontWeight: '700', fontSize: 15 },
  hint:        { fontSize: 12, color: C.textMuted, textAlign: 'center' },
});
