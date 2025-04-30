function checkEnv() {
  if (!process.env.passwordSalt) {
    throw new Error('password salt not in env');
  }

  if (!process.env.otpSalt) {
    throw new Error('otp salt not found in env');
  }
}

export default checkEnv;
