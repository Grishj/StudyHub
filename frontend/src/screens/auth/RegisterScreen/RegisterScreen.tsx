import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { AuthStackParamList } from '../../../types/navigation.types';
import { RegisterData } from '../../../types/auth.types';
import { SafeAreaWrapper } from '@components/layout/SafeArea/SafeAreaWrapper';
import { Container } from '@components/layout/Container';
import { TextInput } from '@components/common/Input/TextInput';
import { PasswordInput } from '@components/common/Input/PasswordInput';
import { PrimaryButton } from '@components/common/Button/PrimaryButton';
import { Card } from '@components/common/Card/Card';
import { useTheme } from '@hooks/useTheme';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { register as registerAction, clearError } from '@store/slices/authSlice';
import { registerSchema } from '@utils/validation/authSchema';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterData>({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (error) {
      Alert.alert('Registration Failed', error);
      dispatch(clearError());
    }
  }, [error]);

  const onSubmit = async (data: RegisterData) => {
    try {
      await dispatch(registerAction(data)).unwrap();
      Alert.alert(
        'Success',
        'Account created successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigation handled by root navigator
            },
          },
        ]
      );
    } catch (err) {
      // Error handled by useEffect
    }
  };

  return (
    <SafeAreaWrapper>
      <Container scrollable keyboardAware>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text
              style={[
                styles.title,
                {
                  color: theme.colors.text,
                  fontSize: theme.typography.fontSize['3xl'],
                  fontWeight: theme.typography.fontWeight.bold,
                },
              ]}
            >
              Create Account
            </Text>
            <Text
              style={[
                styles.subtitle,
                {
                  color: theme.colors.textSecondary,
                  fontSize: theme.typography.fontSize.base,
                  marginTop: theme.spacing.xs,
                },
              ]}
            >
              Sign up to start your PSC preparation
            </Text>
          </View>

          {/* Register Form */}
          <Card style={{ marginTop: theme.spacing.xl }}>
            <Controller
              control={control}
              name="fullName"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Full Name"
                  placeholder="Enter your full name"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.fullName?.message}
                  icon="person-outline"
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Email"
                  placeholder="Enter your email"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                  icon="mail-outline"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <PasswordInput
                  label="Password"
                  placeholder="Create a password"
                  value={value}
                  onChangeText={onChange}
                  error={errors.password?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <PasswordInput
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  value={value}
                  onChangeText={onChange}
                  error={errors.confirmPassword?.message}
                />
              )}
            />

            <PrimaryButton
              title="Sign Up"
              onPress={handleSubmit(onSubmit)}
              loading={loading}
              fullWidth
              style={{ marginTop: theme.spacing.md }}
            />
          </Card>

          {/* Sign In Link */}
          <View style={styles.footer}>
            <Text
              style={[
                styles.footerText,
                {
                  color: theme.colors.textSecondary,
                  fontSize: theme.typography.fontSize.sm,
                },
              ]}
            >
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text
                style={[
                  styles.signInText,
                  {
                    color: theme.colors.primary,
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: theme.typography.fontWeight.semibold,
                  },
                ]}
              >
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Container>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginTop: 40,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  footerText: {},
  signInText: {},
});