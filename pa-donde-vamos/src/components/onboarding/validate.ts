const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export type AuthErrors = { name?: string; email?: string; password?: string };

export function validateName(name: string) {
  return name.trim().length >= 2 ? undefined : 'Cuéntanos cómo te llamas (mínimo 2 letras).';
}

export function validateEmail(email: string) {
  if (!email.trim()) return 'Escribe tu correo.';
  return EMAIL_RE.test(email.trim()) ? undefined : 'Ese correo no se ve bien. Revísalo, porfa.';
}

export function validatePassword(password: string) {
  return password.length >= 6 ? undefined : 'La contraseña necesita al menos 6 caracteres.';
}

export const hasErrors = (e: AuthErrors) => Object.values(e).some(Boolean);
