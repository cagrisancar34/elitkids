const required = [
  "DATABASE_URI",
  "PAYLOAD_SECRET",
  "CMS_ORIGIN_TOKEN",
  "NEXT_PUBLIC_SITE_URL",
  "S3_BUCKET",
  "S3_ENDPOINT",
  "S3_ACCESS_KEY_ID",
  "S3_SECRET_ACCESS_KEY",
  "S3_PUBLIC_URL",
];

const errors = [];

for (const name of required) {
  if (!process.env[name]?.trim()) errors.push(`${name} zorunludur.`);
}

if (process.env.S3_ENABLED !== "true") {
  errors.push("S3_ENABLED production ortamında true olmalıdır.");
}

if ((process.env.PAYLOAD_SECRET?.length || 0) < 32) {
  errors.push("PAYLOAD_SECRET en az 32 karakter olmalıdır.");
}

if ((process.env.CMS_ORIGIN_TOKEN?.length || 0) < 32) {
  errors.push("CMS_ORIGIN_TOKEN en az 32 karakter olmalıdır.");
}

for (const name of ["NEXT_PUBLIC_SITE_URL", "S3_ENDPOINT", "S3_PUBLIC_URL"]) {
  const value = process.env[name];
  if (value) {
    try {
      if (new URL(value).protocol !== "https:") errors.push(`${name} HTTPS kullanmalıdır.`);
    } catch {
      errors.push(`${name} geçerli bir URL olmalıdır.`);
    }
  }
}

if (process.env.DATABASE_URI) {
  try {
    const databaseUrl = new URL(process.env.DATABASE_URI);
    if (!databaseUrl.username.startsWith("payload_cms")) {
      errors.push("DATABASE_URI özel payload_cms rolünü kullanmalıdır.");
    }
    if (!["postgres:", "postgresql:"].includes(databaseUrl.protocol)) {
      errors.push("DATABASE_URI bir PostgreSQL bağlantısı olmalıdır.");
    }
  } catch {
    errors.push("DATABASE_URI geçerli bir PostgreSQL bağlantı adresi olmalıdır.");
  }
}

if (errors.length) {
  console.error("Public CMS production yapılandırması geçersiz:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Public CMS production yapılandırması doğrulandı.");
