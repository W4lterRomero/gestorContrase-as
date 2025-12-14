import 'react-native-get-random-values';
import { registerRootComponent } from 'expo';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { deriveKey, encrypt, decrypt, generateSalt } from '@password-manager/crypto';

// Types
interface VaultItem {
  id: string;
  title: string;
  username: string;
  password: string;
  notes?: string;
}

// NOTE: Update this with your machine's local IP for physical devices
const API_URL = 'http://172.26.27.230:3001';
// const API_URL = 'http://10.0.2.2:3001'; // Android Emulator fallback

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [masterKey, setMasterKey] = useState<Uint8Array | null>(null);

  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Vault State
  const [items, setItems] = useState<VaultItem[]>([]);
  const [syncing, setSyncing] = useState(false);

  // Buffer Helpers
  const toBase64 = (buf: Uint8Array) => {
    // Limited React Native support for btoa/atob or Buffer depending on env
    // We can use a simpler approach or a library if needed.
    // For now assuming hermes/jsc has basic support? No, RN needs a polyfill or custom impl for Base64 usually.
    // We will use a simple implementation for now to avoid extra deps if possible, 
    // or just assume standard `global.btoa` if available (Debug mode vs Release).
    // Actually, let's use a quick helper.
    let binary = '';
    const len = buf.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(buf[i]);
    }
    return btoa(binary); // RN 0.60+ has btoa/atob in JS engine usually
  };

  const fromBase64 = (str: string) => {
    return Uint8Array.from(atob(str), c => c.charCodeAt(0));
  };

  const login = async () => {
    setLoading(true);
    try {
      // 1. Get Salt
      const saltRes = await fetch(`${API_URL}/auth/get-salt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!saltRes.ok) throw new Error('User not found');
      const { saltAuth: saltAuthBase64 } = await saltRes.json();
      const saltAuth = fromBase64(saltAuthBase64);

      // 2. Derive Keys
      const authKey = await deriveKey(password, saltAuth);

      // 3. Login
      const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          authKeyHash: toBase64(authKey)
        })
      });

      const loginData = await loginRes.json();
      if (!loginRes.ok) throw new Error(loginData.error || 'Login failed');

      // 4. Derive Master Key
      const saltEnc = fromBase64(loginData.saltEnc);
      const mk = await deriveKey(password, saltEnc);
      setMasterKey(mk);
      setToken(loginData.token);

      // Load Vault
      loadVault(loginData.token, mk);

    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadVault = async (authToken: string, mk: Uint8Array) => {
    setSyncing(true);
    try {
      const res = await fetch(`${API_URL}/vault`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!res.ok) {
        setItems([]); // Empty vault or error
        return;
      }

      const vaultData = await res.json();
      if (vaultData.encryptedData && vaultData.iv) {
        const decryptedJson = await decrypt(vaultData.encryptedData, vaultData.iv, mk);
        const data = JSON.parse(decryptedJson);
        setItems(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSyncing(false);
    }
  };

  if (!token) {
    return (
      <View style={styles.container}>
        <StatusBar style="auto" />
        <Text style={styles.title}>SecurePass Mobile</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Master Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.button} onPress={login} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Unlock Vault</Text>}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Vault</Text>
        <TouchableOpacity onPress={() => setToken(null)}>
          <Text style={styles.logoutText}>Lock</Text>
        </TouchableOpacity>
      </View>

      {syncing ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.item} onPress={() => Alert.alert("Password", item.password)}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemSub}>{item.username}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>Vault is empty</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ... styles content ...
});

// Removed registerRootComponent(App); as it is handled in index.ts
