import { data } from "react-router";

const FEEDBACK_EMAIL = process.env.FEEDBACK_EMAIL || "qaisfaiz80@gmail.com";
const RESEND_API_KEY = process.env.RESEND_API_KEY;

// Rate limiting storage
const rateLimitStore = new Map<string, { count: number; firstRequest: number }>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000;
const MAX_REQUESTS_PER_HOUR = 5;

function checkRateLimit(ip: string) {
  const now = Date.now();
  
  // Clean up old entries
  for (const [key, rateData] of rateLimitStore.entries()) {
    if (now - rateData.firstRequest > RATE_LIMIT_WINDOW) {
      rateLimitStore.delete(key);
    }
  }
  
  const rateLimitData = rateLimitStore.get(ip);

  if (!rateLimitData) {
    rateLimitStore.set(ip, { count: 1, firstRequest: now });
    return { allowed: true, remaining: MAX_REQUESTS_PER_HOUR - 1 };
  }

  if (now - rateLimitData.firstRequest > RATE_LIMIT_WINDOW) {
    rateLimitStore.set(ip, { count: 1, firstRequest: now });
    return { allowed: true, remaining: MAX_REQUESTS_PER_HOUR - 1 };
  }

  if (rateLimitData.count >= MAX_REQUESTS_PER_HOUR) {
    const resetTime = rateLimitData.firstRequest + RATE_LIMIT_WINDOW;
    const minutesUntilReset = Math.ceil((resetTime - now) / (60 * 1000));
    return { allowed: false, remaining: 0, resetIn: minutesUntilReset };
  }

  rateLimitData.count++;
  return { allowed: true, remaining: MAX_REQUESTS_PER_HOUR - rateLimitData.count };
}

function sanitizeInput(input: string) {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

function createEmailHTML(email: string, message: string, pageSource: string, timestamp: string) {
  const sanitizedEmail = sanitizeInput(email);
  const sanitizedMessage = sanitizeInput(message);
  const sanitizedPageSource = sanitizeInput(pageSource);
  const formattedDate = new Date(timestamp).toLocaleString("en-US", {
    dateStyle: "full",
    timeStyle: "long",
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Instrument Sans', Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #8B70F6 0%, #9D7DFF 100%); color: white; padding: 30px 20px; border-radius: 12px 12px 0 0; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
    .content { background: white; padding: 30px 20px; border-radius: 0 0 12px 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); }
    .field { margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #e0e0e0; }
    .field:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
    .label { font-weight: 600; color: #333; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
    .value { color: #666; font-size: 16px; line-height: 1.6; white-space: pre-wrap; word-wrap: break-word; }
    .badge { display: inline-block; padding: 4px 12px; background: #f0f0f0; border-radius: 12px; font-size: 14px; color: #666; }
    .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📬 New Feedback Received</h1>
    </div>
    <div class="content">
      <div class="field">
        <div class="label">From</div>
        <div class="value">${sanitizedEmail}</div>
      </div>
      <div class="field">
        <div class="label">Page Source</div>
        <div class="value">
          <span class="badge">${sanitizedPageSource === "landing" ? "🏠 Landing Page" : "🎨 Workspace"}</span>
        </div>
      </div>
      <div class="field">
        <div class="label">Submitted</div>
        <div class="value">${formattedDate}</div>
      </div>
      <div class="field">
        <div class="label">Message</div>
        <div class="value">${sanitizedMessage}</div>
      </div>
    </div>
    <div class="footer">
      This feedback was sent from DesignCraft
    </div>
  </div>
</body>
</html>
  `.trim();
}

export async function feedbackAction({ request }: { request: Request }) {
  try {
    const formData = await request.formData();
    const email = formData.get("email") as string;
    const message = formData.get("message") as string;
    const pageSource = formData.get("pageSource") as string;

    console.log("Feedback received:", { email, message, pageSource });

    // Validate
    if (!email || !message) {
      return data({ success: false, error: "Email and message are required" }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return data({ success: false, error: "Invalid email format" }, { status: 400 });
    }

    if (message.length < 10 || message.length > 1000) {
      return data({ success: false, error: "Message must be 10-1000 characters" }, { status: 400 });
    }

    const timestamp = new Date().toISOString();
    const htmlContent = createEmailHTML(email, message, pageSource, timestamp);
    const emailSubject = `New Feedback from DesignCraft - ${pageSource === "landing" ? "Landing Page" : "Workspace"}`;

    try {
      // Send email via Resend API
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "DesignCraft Feedback <onboarding@resend.dev>",
          to: [FEEDBACK_EMAIL],
          reply_to: email,
          subject: emailSubject,
          html: htmlContent,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error("Resend API error:", responseData);
        return data({ success: false, error: "Failed to send feedback" }, { status: 500 });
      }

      console.log("Feedback email sent successfully:", responseData);

      return data({
        success: true,
        message: "Feedback sent successfully! Thank you for your input.",
      });
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      return data({ success: false, error: "Failed to send email" }, { status: 500 });
    }
  } catch (error) {
    console.error("Feedback action error:", error);
    return data({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
