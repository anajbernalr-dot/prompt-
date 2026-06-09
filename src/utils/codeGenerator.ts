const WORDS_A = [
  'BAZAR', 'FERIA', 'PLAZA', 'MERCADO', 'FIESTA',
  'EXPO', 'CAMPO', 'PARQUE', 'PUEBLO', 'VILLA',
];

const WORDS_B = [
  'VERDE', 'AZUL', 'ROJO', 'DORADO', 'LUNAR',
  'SOLAR', 'NORTE', 'SUR', 'REAL', 'NUEVO',
];

export function generateEventCode(): string {
  const wordA = WORDS_A[Math.floor(Math.random() * WORDS_A.length)];
  const wordB = WORDS_B[Math.floor(Math.random() * WORDS_B.length)];
  const year = new Date().getFullYear();
  return `${wordA}-${wordB}-${year}`;
}

export function generateShortCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
