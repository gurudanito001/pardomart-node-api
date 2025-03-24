// utils/verification.ts
export const generateVerificationCode = (): string => {
  return '123456'
  //return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
};

export const sendVerificationCode = async (mobileNumber: string, verificationCode: string): Promise<void> => {
    console.log(`Sending verification code ${verificationCode} to ${mobileNumber}`);
    //Here you would implement your sms service provider.
};