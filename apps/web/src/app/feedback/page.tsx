import { data, redirect } from "react-router";

const FEEDBACK_EMAIL = "qaisfaiz80@gmail.com";

export async function action({ request }: { request: Request }) {
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

    // For now, just log it and return success
    console.log("Would send email to:", FEEDBACK_EMAIL);
    console.log("From:", email);
    console.log("Message:", message);
    console.log("Page:", pageSource);

    return data({
      success: true,
      message: "Feedback received! (Email sending will be configured in production)",
    });
  } catch (error) {
    console.error("Feedback action error:", error);
    return data({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function loader() {
  // Redirect to home if someone tries to access this page directly
  return redirect("/");
}

export default function FeedbackPage() {
  return null;
}
