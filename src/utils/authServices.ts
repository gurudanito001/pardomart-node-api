import bcrypt from 'bcrypt';


export async function hashPassword(password: string, salt = 8) {
  return bcrypt.hash(password, salt);
};

export async function isPasswordMatch (providePassword: string, userPassword: string) {
  return bcrypt.compare(providePassword, userPassword);
};

export function generateRandomString (length = 4, digitOnly = true)  {
  let result = '';
  const characters = digitOnly ? '0123456789' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};
