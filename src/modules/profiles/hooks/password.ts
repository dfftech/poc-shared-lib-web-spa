const PASSWORD_CHARACTERS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

export function generateRandomPassword(length: number): string {
  if (!Number.isInteger(length) || length < 1) {
    throw new RangeError("Password length must be a positive integer.");
  }

  const password: string[] = [];
  const maxByte = 256 - (256 % PASSWORD_CHARACTERS.length);
  while (password.length < length) {
    const bytes = new Uint8Array(length - password.length);
    crypto.getRandomValues(bytes);
    for (const byte of bytes) {
      if (byte < maxByte) {
        password.push(PASSWORD_CHARACTERS[byte % PASSWORD_CHARACTERS.length]);
        if (password.length === length) break;
      }
    }
  }
  return password.join("");
}
