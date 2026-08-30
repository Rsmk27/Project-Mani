const API_URL =
  process.env.NEXT_PUBLIC_MANI_API_URL ;

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface ManiResponse {
  success: boolean;
  response: string;
  model: string;
  error?: string;
}

export async function chatWithMani(
  query: string,
  history: Message[],
  siteContext?: string
): Promise<ManiResponse> {
  const res = await fetch(`${API_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      history,
      siteContext:
        siteContext ||
        "User is on mani.rsmk.tech — the official Mani AI chat interface.",
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to reach Mani Core.");
  }

  return res.json();
}
