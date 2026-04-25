import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS, FONTS } from '../utils/theme';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }: { navigation: any }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    const validUsernames = ['Dr.ahmed', 'Dr.sarah'];
    const validPassword = 'password';

    if (!email || !password) {
      alert('Please enter both username and password.');
      return;
    }

    if (validUsernames.includes(email) && password === validPassword) {
      navigation.replace('RoleSelector');
    } else {
      alert('Invalid username or password.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerDecoration} />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.innerContent}>
          <View style={styles.brandSection}>
            <View style={styles.logoCircle}>
              <Ionicons name="leaf" size={40} color={COLORS.white} />
            </View>
            <Text style={styles.appName}>Green Pharmacy</Text>
            <Text style={styles.appTagline}>Pharmacist Portal</Text>
          </View>

          <View style={[styles.loginCard, SHADOWS.lg]}>
            <Text style={styles.cardTitle}>Welcome Back</Text>
            <Text style={styles.cardSubtitle}>Login to manage your pharmacy</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Username</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color={COLORS.textLight} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Dr.ahmed"
                  placeholderTextColor={COLORS.textLight}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color={COLORS.textLight} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.textLight}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color={COLORS.textLight} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.loginBtn, SHADOWS.md]} onPress={handleLogin}>
              <Text style={styles.loginBtnText}>Login</Text>
              <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => Linking.openURL('mailto:admin@greenpharmacy.com?subject=Account%20Request')}>
              <Text style={styles.registerText}>Contact Admin</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primaryDark },
  headerDecoration: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: '45%',
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
  },
  scrollContent: { flexGrow: 1 },
  innerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  brandSection: { alignItems: 'center', marginBottom: 30 },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  appName: { fontSize: 32, fontWeight: '900', color: COLORS.white },
  appTagline: { fontSize: 16, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  loginCard: {
    backgroundColor: COLORS.white,
    borderRadius: 30,
    padding: 35,
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
  },
  cardTitle: { fontSize: 24, fontWeight: '800', color: COLORS.text },
  cardSubtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 5, marginBottom: 30 },
  inputGroup: { width: '100%', marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 12,
    fontSize: 15,
    color: COLORS.text,
  },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 25 },
  forgotText: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
  loginBtn: {
    backgroundColor: COLORS.primary,
    width: '100%',
    height: 55,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginBottom: 25,
  },
  loginBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '800' },
  footer: { flexDirection: 'row', marginTop: 30 },

  footerText: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
  registerText: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
});

export default LoginScreen;
