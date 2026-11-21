function validateEnvironment(env) {
  if (!env.JWT_SECRET || env.JWT_SECRET.length < 32
      || /nhomBaKhi_DeTai25_SecretKey|CHANGE_ME|your_|replace/i.test(env.JWT_SECRET)) {
    throw new Error('JWT_SECRET must be a private random value of at least 32 characters.');
  }
  let databaseUrl;
  try { databaseUrl = new URL(env.DATABASE_URL); } catch {
    throw new Error('DATABASE_URL must be a PostgreSQL connection URL.');
  }
  if (!['postgres:', 'postgresql:'].includes(databaseUrl.protocol)
      || /YOUR_|CHANGE_ME|placeholder/i.test(env.DATABASE_URL)) {
    throw new Error('DATABASE_URL must contain the real PostgreSQL connection settings.');
  }
  const port = Number(env.PORT || 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535.');
  }
  return { port };
}

module.exports = { validateEnvironment };
