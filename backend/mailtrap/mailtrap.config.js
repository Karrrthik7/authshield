import { MailtrapClient } from "mailtrap";
import dotenv from "dotenv";

dotenv.config();

const MAILTRAP_TOKEN = process.env.MAILTRAP_TOKEN?.trim();
let MAILTRAP_ENDPOINT = (process.env.MAILTRAP_ENDPOINT || "https://send.api.mailtrap.io").trim();

// normalize endpoint (remove trailing slash)
if (MAILTRAP_ENDPOINT.endsWith("/")) {
	MAILTRAP_ENDPOINT = MAILTRAP_ENDPOINT.slice(0, -1);
}

const SENDER_EMAIL = (process.env.MAILTRAP_SENDER_EMAIL || "mailtrap@demomailtrap.com").trim();
const SENDER_NAME = (process.env.MAILTRAP_SENDER_NAME || "AuthShield").trim();

if (!MAILTRAP_TOKEN) {
	console.error("Missing MAILTRAP_TOKEN environment variable. Add MAILTRAP_TOKEN to your .env as described in README.md");
	throw new Error("MAILTRAP_TOKEN is required for sending emails");
}

if (!SENDER_EMAIL) {
	console.error("Missing MAILTRAP_SENDER_EMAIL environment variable. Set MAILTRAP_SENDER_EMAIL in your .env or fallback will be used.");
	throw new Error("A sender email is required for outgoing emails");
}

export const mailtrapClient = new MailtrapClient({
	endpoint: MAILTRAP_ENDPOINT,
	token: MAILTRAP_TOKEN,
});

export const sender = {
	email: SENDER_EMAIL,
	name: SENDER_NAME,
};

// helper to mask token for logs
const maskToken = (t = "") => {
	if (!t) return "(none)";
	const first = t.slice(0, 4);
	const last = t.slice(-4);
	return `${first}...${last}`;
};

// Non-blocking credential check to provide clearer startup diagnostics.
// Attempts a minimal send to validate token/endpoint. This will not throw; it only logs actionable info.
const validateMailtrapCredentials = async () => {
	try {
		const payload = {
			from: { email: SENDER_EMAIL, name: SENDER_NAME },
			to: [{ email: SENDER_EMAIL }],
			subject: "Mailtrap credential verification",
			html: "<p>Credential check</p>",
			category: "Credential Check",
		};

		// Try to send a minimal message to validate credentials
		await mailtrapClient.send(payload);
		console.log(`Mailtrap credentials validated (token ${maskToken(MAILTRAP_TOKEN)}).`);
	} catch (err) {
		const status = err?.status || err?.response?.status || 'unknown';
		console.error('Mailtrap credential check failed.', {
			status,
			message: err?.message,
			token_used: maskToken(MAILTRAP_TOKEN),
		});

		if (status === 401) {
			console.error('Unauthorized (401): the MAILTRAP_TOKEN in your .env is invalid for the Send API.\n - Go to Mailtrap dashboard → API Tokens (Send API) and copy the token.\n - Update MAILTRAP_TOKEN in your .env and restart the server.');
		} else {
			console.error('Check MAILTRAP_ENDPOINT and connectivity. If the token looks correct, try regenerating the token in Mailtrap.');
		}
	}
};

// run the check shortly after startup (non-blocking)
setImmediate(() => {
	validateMailtrapCredentials().catch(() => {});
});
