import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// GET /api/projects - List user's projects
export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const projects = await sql`
      SELECT id, title, canvas_width, canvas_height, background_type, background_gradient, background_color, created_at, updated_at
      FROM projects 
      WHERE user_id = ${userId} 
      ORDER BY updated_at DESC
    `;

    return Response.json({ projects });
  } catch (err) {
    console.error("GET /api/projects error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/projects - Create new project
export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();

    const {
      title = "Untitled Project",
      canvas_width = 800,
      canvas_height = 600,
      background_type = "gradient",
      background_gradient = "linear-gradient(135deg, #8B70F6 0%, #9D7DFF 100%)",
      background_color = "#ffffff",
    } = body;

    // Validate input
    if (typeof title !== "string" || title.trim().length === 0) {
      return Response.json({ error: "Title is required" }, { status: 400 });
    }

    if (
      !Number.isInteger(canvas_width) ||
      canvas_width < 100 ||
      canvas_width > 4000
    ) {
      return Response.json(
        { error: "Canvas width must be between 100 and 4000" },
        { status: 400 },
      );
    }

    if (
      !Number.isInteger(canvas_height) ||
      canvas_height < 100 ||
      canvas_height > 4000
    ) {
      return Response.json(
        { error: "Canvas height must be between 100 and 4000" },
        { status: 400 },
      );
    }

    if (!["gradient", "color"].includes(background_type)) {
      return Response.json(
        { error: "Background type must be 'gradient' or 'color'" },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO projects (user_id, title, canvas_width, canvas_height, background_type, background_gradient, background_color, updated_at)
      VALUES (${userId}, ${title.trim()}, ${canvas_width}, ${canvas_height}, ${background_type}, ${background_gradient}, ${background_color}, NOW())
      RETURNING id, title, canvas_width, canvas_height, background_type, background_gradient, background_color, created_at, updated_at
    `;

    const project = result[0];
    return Response.json({ project }, { status: 201 });
  } catch (err) {
    console.error("POST /api/projects error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
