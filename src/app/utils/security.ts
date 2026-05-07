import { NativeBiometric } from '@capgo/capacitor-native-biometric';

export const checkBiometry = async (): Promise<boolean> => {
  try {
    const result = await NativeBiometric.isAvailable();
    if (!result.isAvailable) return false;

    await NativeBiometric.verifyIdentity({
      reason: "Access your financial dashboard",
      title: "Log in",
      subtitle: "Use biometrics to continue",
      description: "Confirm your identity to view sensitive financial data.",
      maxAttempts: 3,
    });
    return true;
  } catch (error) {
    console.error('Biometric authentication failed:', error);
    return false;
  }
};

export const setCredentials = async (password: string): Promise<void> => {
  try {
    await NativeBiometric.setCredentials({
      username: "user",
      password,
      server: "moneymanager.app",
    });
  } catch (error) {
    console.error('Failed to save credentials:', error);
  }
};
