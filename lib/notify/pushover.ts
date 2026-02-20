const PUSHOVER_API = "https://api.pushover.net/1/messages.json";

interface PushoverMessage {
  title: string;
  message: string;
  url?: string;
  priority?: -2 | -1 | 0 | 1;
}

export async function sendPushover(msg: PushoverMessage): Promise<void> {
  const token = process.env.PUSHOVER_APP_TOKEN;
  const user = process.env.PUSHOVER_USER_KEY;
  if (!token || !user) return;

  await fetch(PUSHOVER_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, user, ...msg }),
  });
}
