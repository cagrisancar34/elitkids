const checks = process.argv.slice(2).map((entry) => {
  const [name, expectedValue] = entry.split("=");
  return {
    name,
    expectedValue: expectedValue?.trim() || null,
  };
});

const missingVars = checks.filter(({ name }) => {
  const value = process.env[name];
  return typeof value !== "string" || value.trim().length === 0;
});

if (missingVars.length > 0) {
  console.error(
    `[env] Missing required build-time environment variables: ${missingVars
      .map(({ name }) => name)
      .join(", ")}`,
  );
  process.exit(1);
}

const invalidVars = checks.filter(({ name, expectedValue }) => {
  if (!expectedValue) {
    return false;
  }

  return process.env[name] !== expectedValue;
});

if (invalidVars.length > 0) {
  console.error(
    `[env] Invalid build-time environment values: ${invalidVars
      .map(({ name, expectedValue }) => `${name} must equal ${expectedValue}`)
      .join(", ")}`,
  );
  process.exit(1);
}

console.log(
  `[env] Build-time environment ready: ${checks.map(({ name }) => name).join(", ")}`,
);
