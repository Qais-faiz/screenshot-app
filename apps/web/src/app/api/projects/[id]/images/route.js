import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// POST /api/projects/[id]/images - Add image to project
export async function POST(request, { params }) {
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
      image_url,
      x_position = 0,
      y_position = 0,
      width_size = 100,
      height_size = 100,
      rotation_angle = 0,
      scale_x = 1,
      scale_y = 1,
      z_index = 0,
    } = body;

    // Validate required fields
    if (!image_url || typeof image_url !== "string") {
      return Response.json({ error: "Image URL is required" }, { status: 400 });
    }

    // Verify project exists and belongs to user
    const projectExists = await sql`
      SELECT id FROM projects WHERE id = ${projectId} AND user_id = ${userId}
    `;

    if (projectExists.length === 0) {
      return Response.json({ error: "Project not found" }, { status: 404 });
    }

    // Get next z_index if not provided
    let finalZIndex = z_index;
    if (z_index === 0) {
      const maxZIndexResult = await sql`
        SELECT COALESCE(MAX(z_index), -1) + 1 as next_z_index 
        FROM project_images 
        WHERE project_id = ${projectId}
      `;
      finalZIndex = maxZIndexResult[0]?.next_z_index || 0;
    }

    const result = await sql`
      INSERT INTO project_images (
        project_id, image_url, x_position, y_position, width_size, height_size, 
        rotation_angle, scale_x, scale_y, z_index
      )
      VALUES (
        ${projectId}, ${image_url}, ${x_position}, ${y_position}, ${width_size}, 
        ${height_size}, ${rotation_angle}, ${scale_x}, ${scale_y}, ${finalZIndex}
      )
      RETURNING id, project_id, image_url, x_position, y_position, width_size, height_size, rotation_angle, scale_x, scale_y, z_index, created_at
    `;

    // Update project's updated_at timestamp
    await sql`
      UPDATE projects 
      SET updated_at = NOW() 
      WHERE id = ${projectId}
    `;

    return Response.json({ image: result[0] }, { status: 201 });
  } catch (err) {
    console.error("POST /api/projects/[id]/images error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
