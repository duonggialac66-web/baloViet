export function validateEmail(email: string): boolean {
  if (!email || email.length > 255) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): boolean {
  if (!password || password.length < 8 || password.length > 100) return false;
  // At least one uppercase letter and one number
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return hasUppercase && hasNumber;
}

export function validatePhone(phone: string): boolean {
  if (!phone) return true; // Optional by default, but if provided, must be valid
  const phoneRegex = /^(03|05|07|08|09)\d{8}$/;
  return phoneRegex.test(phone);
}

export function validateFullName(name: string): boolean {
  if (!name || name.trim().length < 2 || name.length > 100) return false;
  return true;
}
