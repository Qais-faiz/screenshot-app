import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// GET /api/projects/[id] - Get specific project with images
export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const projectId = parseInt(params.id);

    if (!projectId || isNaN(projectId)) {
      return Response.json({ error: "Invalid project ID" }, { status: 400 });
    }

    // Get project
    const projectResult = await sql`
      SELECT id, title, canvas_width, canvas_height, background_type, background_gradient, background_color, created_at, updated_at
      FROM projects 
      WHERE id = ${projectId} AND user_id = ${userId}
    `;

    if (projectResult.length === 0) {
      return Response.json({ error: "Project not found" }, { status: 404 });
    }

    const project = projectResult[0];

    // Get project images
    const images = await sql`
      SELECT id, image_url, x_position, y_position, width_size, height_size, rotation_angle, scale_x, scale_y, z_index, created_at
      FROM project_images
      WHERE project_id = ${projectId}
      ORDER BY z_index ASC, created_at ASC
    `;

    return Response.json({ project: { ...project, images } });
  } catch (err) {
    console.error("GET /api/projects/[id] error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT /api/projects/[id] - Update project
export async function PUT(request, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const projectId = parseInt(params.id);

    if (!projectId || isNaN(projectId)) {
      return Response.json({ error: "Invalid project ID" }, { status: 400 });
    }

    const body = await request.json();
    const {
      title,
      canvas_width,
      canvas_height,
      background_type,
      background_gradient,
      background_color,
    } = body;

    // Build dynamic update query
    const setClauses = [];
    const values = [];

    if (typeof title === "string" && title.trim().length > 0) {
      setClauses.push(`title = $${values.length + 1}`);
      values.push(title.trim());
    }

    if (
      Number.isInteger(canvas_width) &&
      canvas_width >= 100 &&
      canvas_width <= 4000
    ) {
      setClauses.push(`canvas_width = $${values.length + 1}`);
      values.push(canvas_width);
    }

    if (
      Number.isInteger(canvas_height) &&
      canvas_height >= 100 &&
      canvas_height <= 4000
    ) {
      setClauses.push(`canvas_height = $${values.length + 1}`);
      values.push(canvas_height);
    }

    if (["gradient", "color"].includes(background_type)) {
      setClauses.push(`background_type = $${values.length + 1}`);
      values.push(background_type);
    }

    if (typeof background_gradient === "string") {
      setClauses.push(`background_gradient = $${values.length + 1}`);
      values.push(background_gradient);
    }

    if (typeof background_color === "string") {
      setClauses.push(`background_color = $${values.length + 1}`);
      values.push(background_color);
    }

    if (setClauses.length === 0) {
      return Response.json(
        { error: "No valid fields to update" },
        { status: 400 },
      );
    }

    // Add updated_at and WHERE clause
    setClauses.push(`updated_at = NOW()`);
    const whereClause = `WHERE id = $${values.length + 1} AND user_id = $${values.length + 2}`;
    values.push(projectId, userId);

    const updateQuery = `
      UPDATE projects 
      SET ${setClauses.join(", ")} 
      ${whereClause}
      RETURNING id, title, canvas_width, canvas_height, background_type, background_gradient, background_color, created_at, updated_at
    `;

    const result = await sql(updateQuery, values);

    if (result.length === 0) {
      return Response.json({ error: "Project not found" }, { status: 404 });
    }

    return Response.json({ project: result[0] });
  } catch (err) {
    console.error("PUT /api/projects/[id] error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE /api/projects/[id] - Delete project
export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const projectId = parseInt(params.id);

    if (!projectId || isNaN(projectId)) {
      return Response.json({ error: "Invalid project ID" }, { status: 400 });
    }

    // Delete project (images will be deleted via CASCADE)
    const result = await sql`
      DELETE FROM projects 
      WHERE id = ${projectId} AND user_id = ${userId}
      RETURNING id
    `;

    if (result.length === 0) {
      return Response.json({ error: "Project not found" }, { status: 404 });
    }

    return Response.json({ message: "Project deleted successfully" });
  } catch (err) {
    console.error("DELETE /api/projects/[id] error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
