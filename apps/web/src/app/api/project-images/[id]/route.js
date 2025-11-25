import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// PUT /api/project-images/[id] - Update image properties
export async function PUT(request, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const imageId = parseInt(params.id);

    if (!imageId || isNaN(imageId)) {
      return Response.json({ error: "Invalid image ID" }, { status: 400 });
    }

    // Verify image exists and user owns the project
    const imageCheck = await sql`
      SELECT pi.id, pi.project_id
      FROM project_images pi
      JOIN projects p ON pi.project_id = p.id
      WHERE pi.id = ${imageId} AND p.user_id = ${userId}
    `;

    if (imageCheck.length === 0) {
      return Response.json({ error: "Image not found" }, { status: 404 });
    }

    const projectId = imageCheck[0].project_id;

    const body = await request.json();
    const {
      x_position,
      y_position,
      width_size,
      height_size,
      rotation_angle,
      scale_x,
      scale_y,
      z_index,
    } = body;

    // Build dynamic update query
    const setClauses = [];
    const values = [];

    if (typeof x_position === "number") {
      setClauses.push(`x_position = $${values.length + 1}`);
      values.push(x_position);
    }

    if (typeof y_position === "number") {
      setClauses.push(`y_position = $${values.length + 1}`);
      values.push(y_position);
    }

    if (typeof width_size === "number" && width_size > 0) {
      setClauses.push(`width_size = $${values.length + 1}`);
      values.push(width_size);
    }

    if (typeof height_size === "number" && height_size > 0) {
      setClauses.push(`height_size = $${values.length + 1}`);
      values.push(height_size);
    }

    if (typeof rotation_angle === "number") {
      setClauses.push(`rotation_angle = $${values.length + 1}`);
      values.push(rotation_angle);
    }

    if (typeof scale_x === "number") {
      setClauses.push(`scale_x = $${values.length + 1}`);
      values.push(scale_x);
    }

    if (typeof scale_y === "number") {
      setClauses.push(`scale_y = $${values.length + 1}`);
      values.push(scale_y);
    }

    if (typeof z_index === "number") {
      setClauses.push(`z_index = $${values.length + 1}`);
      values.push(z_index);
    }

    if (setClauses.length === 0) {
      return Response.json(
        { error: "No valid fields to update" },
        { status: 400 },
      );
    }

    const whereClause = `WHERE id = $${values.length + 1}`;
    values.push(imageId);

    const updateQuery = `
      UPDATE project_images 
      SET ${setClauses.join(", ")} 
      ${whereClause}
      RETURNING id, project_id, image_url, x_position, y_position, width_size, height_size, rotation_angle, scale_x, scale_y, z_index, created_at
    `;

    const result = await sql(updateQuery, values);

    // Update project's updated_at timestamp
    await sql`
      UPDATE projects 
      SET updated_at = NOW() 
      WHERE id = ${projectId}
    `;

    return Response.json({ image: result[0] });
  } catch (err) {
    console.error("PUT /api/project-images/[id] error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE /api/project-images/[id] - Delete image from project
export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const imageId = parseInt(params.id);

    if (!imageId || isNaN(imageId)) {
      return Response.json({ error: "Invalid image ID" }, { status: 400 });
    }

    // Get project ID and verify ownership before deleting
    const imageCheck = await sql`
      SELECT pi.project_id
      FROM project_images pi
      JOIN projects p ON pi.project_id = p.id
      WHERE pi.id = ${imageId} AND p.user_id = ${userId}
    `;

    if (imageCheck.length === 0) {
      return Response.json({ error: "Image not found" }, { status: 404 });
    }

    const projectId = imageCheck[0].project_id;

    // Delete the image
    await sql`
      DELETE FROM project_images 
      WHERE id = ${imageId}
    `;

    // Update project's updated_at timestamp
    await sql`
      UPDATE projects 
      SET updated_at = NOW() 
      WHERE id = ${projectId}
    `;

    return Response.json({ message: "Image deleted successfully" });
  } catch (err) {
    console.error("DELETE /api/project-images/[id] error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
