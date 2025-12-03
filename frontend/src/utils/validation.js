export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  // Min 8 karakter, mengandung huruf dan angka
  const re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
  return re.test(password);
};

export const validateNPM = (npm) => {
  // Format: 10 digit angka (diubah dari 12 digit)
  const re = /^\d{10}$/;
  return re.test(npm);
};

export const validateNIDN = (nidn) => {
  // Format: 10 digit angka
  const re = /^\d{10}$/;
  return re.test(nidn);
};

export const validatePhone = (phone) => {
  // Format Indonesia: 08xx-xxxx-xxxx atau +62xxx
  const re = /^(\+62|62|0)[8][0-9]{9,11}$/;
  return re.test(phone);
};

export const validateRequired = (value) => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined && value !== '';
};

export const validateMinLength = (value, min) => {
  return value && value.length >= min;
};

export const validateMaxLength = (value, max) => {
  return value && value.length <= max;
};

export const validateFileSize = (file, maxSizeMB) => {
  if (!file) return false;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

export const validateFileType = (file, allowedTypes) => {
  if (!file) return false;
  return allowedTypes.includes(file.type);
};