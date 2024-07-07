export function getMongoDBURL() {
  return process.env.MONGO_URL || `mongodb://localhost:27017/woovi-api`
}

export function getDefaultPort() {
  return process.env.PORT || 3000;
}
