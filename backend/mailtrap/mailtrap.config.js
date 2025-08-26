import { MailtrapClient } from "mailtrap";
import dotenv from "dotenv";

dotenv.config();

const MAILTRAP_TOKEN = process.env.MAILTRAP_TOKEN;
let MAILTRAP_ENDPOINT = process.env.MAILTRAP_ENDPOINT || "https://send.api.mailtrap.io";

// normalize endpoint (remove trailing slash)
if (MAILTRAP_ENDPOINT.endsWith("/")) {
	MAILTRAP_ENDPOINT = MAILTRAP_ENDPOINT.slice(0, -1);
}

const SENDER_EMAIL = process.env.MAILTRAP_SENDER_EMAIL || "mailtrap@demomailtrap.com";
const SENDER_NAME = process.env.MAILTRAP_SENDER_NAME || "AuthShield";

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
