export function getMongoDBURL() {
  return process.env.MONGO_URL || `mongodb://localhost:27017/woovi-api`
}

export function getDefaultPort() {
  return process.env.PORT || 3000;
}

export function getJWTPrivateKey() {
  return process.env.JWT_PRIVATEKEY || 'IcSgokW0AdqKUfwXNVI12daIjZAE3R';
}

export function getIssuer() {
  return process.env.TOKEN_ISSUER || 'http://localhost:10';
}
