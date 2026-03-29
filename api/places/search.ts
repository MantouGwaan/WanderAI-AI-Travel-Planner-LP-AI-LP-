export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { query } = req.query;
  const apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Google Maps API key not configured" });
  }

  try {
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query as string)}&key=${apiKey}`;
    const response = await fetch(searchUrl);
    const data = await response.json();
    res.status(200).json(data);
  } catch (error: any) {
    console.error("Error proxying Google Places request:", error);
    res.status(500).json({ error: "Failed to fetch from Google Places API" });
  }
}
