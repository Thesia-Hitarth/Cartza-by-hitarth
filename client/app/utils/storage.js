export const getStorageItem = (key) => {
  try {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  } catch (e) {
    console.error(`Failed to read key "${key}" from localStorage:`, e);
    return null;
  }
};

export const setStorageItem = (key, value) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
      return true;
    }
    return false;
  } catch (e) {
    console.error(`Failed to write key "${key}" to localStorage:`, e);
    return false;
  }
};

export const removeStorageItem = (key) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
      return true;
    }
    return false;
  } catch (e) {
    console.error(`Failed to remove key "${key}" from localStorage:`, e);
    return false;
  }
};
