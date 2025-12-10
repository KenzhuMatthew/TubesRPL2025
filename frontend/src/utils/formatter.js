export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatNumber = (number) => {
  return new Intl.NumberFormat('id-ID').format(number);
};

export const formatPercentage = (value, decimals = 0) => {
  return `${(value * 100).toFixed(decimals)}%`;
};

export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const capitalizeWords = (str) => {
  if (!str) return '';
  return str
    .split(' ')
    .map(word => capitalizeFirst(word))
    .join(' ');
};

export const formatName = (firstName, lastName) => {
  return [firstName, lastName].filter(Boolean).join(' ');
};

export const formatAddress = (address) => {
  const { street, city, province, postalCode } = address;
  return [street, city, province, postalCode].filter(Boolean).join(', ');
};

export const maskEmail = (email) => {
  if (!email) return '';
  const [username, domain] = email.split('@');
  const maskedUsername = username.charAt(0) + '*'.repeat(username.length - 2) + username.slice(-1);
  return `${maskedUsername}@${domain}`;
};

export const maskPhone = (phone) => {
  if (!phone) return '';
  return phone.slice(0, 4) + '*'.repeat(phone.length - 8) + phone.slice(-4);
};