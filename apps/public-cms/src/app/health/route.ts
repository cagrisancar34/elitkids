export async function GET() {
  return Response.json(
    { ok: true, service: "elitkids-public-cms" },
    { headers: { "cache-control": "no-store" } },
  );
}
