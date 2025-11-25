const FEEDBACK_EMAIL = process.env.FEEDBACK_EMAIL || "qaisfaiz80@gmail.com";
const RESEND_API_KEY = process.env.RESEND_API_KEY;

// Rate limiting storage (in-memory for simplicity)
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds
const MAX_REQUESTS_PER_HOUR = 5;

// Helper function to check rate limit
function checkRateLimit(ip) {
  const now = Date.now();
  
  // Clean up old entries
  for (const [key, data] of rateLimitStore.entries()) {
    if (now - data.firstRequest > RATE_LIMIT_WINDOW) {
      rateLimitStore.delete(key);
    }
  }
  
  const rateLimitData = rateLimitStore.get(ip);

  if (!rateLimitData) {
    // First request from this IP
    rateLimitStore.set(ip, {
      count: 1,
      firstRequest: now,
    });
    return { allowed: true, remaining: MAX_REQUESTS_PER_HOUR - 1 };
  }

  // Check if the window has expired
  if (now - rateLimitData.firstRequest > RATE_LIMIT_WINDOW) {
    // Reset the window
    rateLimitStore.set(ip, {
      count: 1,
      firstRequest: now,
    });
    return { allowed: true, remaining: MAX_REQUESTS_PER_HOUR - 1 };
  }

  // Check if limit exceeded
  if (rateLimitData.count >= MAX_REQUESTS_PER_HOUR) {
    const resetTime = rateLimitData.firstRequest + RATE_LIMIT_WINDOW;
    const minutesUntilReset = Math.ceil((resetTime - now) / (60 * 1000));
    return {
      allowed: false,
      remaining: 0,
      resetIn: minutesUntilReset,
    };
  }

  // Increment count
  rateLimitData.count++;
  return {
    allowed: true,
    remaining: MAX_REQUESTS_PER_HOUR - rateLimitData.count,
  };
}

// Helper function to validate email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Helper function to sanitize input
function sanitizeInput(input) {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

// Helper function to create email HTML
function createEmailHTML(email, message, pageSource, timestamp) {
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
    body {
      font-family: 'Instrument Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #8B70F6 0%, #9D7DFF 100%);
      color: white;
      padding: 30px 20px;
      border-radius: 12px 12px 0 0;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .content {
      background: white;
      padding: 30px 20px;
      border-radius: 0 0 12px 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .field {
      margin-bottom: 20px;
      padding-bottom: 20px;
      border-bottom: 1px solid #e0e0e0;
    }
    .field:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }
    .label {
      font-weight: 600;
      color: #333;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    .value {
      color: #666;
      font-size: 16px;
      line-height: 1.6;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      background: #f0f0f0;
      border-radius: 12px;
      font-size: 14px;
      color: #666;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #999;
      font-size: 12px;
    }
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

// Helper function to create plain text email
function createEmailText(email, message, pageSource, timestamp) {
  const formattedDate = new Date(timestamp).toLocaleString("en-US", {
    dateStyle: "full",
    timeStyle: "long",
  });

  return `
New Feedback Received from DesignCraft

From: ${email}
Page: ${pageSource === "landing" ? "Landing Page" : "Workspace"}
Submitted: ${formattedDate}

Message:
${message}

---
This feedback was sent from DesignCraft
  `.trim();
}

// POST /api/feedback - Submit feedback
export async function POST(request) {
  try {
    // Get client IP for rate limiting
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : "unknown";

    // Check rate limit
    const rateLimitResult = checkRateLimit(ip);
    if (!rateLimitResult.allowed) {
      return Response.json(
        {
          success: false,
          error: "Too many feedback submissions. Please try again later.",
          resetIn: rateLimitResult.resetIn,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimitResult.resetIn * 60),
          },
        },
      );
    }

    // Parse request body
    const body = await request.json();
    const { email, message, pageSource } = body;

    // Validate required fields
    if (!email || typeof email !== "string" || email.trim().length === 0) {
      return Response.json(
        {
          success: false,
          error: "Email is required",
        },
        { status: 400 },
      );
    }

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return Response.json(
        {
          success: false,
          error: "Message is required",
        },
        { status: 400 },
      );
    }

    // Validate email format
    if (!isValidEmail(email.trim())) {
      return Response.json(
        {
          success: false,
          error: "Invalid email format",
        },
        { status: 400 },
      );
    }

    // Validate message length
    const trimmedMessage = message.trim();
    if (trimmedMessage.length < 10) {
      return Response.json(
        {
          success: false,
          error: "Message must be at least 10 characters long",
        },
        { status: 400 },
      );
    }

    if (trimmedMessage.length > 1000) {
      return Response.json(
        {
          success: false,
          error: "Message must not exceed 1000 characters",
        },
        { status: 400 },
      );
    }

    // Validate page source
    const validPageSources = ["landing", "workspace"];
    if (!pageSource || !validPageSources.includes(pageSource)) {
      return Response.json(
        {
          success: false,
          error: "Invalid page source",
        },
        { status: 400 },
      );
    }

    // Create timestamp
    const timestamp = new Date().toISOString();

    // Create email content
    const htmlContent = createEmailHTML(
      email.trim(),
      trimmedMessage,
      pageSource,
      timestamp,
    );
    const textContent = createEmailText(
      email.trim(),
      trimmedMessage,
      pageSource,
      timestamp,
    );

    // Send email using Resend API via fetch
    const emailSubject = `New Feedback from DesignCraft - ${pageSource === "landing" ? "Landing Page" : "Workspace"}`;

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "DesignCraft Feedback <onboarding@resend.dev>",
          to: [FEEDBACK_EMAIL],
          reply_to: email.trim(),
          subject: emailSubject,
          html: htmlContent,
          text: textContent,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Resend API error:", data);
        return Response.json(
          {
            success: false,
            error: "Failed to send feedback. Please try again later.",
          },
          { status: 500 },
        );
      }

      console.log("Feedback email sent successfully:", data);

      return Response.json(
        {
          success: true,
          message: "Feedback sent successfully! Thank you for your input.",
        },
        { status: 200 },
      );
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      return Response.json(
        {
          success: false,
          error: "Failed to send feedback. Please try again later.",
        },
        { status: 500 },
      );
    }
  } catch (err) {
    console.error("POST /api/feedback error:", err);
    return Response.json(
      {
        success: false,
        error: "Internal server error. Please try again later.",
      },
      { status: 500 },
    );
  }
}
