import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value ?? "";
}

export const env = {
  get appId() {
    return required("APP_ID");
  },
  get appSecret() {
    return required("APP_SECRET");
  },
  get isProduction() {
    return process.env.NODE_ENV === "production";
  },
  get databaseUrl() {
    return required("DATABASE_URL");
  },
};
