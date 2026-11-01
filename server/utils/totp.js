import crypto from 'crypto';

const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * Encode Buffer to RFC 3548 / RFC 4648 Base32 string
 */
export function base32Encode(buffer) {
  let bits = 0;
  let value = 0;
  let output = '';

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;
    while (bits >= 5) {
      output += BASE32_CHARS[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_CHARS[(value << (5 - bits)) & 31];
  }

  return output;
}

/**
 * Decode Base32 string to Buffer
 */
export function base32Decode(str) {
  let bits = 0;
  let value = 0;
  let index = 0;
  const clean = (str || '').replace(/=+$/, '').toUpperCase().replace(/\s+/g, '');
  const output = Buffer.alloc(Math.floor(clean.length * 5 / 8));

  for (let i = 0; i < clean.length; i++) {
    const val = BASE32_CHARS.indexOf(clean[i]);
    if (val === -1) continue;
    value = (value << 5) | val;
    bits += 5;
    if (bits >= 8) {
      output[index++] = (value >>> (bits - 8)) & 255;
      bits -= 8;
    }
  }

  return output;
}

/**
 * Generate cryptographically secure random Base32 secret key (20 bytes = 160 bits)
 */
export function generateSecret(bytes = 20) {
  return base32Encode(crypto.randomBytes(bytes));
}

/**
 * Calculate 6-digit TOTP code (RFC 6238 / HMAC-SHA1)
 */
export function generateTOTP(secretBase32, timeStep = 30, t = Date.now()) {
  const counter = Math.floor(t / 1000 / timeStep);
  const buf = Buffer.alloc(8);
  buf.writeBigInt64BE(BigInt(counter));

  const key = base32Decode(secretBase32);
  const hmac = crypto.createHmac('sha1', key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;

  const code = (
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff)
  ) % 1000000;

  return code.toString().padStart(6, '0');
}

/**
 * Verify user-submitted 6-digit TOTP code with time drift window tolerance
 * @param {string} inputCode 6-digit code entered by user
 * @param {string} secretBase32 Secret key in Base32 format
 * @param {number} window Number of 30-second intervals to check before and after (default 1 = ±30s)
 * @param {number} timeStep Step duration in seconds (default 30s)
 * @returns {boolean}
 */
export function verifyTOTP(inputCode, secretBase32, window = 1, timeStep = 30) {
  if (!secretBase32) return false;
  const cleanCode = (inputCode || '').toString().trim().replace(/\s+/g, '');
  if (cleanCode.length !== 6 || !/^\d{6}$/.test(cleanCode)) {
    return false;
  }

  const now = Date.now();
  for (let errorWindow = -window; errorWindow <= window; errorWindow++) {
    const checkTime = now + (errorWindow * timeStep * 1000);
    const expected = generateTOTP(secretBase32, timeStep, checkTime);
    if (crypto.timingSafeEqual(Buffer.from(cleanCode), Buffer.from(expected))) {
      return true;
    }
  }

  return false;
}

/**
 * Hash a string with SHA-256 for secure storage of backup codes
 */
export function hashBackupCode(code) {
  const clean = (code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  return crypto.createHash('sha256').update(clean).digest('hex');
}

/**
 * Generate 8 emergency single-use backup recovery codes
 */
export function generateBackupCodes(count = 8) {
  const plain = [];
  const hashed = [];
  const charset = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // exclude ambiguous characters 0, 1, I, O

  for (let i = 0; i < count; i++) {
    let part1 = '';
    let part2 = '';
    const bytes = crypto.randomBytes(8);
    for (let j = 0; j < 4; j++) part1 += charset[bytes[j] % charset.length];
    for (let j = 4; j < 8; j++) part2 += charset[bytes[j] % charset.length];
    const code = `${part1}-${part2}`;
    plain.push(code);
    hashed.push(hashBackupCode(code));
  }

  return { plain, hashed };
}

/**
 * Verify if a backup code is valid and return remaining hashed codes (single-use)
 */
export function verifyBackupCode(inputCode, hashedList) {
  if (!inputCode || !Array.isArray(hashedList) || hashedList.length === 0) {
    return { valid: false, remaining: hashedList || [] };
  }

  const targetHash = hashBackupCode(inputCode);
  const index = hashedList.findIndex(h => h === targetHash);

  if (index !== -1) {
    const remaining = [...hashedList];
    remaining.splice(index, 1);
    return { valid: true, remaining };
  }

  return { valid: false, remaining: hashedList };
}

/**
 * Generate standard otpauth:// URL for Google Authenticator QR Code
 */
export function generateOtpAuthUri({ secret, email, issuer = 'PT Jidoka Result Indonesia' }) {
  const cleanEmail = email.trim();
  const encIssuer = encodeURIComponent(issuer);
  const label = `${encIssuer}:${encodeURIComponent(cleanEmail)}`;
  return `otpauth://totp/${label}?secret=${secret}&issuer=${encIssuer}&algorithm=SHA1&digits=6&period=30`;
}
