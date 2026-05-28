import { DriverIcon, EyeIcon, StudentIcon } from '@/components/icons';
import { ThemedText } from '@/components/themed-text';
import { Toast } from '@/components/toast';
import { useAuth, UserRole } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function AuthScreen() {
  const { user, signUpWithEmail, signInWithEmail, signInAnonymous, signInWithGoogle, resendEmailVerification, forgotPassword, checkEmailVerification } = useAuth();
  const [showEmailVerificationPrompt, setShowEmailVerificationPrompt] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const router = useRouter();
  
  const [isLogin, setIsLogin] = useState(true);
  const [hasAgreed, setHasAgreed] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [pendingAuth, setPendingAuth] = useState<'anonymous' | 'google' | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0); // Cooldown for resend email verification

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'error' | 'success' | 'info'>('error');
  
  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Hidden admin mode state
  const [adminModeEnabled, setAdminModeEnabled] = useState(false);
  const [tapCount, setTapCount] = useState(0);

  // Clear fields when switching between login and signup
  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    setEmail('');
    setPassword('');
    setName('');
    setConfirmPassword('');
    setHasAgreed(false);
    setShowEmailVerificationPrompt(false);
  };

  // Poll for email verification every 5 seconds when prompt is showing
  useEffect(() => {
    if (!showEmailVerificationPrompt) return;
    const interval = setInterval(async () => {
      const { verified } = await checkEmailVerification();
      if (verified) {
        clearInterval(interval);
        showToast("Email verified! Redirecting...", 'success');
        setTimeout(() => router.replace('/(tabs)/explore'), 1000);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [showEmailVerificationPrompt]);

  const showToast = (message: string, type: 'error' | 'success' | 'info' = 'error') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

<<<<<<< HEAD
  // Check for secret admin credentials
  const checkAdminAccess = () => {
    if (email.toLowerCase() === 'burgers' && password.toLowerCase() === 'cookies') {
      setAdminModeEnabled(true);
      setEmail('');
      setPassword('');
      showToast('Admin mode activated! You can now create admin accounts.', 'success');
      setIsLogin(false); // Switch to signup mode
      return true;
    }
    return false;
  };
=======
  const passwordCriteria = {
    minLength: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
  const isPasswordStrong = Object.values(passwordCriteria).every(Boolean);
>>>>>>> f436dee2145d0f9cf43231c3354d45f581522a8e

  const handleAuth = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedEmail || !password) {
      showToast("Please fill in all fields");
      return;
    }

<<<<<<< HEAD
    // Check for admin access secret code (only in login mode)
    if (isLogin && checkAdminAccess()) {
      return; // Admin mode activated, don't proceed with login
    }

    // Only check agreement during sign-up
    if (!isLogin && !hasAgreed && !adminModeEnabled) {
=======
    if (!emailRegex.test(trimmedEmail)) {
      showToast("Please enter a valid email address");
      return;
    }

    if (!isLogin && !trimmedName) {
      showToast("Please enter your name");
      return;
    }

    if (!isLogin && !isPasswordStrong) {
      showToast("Password must include uppercase, lowercase, number, and special character");
      return;
    }

    if (!isLogin && !hasAgreed) {
>>>>>>> f436dee2145d0f9cf43231c3354d45f581522a8e
      showToast("Please accept the Terms & Privacy Policy");
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      showToast("Passwords do not match!");
      return;
    }

    setLoading(true);

    if (isLogin) {
      // Sign in with email — use fresh emailVerified from the credential
      const result = await signInWithEmail(trimmedEmail, password);
      if (result.success) {
        if (!result.emailVerified) {
          showToast("Please verify your email address to continue.", 'info');
          setShowEmailVerificationPrompt(true);
        } else {
          showToast("Login successful!", 'success');
          setTimeout(() => router.replace('/(tabs)/explore'), 500);
        }
      } else {
        let errorMessage = "Invalid email or password";
        if (result.error?.includes('user-not-found')) {
          errorMessage = "No account found with this email";
        } else if (result.error?.includes('wrong-password')) {
          errorMessage = "Incorrect password";
        } else if (result.error?.includes('invalid-credential')) {
          errorMessage = "Invalid email or password";
        } else if (result.error?.includes('too-many-requests')) {
          errorMessage = "Too many failed attempts. Please try again later.";
        }
        showToast(errorMessage);
      }
    } else {
      // Determine role: admin if admin mode is enabled, otherwise selected role
      const roleToUse: UserRole = adminModeEnabled ? 'admin' : selectedRole;
      
      // Sign up with email
<<<<<<< HEAD
      const result = await signUpWithEmail(email, password, roleToUse, name);
      if (result.success) {
        if (adminModeEnabled) {
          showToast("Admin account created successfully!", 'success');
          setAdminModeEnabled(false); // Reset admin mode
        } else {
          showToast("Account created successfully!", 'success');
        }
        setTimeout(() => router.replace('/(tabs)/explore'), 500);
=======
      const result = await signUpWithEmail(trimmedEmail, password, selectedRole, trimmedName);
      if (result.success) {
        showToast("Account created successfully! Please verify your email.", 'success');
        setIsLogin(true); // Switch to login view after signup
>>>>>>> f436dee2145d0f9cf43231c3354d45f581522a8e
      } else {
        let errorMessage = "Sign up failed";
        if (result.error?.includes('email-already-in-use')) {
          errorMessage = "This email is already registered";
        } else if (result.error?.includes('weak-password')) {
          errorMessage = "Password is too weak";
        }
        showToast(errorMessage);
      }
    }

    setLoading(false);
  };

  const handleAnonymousLogin = async () => {
    // Immediate anonymous sign-in (no Terms check) — restored original behavior
    setLoading(true);
    const result = await signInAnonymous(selectedRole);

    if (result.success) {
      showToast("Signed in as guest", 'success');
      setTimeout(() => router.replace('/(tabs)/explore'), 500);
    } else {
      showToast(result.error || "Anonymous sign-in failed");
    }

    setLoading(false);
  };

  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setTimeout(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
    } 
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleResendVerification = async () => {
    if (resendCooldown > 0) {
      showToast(`Please wait ${resendCooldown} seconds before resending.`, 'info');
      return;
    }
    setLoading(true);
    const result = await resendEmailVerification();
    if (result.success) {
      showToast("Verification email sent! Please check your inbox.", "success");
      setResendCooldown(60); // Start 60-second cooldown
    } else {
      showToast(result.error || "Failed to send verification email.");
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    const trimmed = forgotEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmed) {
      showToast("Please enter your email address");
      return;
    }
    if (!emailRegex.test(trimmed)) {
      showToast("Please enter a valid email address");
      return;
    }
    setForgotLoading(true);
    const result = await forgotPassword(trimmed);
    if (result.success) {
      showToast("Password reset email sent! Check your inbox.", 'success');
      setShowForgotPassword(false);
      setForgotEmail('');
    } else {
      let msg = "Failed to send reset email";
      if (result.error?.includes('user-not-found')) msg = "No account found with this email";
      else if (result.error?.includes('too-many-requests')) msg = "Too many attempts. Try again later.";
      else if (result.error) msg = result.error;
      showToast(msg);
    }
    setForgotLoading(false);
  };

  const handleGoogleLogin = async () => {
    if (!hasAgreed) {
      setPendingAuth('google');
      setShowTerms(true);
      return;
    }

    setLoading(true);
    const result = await signInWithGoogle(selectedRole);
    
    if (result.success) {
      showToast("Google sign-in successful!", 'success');
      setTimeout(() => router.replace('/(tabs)/explore'), 500);
    } else {
      showToast(result.error || "Google sign-in failed");
    }
    
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Toast 
        message={toastMessage}
        type={toastType}
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />
      
      <Image 
        source={require('@/assets/images/fordagoo.png')} 
        style={styles.logo}
        resizeMode="contain"
      />
      <ThemedText type="title" style={styles.headerText}>ForDaGoo</ThemedText>
      <ThemedText style={styles.subtitle}>
        {isLogin ? 'Welcome back!' : 'Join the Daanbantayan Community'}
      </ThemedText>
      
      <View style={styles.form}>
        {/* Admin Mode Indicator */}
        {adminModeEnabled && (
          <View style={styles.adminModeIndicator}>
            <ThemedText style={styles.adminModeText}>
              🔐 Admin Mode Active - Creating Admin Account
            </ThemedText>
          </View>
        )}

        {/* Role Selection - Hidden when admin mode is active */}
        {!adminModeEnabled && (
          <View style={styles.roleContainer}>
            <ThemedText style={styles.roleLabel}>I am a:</ThemedText>
            <View style={styles.roleButtons}>
              <TouchableOpacity 
                style={[styles.roleButton, selectedRole === 'student' && styles.roleButtonActive]}
                onPress={() => setSelectedRole('student')}
              >
                <StudentIcon size={20} color={selectedRole === 'student' ? '#F56476' : '#5E4352'} />
                <ThemedText style={[styles.roleButtonText, selectedRole === 'student' && styles.roleButtonTextActive]}>
                  Student
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.roleButton, selectedRole === 'driver' && styles.roleButtonActive]}
                onPress={() => setSelectedRole('driver')}
              >
                <DriverIcon size={20} color={selectedRole === 'driver' ? '#F56476' : '#5E4352'} />
                <ThemedText style={[styles.roleButtonText, selectedRole === 'driver' && styles.roleButtonTextActive]}>
                  Driver
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {!isLogin && (
          <TextInput 
            style={styles.input} 
            placeholder="Full Name" 
            value={name}
            onChangeText={setName}
            placeholderTextColor="#5E435280" 
          />
        )}

        <TextInput 
          style={styles.input} 
          placeholder="Email Address" 
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#5E435280" 
        />
        
        {/* Password Input with Toggle */}
        <View style={styles.passwordContainer}>
          <TextInput 
            style={styles.passwordInput} 
            placeholder="Password" 
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="#5E435280" 
          />
          <TouchableOpacity 
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            <EyeIcon size={20} color="#8E8E93" closed={!showPassword} />
          </TouchableOpacity>
        </View>

        {!isLogin && (
          <View style={styles.passwordHintContainer}>
            <ThemedText style={[styles.passwordHint, passwordCriteria.minLength ? styles.passwordHintValid : styles.passwordHintInvalid]}>
              • At least 8 characters
            </ThemedText>
            <ThemedText style={[styles.passwordHint, passwordCriteria.uppercase ? styles.passwordHintValid : styles.passwordHintInvalid]}>
              • One uppercase letter
            </ThemedText>
            <ThemedText style={[styles.passwordHint, passwordCriteria.lowercase ? styles.passwordHintValid : styles.passwordHintInvalid]}>
              • One lowercase letter
            </ThemedText>
            <ThemedText style={[styles.passwordHint, passwordCriteria.number ? styles.passwordHintValid : styles.passwordHintInvalid]}>
              • One number
            </ThemedText>
            <ThemedText style={[styles.passwordHint, passwordCriteria.special ? styles.passwordHintValid : styles.passwordHintInvalid]}>
              • One special character
            </ThemedText>
          </View>
        )}

        {!isLogin && (
          <View style={styles.passwordContainer}>
            <TextInput 
              style={styles.passwordInput} 
              placeholder="Confirm Password" 
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholderTextColor="#5E435280" 
            />
            <TouchableOpacity 
              style={styles.eyeButton}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <EyeIcon size={20} color="#8E8E93" closed={!showConfirmPassword} />
            </TouchableOpacity>
          </View>
        )}

<<<<<<< HEAD
        {/* Only show Terms checkbox during Sign Up (not in admin mode) */}
        {!isLogin && !adminModeEnabled && (
=======
        {/* Forgot Password - only on login */}
        {isLogin && (
          <TouchableOpacity onPress={() => setShowForgotPassword(true)} style={{ alignSelf: 'flex-end' }}>
            <ThemedText style={styles.forgotText}>Forgot Password?</ThemedText>
          </TouchableOpacity>
        )}

        {/* Only show Terms checkbox during Sign Up */}
        {!isLogin && (
>>>>>>> f436dee2145d0f9cf43231c3354d45f581522a8e
          <View style={styles.row}>
            <TouchableOpacity 
              style={[styles.checkbox, hasAgreed && {backgroundColor: '#F56476'}]} 
              onPress={() => setHasAgreed(!hasAgreed)} 
            />
            <ThemedText style={{fontSize: 12, color: '#5E4352'}}>
              I accept the <ThemedText style={styles.link} onPress={() => setShowTerms(true)}>Terms & Privacy Policy</ThemedText>
            </ThemedText>
          </View>
        )}

        <TouchableOpacity style={styles.btn} onPress={handleAuth} disabled={loading}>
          <ThemedText style={styles.btnText}>
            {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Sign Up')}
          </ThemedText>
        </TouchableOpacity>

        {showEmailVerificationPrompt && (
          <View style={styles.emailVerificationPrompt}>
            <ThemedText style={styles.emailVerificationText}>
              Your email is not verified. Please check your inbox for a verification link.
            </ThemedText>
            <TouchableOpacity 
              style={[styles.resendBtn, (loading || resendCooldown > 0) && styles.resendBtnDisabled]}
              onPress={handleResendVerification} 
              disabled={loading || resendCooldown > 0}
            >
              <ThemedText style={styles.resendBtnText}>
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Verification Email"}
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {/* Alternative Login Methods - Row Layout */}
        <View style={styles.alternativeAuthRow}>
            {/* Anonymous Login Button */}
            <TouchableOpacity 
              style={[styles.btnAlt, styles.btnSecondary]} 
              onPress={handleAnonymousLogin}
              disabled={loading}
            >
              <ThemedText style={styles.btnSecondaryText}>Guest</ThemedText>
            </TouchableOpacity>

            {/* Google Login Button */}
            <TouchableOpacity 
              style={[styles.btnAlt, styles.btnGoogle]} 
              onPress={handleGoogleLogin}
              disabled={loading}
            >
              <ThemedText style={styles.btnText}>Google</ThemedText>
            </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleToggleMode} style={{marginTop: 15}}>
          <ThemedText style={styles.toggleText}>
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
          </ThemedText>
        </TouchableOpacity>
      </View>

      <Modal visible={showForgotPassword} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modal}>
            <ThemedText type="subtitle">Reset Password</ThemedText>
            <ThemedText style={{ color: '#5E4352', fontSize: 13 }}>
              Enter your email and we'll send you a reset link.
            </ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              value={forgotEmail}
              onChangeText={setForgotEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#5E435280"
            />
            <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'flex-end' }}>
              <TouchableOpacity style={styles.closeBtn} onPress={() => { setShowForgotPassword(false); setForgotEmail(''); }}>
                <ThemedText style={{ color: '#fff' }}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.acceptBtn} onPress={handleForgotPassword} disabled={forgotLoading}>
                <ThemedText style={{ color: '#fff' }}>{forgotLoading ? 'Sending...' : 'Send Reset Email'}</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showTerms} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modal}>
            <ThemedText type="subtitle">Terms of Use</ThemedText>
            <ThemedText style={styles.termsBody}>
              By using ForDaGoo, you agree to share your location for commuter tracking at CTU-Daanbantayan. 
              Data is handled per the PH Data Privacy Act.
              {'\n\n'}
              <ThemedText style={{fontWeight: 'bold'}}>For Students:</ThemedText> You can view real-time bus locations and track routes.
              {'\n\n'}
              <ThemedText style={{fontWeight: 'bold'}}>For Drivers:</ThemedText> You agree to share your location while driving to help students track buses.
            </ThemedText>
            <View style={{flexDirection: 'row', gap: 10, justifyContent: 'flex-end'}}>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setShowTerms(false)}>
                <ThemedText style={{color: '#fff'}}>Close</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.acceptBtn}
                onPress={async () => {
                  setHasAgreed(true);
                  setShowTerms(false);
                  const action = pendingAuth;
                  setPendingAuth(null);
                  if (action === 'anonymous') {
                    setTimeout(() => handleAnonymousLogin(), 200);
                  } else if (action === 'google') {
                    // Call signInWithGoogle directly — avoids hasAgreed stale state issue
                    setLoading(true);
                    const result = await signInWithGoogle(selectedRole);
                    if (result.success) {
                      showToast("Google sign-in successful!", 'success');
                      setTimeout(() => router.replace('/(tabs)/explore'), 500);
                    } else {
                      showToast(result.error || "Google sign-in failed");
                    }
                    setLoading(false);
                  }
                }}
              >
                <ThemedText style={{color: '#fff'}}>Accept</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    padding: 40, 
    justifyContent: 'center', 
    backgroundColor: '#fff',
    alignItems: 'center', // Center content horizontally
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  headerText: { 
    color: '#5E4352', 
    textAlign: 'center', 
    fontSize: 36, 
    marginBottom: 10 
  },
  subtitle: { 
    textAlign: 'center', 
    color: '#5E4352', 
    opacity: 0.6, 
    marginBottom: 30 
  },
  form: { 
    gap: 12,
    width: '100%',
    maxWidth: 500, // Limit width on web
  },
  adminModeIndicator: {
    backgroundColor: '#F5647620',
    borderWidth: 2,
    borderColor: '#F56476',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  adminModeText: {
    color: '#F56476',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 14,
  },
  roleContainer: { marginBottom: 10 },
  roleLabel: { fontSize: 14, color: '#5E4352', fontWeight: '600', marginBottom: 10 },
  roleButtons: { flexDirection: 'row', gap: 10 },
  roleButton: { 
    flex: 1, 
    padding: 15, 
    borderRadius: 12, 
    borderWidth: 2, 
    borderColor: '#DFBBB1',
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  roleButtonActive: { 
    borderColor: '#F56476', 
    backgroundColor: '#F5647610' 
  },
  roleButtonText: { 
    fontSize: 14, 
    color: '#5E4352',
    fontWeight: '600'
  },
  roleButtonTextActive: { 
    color: '#F56476',
    fontWeight: 'bold'
  },
  input: { 
    backgroundColor: '#FAFAFA', 
    padding: 15, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#DFBBB1',
    fontSize: 15
  },
  passwordContainer: {
    position: 'relative',
    width: '100%',
    marginTop: 12,
  },
  passwordInput: {
    backgroundColor: '#FAFAFA', 
    padding: 15, 
    paddingRight: 50, // Make room for the eye icon
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#DFBBB1',
    fontSize: 15,
    width: '100%',
  },
  passwordHintContainer: {
    marginTop: 8,
    gap: 6,
  },
  eyeButton: {
    position: 'absolute',
    right: 15,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 10 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#F56476' },
  link: { color: '#E43F6F', textDecorationLine: 'underline', fontWeight: 'bold' },
  btn: { backgroundColor: '#F56476', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  alternativeAuthRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
  },
  btnAlt: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnSecondary: { backgroundColor: '#8E8E93' },
  btnSecondaryText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  btnGoogle: { backgroundColor: '#4285F4' },
  toggleText: { textAlign: 'center', color: '#BE3E82', fontWeight: '600' },

  forgotText: { color: '#BE3E82', fontSize: 13, fontWeight: '600' },
  passwordHint: { color: '#8E8E93', fontSize: 12, lineHeight: 18 },
  passwordHintInvalid: { color: '#D64550' },
  passwordHintValid: { color: '#2E8B57' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 25 },
  modal: { backgroundColor: '#fff', padding: 25, borderRadius: 20, gap: 15 },
  termsBody: { color: '#5E4352', fontSize: 13, lineHeight: 20 },
  closeBtn: { backgroundColor: '#5E4352', padding: 12, borderRadius: 10, alignItems: 'center' },
  acceptBtn: { backgroundColor: '#F56476', padding: 12, borderRadius: 10, alignItems: 'center' },
  emailVerificationPrompt: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#FFFBE6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFD700',
    alignItems: 'center',
    gap: 10,
  },
  emailVerificationText: {
    fontSize: 14,
    color: '#CC9900',
    textAlign: 'center',
  },
  resendBtn: {
    backgroundColor: '#FFD700',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  resendBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  resendBtnDisabled: {
    backgroundColor: '#CCCCCC',
    borderColor: '#AAAAAA',
  },
});
