import * as Keychain from 'react-native-keychain';

export const save = async (key: string, value: string) => {
  try {
    await Keychain.setGenericPassword(key, value);
  } catch (e) {
    console.error('Failed to save data to secure storage', e);
  }
};

export const getValueFor = async (key: string) => {
  try {
    const credentials = await Keychain.getGenericPassword();
    if (credentials && credentials.username === key) {
      return credentials.password;
    }
    return null;
  } catch (e) {
    console.error('Failed to fetch data from secure storage', e);
    return null;
  }
};

export const deleteValue = async (key: string) => {
  try {
    await Keychain.resetGenericPassword();
  } catch (e) {
    console.error('Failed to remove data from secure storage', e);
  }
};