import { Alert, AlertButton, Platform } from 'react-native';

export const showAlert = (
  title: string,
  message?: string,
  buttons?: AlertButton[]
) => {
  if (Platform.OS === 'web') {
    const webAlert = (globalThis as { alert?: (text: string) => void }).alert;

    if (webAlert) {
      webAlert(message ? `${title}\n\n${message}` : title);
    }

    const action =
      buttons?.find((button) => button.style !== 'cancel') ?? buttons?.[0];

    action?.onPress?.();
    return;
  }

  Alert.alert(title, message, buttons);
};
