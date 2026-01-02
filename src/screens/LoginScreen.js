import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  Animated,
  Dimensions,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  // Animasi Slide Up untuk kartu
  const cardAnim = useRef(new Animated.Value(50)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) return alert("Mohon isi email dan password");
    setLoading(true);
    try {
      await login(email, password);
    } catch (error) {
      alert("Login Gagal: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* HEADER: Area Ungu Atas */}
      <LinearGradient
        colors={['#4F46E5', '#818CF8']} // Gradient Ungu
        style={styles.headerBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Dekorasi Lingkaran Samar */}
        <View style={styles.circleDecoration} />
        
        <View style={styles.headerContent}>
          {/* Logo Box */}
          <View style={styles.logoContainer}>
            <Ionicons name="layers" size={36} color="#4F46E5" />
          </View>
          
          {/* Teks Judul */}
          <Text style={styles.appTitle}>InventoryApp</Text>
          <Text style={styles.appSubtitle}>Kelola stok gudang dengan mudah</Text>
        </View>
      </LinearGradient>

      {/* CARD: Area Form Putih */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Animated.View style={[
            styles.loginCard, 
            { transform: [{ translateY: cardAnim }], opacity: opacityAnim }
          ]}>
            
            <Text style={styles.cardHeaderTitle}>Silakan masuk ke akun Anda</Text>

            {/* Input Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="nama@email.com"
                  placeholderTextColor="#CBD5E1"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            {/* Input Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>PASSWORD</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#CBD5E1"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#94A3B8" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Lupa Password?</Text>
            </TouchableOpacity>

            {/* Tombol Masuk */}
            <TouchableOpacity 
              activeOpacity={0.8} 
              onPress={handleLogin} 
              disabled={loading}
              style={styles.btnShadow}
            >
              <LinearGradient
                colors={['#4F46E5', '#4338CA']}
                style={styles.loginBtn}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.loginText}>MASUK</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

          </Animated.View>
          
          <Text style={styles.versionText}>Versi Aplikasi 1.0.2</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9', // Background abu-abu sangat muda agar kartu putih terlihat pop
  },
  // --- HEADER STYLE ---
  headerBackground: {
    height: height * 0.45, // Mengambil 45% tinggi layar (Cukup tinggi agar tidak ketutup)
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingTop: 60, // Jarak dari status bar
    alignItems: 'center',
    justifyContent: 'flex-start', // Mulai isi dari atas
    position: 'relative',
    overflow: 'hidden',
  },
  circleDecoration: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  logoContainer: {
    width: 70,
    height: 70,
    backgroundColor: 'white',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    marginBottom: 5,
    letterSpacing: 0.5,
  },
  appSubtitle: {
    fontSize: 14,
    color: '#E0E7FF', // Putih agak biru (agar kontras lembut)
    fontWeight: '500',
  },

  // --- CARD & FORM STYLE ---
  keyboardView: {
    flex: 1,
    marginTop: -70, // Overlap negatif: Kartu naik ke area Header sedikit
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  loginCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 25,
    paddingTop: 30,
    // Shadow agar kartu terlihat mengambang
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  cardHeaderTitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 25,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 15,
    height: 55,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    height: '100%',
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 30,
  },
  forgotText: {
    color: '#4F46E5',
    fontWeight: '600',
    fontSize: 13,
  },
  btnShadow: {
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  loginBtn: {
    height: 55,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  versionText: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 30,
  }
});