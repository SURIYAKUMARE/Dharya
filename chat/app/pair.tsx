import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, Share, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Copy, Share2, Sparkles, Heart, ArrowRight, LogOut, Check } from 'lucide-react-native';
import { supabase, signOut } from '../src/lib/supabase';
import { useAuthStore } from '../src/store/authStore';
import { Colors } from '../src/lib/colors';
import { useChatStore } from '../src/store/chatStore';

function makeCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function PairScreen() {
  const { user, profile, setChatId, setPartnerId } = useAuthStore();
  const { theme } = useChatStore();
  const C = Colors[theme];

  const [myCode, setMyCode] = useState('');
  const [theirCode, setTheirCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  async function generateCode() {
    if (!user) return;
    setGenerating(true);
    // Create new chat
    const { data: chat, error: chatErr } = await supabase.from('chats').insert({}).select().single();
    if (chatErr || !chat) {
      setGenerating(false);
      Alert.alert('Error', 'Could not create private chat.');
      return;
    }
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

    if (!invite) {
      setLoading(false);
      Alert.alert('Invalid code', 'Code was not found, has expired, or was already used.');
      return;
    }
    if (invite.owner_id === user.id) {
      setLoading(false);
      Alert.alert('Notice', "That's your own invite code!");
      return;
    }

    await supabase.from('invite_codes').update({ used_by: user.id }).eq('code', invite.code);
    await supabase.from('chat_members').insert({ chat_id: invite.chat_id, user_id: user.id });

    setChatId(invite.chat_id);
    setPartnerId(invite.owner_id);
    setLoading(false);
    router.replace('/chat');
  }

  async function shareCode() {
    try {
      await Share.share({ message: `Join my private space on Dharya! Code: ${myCode}` });
    } catch {}
  }

  async function handleSignOut() {
    await signOut();
    router.replace('/auth');
  }

  return (
    <SafeAreaView style={[s.root, { backgroundColor: C.bg }]} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={s.header}>
          <View style={[s.emblem, { backgroundColor: C.accent + '22', borderColor: C.accent + '44' }]}>
            <Heart size={22} color={C.accent} fill={C.accent} />
          </View>
          <Text style={[s.title, { color: C.text }]}>Pair with Your Partner</Text>
          <Text style={[s.sub, { color: C.textSecondary }]}>
            Dharya is a private space for two. Share your invite code with your partner, or enter the code they gave you.
          </Text>
        </View>

        {/* Generate Card */}
        <View style={[s.card, { backgroundColor: C.surface, borderColor: C.border }]}>
          <View style={s.cardHeader}>
            <Sparkles size={16} color={C.accent} />
            <Text style={[s.cardTitle, { color: C.textSecondary }]}>YOUR INVITE CODE</Text>
          </View>

          {myCode ? (
            <View style={s.codeBox}>
              <Text style={[s.code, { color: C.accent }]}>{myCode}</Text>
              <Text style={[s.hint, { color: C.textMuted }]}>
                Valid for 24 hours. Give this 6-letter code to your partner.
              </Text>

              <View style={s.btnRow}>
                <TouchableOpacity
                  style={[s.shareBtn, { backgroundColor: C.accent }]}
                  onPress={shareCode}
                >
                  <Share2 size={16} color="#ffffff" />
                  <Text style={s.shareBtnTxt}>Share Code</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={{ gap: 10 }}>
              <Text style={[s.desc, { color: C.textSecondary }]}>
                Tap below to generate a secure single-use pairing code to invite your partner.
              </Text>
              <TouchableOpacity
                style={[s.primaryBtn, { backgroundColor: C.accent }]}
                onPress={generateCode}
                disabled={generating}
              >
                {generating ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <Text style={s.primaryBtnTxt}>Generate Invite Code</Text>
                    <ArrowRight size={16} color="#ffffff" />
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Enter Code Card */}
        <View style={[s.card, { backgroundColor: C.surface, borderColor: C.border }]}>
          <View style={s.cardHeader}>
            <Heart size={16} color={C.accent} />
            <Text style={[s.cardTitle, { color: C.textSecondary }]}>ENTER PARTNER'S CODE</Text>
          </View>

          <Text style={[s.desc, { color: C.textSecondary }]}>
            If your partner already sent you an invite code, enter it below:
          </Text>

          <TextInput
            style={[
              s.input,
              {
                backgroundColor: C.inputBg,
                color: C.text,
                borderColor: theirCode.length === 6 ? C.accent : C.border,
              },
            ]}
            placeholder="AB12CD"
            placeholderTextColor={C.textMuted}
            value={theirCode}
            onChangeText={(t) => setTheirCode(t.toUpperCase())}
            autoCapitalize="characters"
            maxLength={6}
            autoCorrect={false}
          />

          <TouchableOpacity
            style={[
              s.primaryBtn,
              { backgroundColor: C.accent },
              (!theirCode.trim() || loading) && { opacity: 0.5 },
            ]}
            onPress={joinWithCode}
            disabled={loading || !theirCode.trim()}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Text style={s.primaryBtnTxt}>Connect & Open Chat</Text>
                <ArrowRight size={16} color="#ffffff" />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer info & sign out */}
        <View style={s.footer}>
          <Text style={[s.footerTxt, { color: C.textMuted }]}>
            Signed in as {profile?.display_name || user?.email}
          </Text>
          <TouchableOpacity onPress={handleSignOut} style={s.signOutBtn}>
            <LogOut size={14} color="#ff5a5a" />
            <Text style={s.signOutTxt}>Sign Out / Switch Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  content: {
    padding: 20,
    gap: 18,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    textAlign: 'center',
    marginVertical: 14,
    gap: 8,
  },
  emblem: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  sub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 10,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
    gap: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  desc: {
    fontSize: 13,
    lineHeight: 18,
  },
  codeBox: {
    alignItems: 'center',
    gap: 12,
  },
  code: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 8,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
    marginVertical: 6,
  },
  hint: {
    fontSize: 12,
    textAlign: 'center',
  },
  btnRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
  },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  shareBtnTxt: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  input: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 6,
    borderWidth: 1,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  primaryBtnTxt: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  footer: {
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  footerTxt: {
    fontSize: 12,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 6,
  },
  signOutTxt: {
    color: '#ff5a5a',
    fontSize: 12,
    fontWeight: '700',
  },
});
