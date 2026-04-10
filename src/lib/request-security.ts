type ClientSecurityContext = {
  submittedIp: string | null;
  forwardedIp: string | null;
  userAgent: string | null;
  deviceSummary: string;
  clientPlatform: string;
  clientBrowser: string;
  clientDeviceType: string;
};

type HeadersLike = Pick<Headers, "get">;

function parseForwardedChain(value: string | null) {
  if (!value) {
    return {
      primaryIp: null,
      rawChain: null,
    };
  }

  const parts = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    primaryIp: parts[0] ?? null,
    rawChain: value,
  };
}

export function resolveClientIp(headers: HeadersLike) {
  const cfConnectingIp = headers.get("cf-connecting-ip")?.trim() || null;
  const forwarded = parseForwardedChain(headers.get("x-forwarded-for"));

  return {
    submittedIp: cfConnectingIp ?? forwarded.primaryIp,
    forwardedIp: forwarded.rawChain,
  };
}

export function summarizeUserAgent(userAgent: string | null | undefined) {
  const normalized = userAgent?.trim() ?? "";
  const source = normalized.toLowerCase();

  const clientDeviceType = source.includes("ipad") || source.includes("tablet")
    ? "tablet"
    : source.includes("mobile") || source.includes("iphone") || source.includes("android")
      ? "mobile"
      : source
          ? "desktop"
          : "unknown";

  const clientPlatform = source.includes("windows")
    ? "Windows"
    : source.includes("iphone") || source.includes("ipad") || source.includes("ios")
      ? "iOS"
      : source.includes("mac os") || source.includes("macintosh")
        ? "macOS"
        : source.includes("android")
          ? "Android"
          : source.includes("linux")
            ? "Linux"
            : "Unknown";

  const clientBrowser = source.includes("edg/")
    ? "Edge"
    : source.includes("chrome/")
      ? "Chrome"
      : source.includes("firefox/")
        ? "Firefox"
        : source.includes("safari/") && !source.includes("chrome/")
          ? "Safari"
          : source.includes("opr/") || source.includes("opera")
            ? "Opera"
            : source.includes("curl/")
              ? "curl"
              : "Unknown";

  const deviceLabel = clientDeviceType === "unknown"
    ? "Unknown device"
    : clientDeviceType[0].toUpperCase() + clientDeviceType.slice(1);

  const deviceSummary = `${deviceLabel} / ${clientBrowser} / ${clientPlatform}`;

  return {
    userAgent: normalized || null,
    deviceSummary,
    clientPlatform,
    clientBrowser,
    clientDeviceType,
  };
}

export function extractClientSecurityContextFromHeaders(
  headers: HeadersLike,
): ClientSecurityContext {
  const { submittedIp, forwardedIp } = resolveClientIp(headers);
  const userAgent = headers.get("user-agent");
  const agentSummary = summarizeUserAgent(userAgent);

  return {
    submittedIp,
    forwardedIp,
    userAgent: agentSummary.userAgent,
    deviceSummary: agentSummary.deviceSummary,
    clientPlatform: agentSummary.clientPlatform,
    clientBrowser: agentSummary.clientBrowser,
    clientDeviceType: agentSummary.clientDeviceType,
  };
}

export function extractClientSecurityContext(request: Request): ClientSecurityContext {
  return extractClientSecurityContextFromHeaders(request.headers);
}

export function getRequestCorrelationId(headers: HeadersLike) {
  return (
    headers.get("x-request-id")?.trim() ||
    headers.get("cf-ray")?.trim() ||
    crypto.randomUUID()
  );
}
