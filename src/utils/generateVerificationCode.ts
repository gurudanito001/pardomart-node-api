

export function generateRandomCode() {
  // Generate a random number between 1000 and 9999 (inclusive)
  const code = Math.floor(Math.random() * 9000) + 1000;
  return code;
}

