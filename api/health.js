export default function handler(_req, res) {
  res.json({ status: "ok", server: "nwa-complaint-dashboard", version: "1.0.0", tools: 10, mode: "serverless" });
}
