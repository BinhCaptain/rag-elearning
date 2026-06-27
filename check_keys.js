import fs from 'fs';
import path from 'path';

// Helper to read keys from .env
function getKeysFromEnv() {
  const paths = [
    path.resolve('apps/api/.env'),
    path.resolve('.env')
  ];
  
  for (const envPath of paths) {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const keysMatch = content.match(/GEMINI_API_KEYS\s*=\s*["']?([^"'\r\n]+)["']?/);
      if (keysMatch && keysMatch[1]) {
        return keysMatch[1].split(',').map(k => k.trim()).filter(Boolean);
      }
      const keyMatch = content.match(/GEMINI_API_KEY\s*=\s*["']?([^"'\r\n]+)["']?/);
      if (keyMatch && keyMatch[1]) {
        return [keyMatch[1].trim()];
      }
    }
  }
  return [];
}

const KEYS = getKeysFromEnv();

if (KEYS.length === 0) {
  console.log('No Gemini keys found in apps/api/.env or .env file!');
  process.exit(1);
}

console.log(`Checking ${KEYS.length} Gemini keys from .env...\n`);

async function checkOne(key, idx, model = 'gemini-1.5-flash') {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      contents: [{ parts: [{ text: 'Reply with one word: OK' }] }], 
      generationConfig: { maxOutputTokens: 5 } 
    }),
  });
  const status = res.status;
  const body = await res.json();
  if (res.ok) {
    const txt = body?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log(`PASS Key #${idx+1} [${model}]: ${txt.trim().replace(/\n/g,' ')}`);
    return true;
  } else {
    const msg = (body?.error?.message || '').substring(0, 80);
    console.log(`FAIL Key #${idx+1} [${model}]: HTTP ${status} - ${msg}`);
    return false;
  }
}

(async () => {
  let ok15 = 0;
  let ok25 = 0;
  
  console.log('--- Testing gemini-1.5-flash ---');
  for (let i = 0; i < KEYS.length; i++) {
    try { 
      if (await checkOne(KEYS[i], i, 'gemini-1.5-flash')) {
        ok15++; 
      }
    } catch(e) { 
      console.log(`ERR Key #${i+1} [gemini-1.5-flash]: ${e.message}`); 
    }
    await new Promise(r => setTimeout(r, 200));
  }
  
  console.log('\n--- Testing gemini-2.5-flash ---');
  for (let i = 0; i < KEYS.length; i++) {
    try { 
      if (await checkOne(KEYS[i], i, 'gemini-2.5-flash')) {
        ok25++; 
      }
    } catch(e) { 
      console.log(`ERR Key #${i+1} [gemini-2.5-flash]: ${e.message}`); 
    }
    await new Promise(r => setTimeout(r, 200));
  }
  
  console.log(`\nResult for gemini-1.5-flash: ${ok15}/${KEYS.length} working`);
  console.log(`Result for gemini-2.5-flash: ${ok25}/${KEYS.length} working`);
})();
