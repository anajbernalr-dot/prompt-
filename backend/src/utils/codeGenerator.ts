import db from '../db/database';

const ADJECTIVES = ['BAZAR', 'FERIA', 'MERCADO', 'PLAZA', 'EXPO', 'FIESTA'];
const COLORS = ['VERDE', 'ROJO', 'AZUL', 'DORADO', 'BLANCO', 'NEGRO', 'SOLAR'];

function generateCode(): string {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const year = new Date().getFullYear();
  return `${adjective}-${color}-${year}`;
}

export function generateUniqueAccessCode(): string {
  let code: string;
  let attempts = 0;
  
  do {
    code = generateCode();
    attempts++;
    if (attempts > 100) {
      code = `${code}-${Math.floor(Math.random() * 999)}`;
      break;
    }
    const existing = db.prepare('SELECT id FROM events WHERE access_code = ?').get(code);
    if (!existing) break;
  } while (true);
  
  return code;
}
