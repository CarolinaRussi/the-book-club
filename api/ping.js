export default async function handler(req, res) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${cronSecret}`) {
      res.status(401).json({ ok: false, message: "Unauthorized" });
      return;
    }
  }

  const result = { ok: true, at: new Date().toISOString() };

  const apiUrl = process.env.API_URL;
  if (apiUrl) {
    try {
      const url = `${apiUrl.replace(/\/$/, "")}/health`;
      const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
      result.backend = { ok: response.ok, status: response.status };
    } catch (error) {
      result.backend = {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  res.status(200).json(result);
}
