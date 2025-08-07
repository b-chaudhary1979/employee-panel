import formidable from "formidable";
import fs from "fs";
import path from "path";

// Disable the default body parser to handle file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Parse the form data
    const form = formidable({
      uploadDir: path.join(process.cwd(), "public", "uploads"),
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      filter: function ({ name, originalName, mimetype }) {
        // Allow only specific file types
        const allowedTypes = [
          "image/jpeg",
          "image/png",
          "image/gif",
          "application/pdf",
          "text/plain",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];
        return allowedTypes.includes(mimetype);
      },
    });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    // Validate required fields
    const {
      title,
      body,
      priority,
      schedule,
      publishDate,
      userId,
      companyId,
      adminId,
    } = fields;

    if (!title || !body) {
      return res.status(400).json({ error: "Title and body are required" });
    }

    if (title.length < 3 || title.length > 100) {
      return res
        .status(400)
        .json({ error: "Title must be between 3 and 100 characters" });
    }

    if (body.length < 10 || body.length > 2000) {
      return res
        .status(400)
        .json({ error: "Body must be between 10 and 2000 characters" });
    }

    // Validate schedule
    if (schedule === "later" && !publishDate) {
      return res
        .status(400)
        .json({ error: "Publish date is required when scheduling for later" });
    }

    if (schedule === "later") {
      const selectedDate = new Date(publishDate);
      const now = new Date();
      if (selectedDate <= now) {
        return res
          .status(400)
          .json({ error: "Publish date must be in the future" });
      }
    }

    // Process attachments
    const attachments = [];
    const fileKeys = Object.keys(files);

    for (const key of fileKeys) {
      if (key.startsWith("attachment_")) {
        const file = files[key];
        if (file && file.length > 0) {
          const fileInfo = file[0];
          attachments.push({
            originalName: fileInfo.originalFilename,
            fileName: fileInfo.newFilename,
            filePath: fileInfo.filepath,
            size: fileInfo.size,
            mimetype: fileInfo.mimetype,
          });
        }
      }
    }

    // Create announcement object
    const announcement = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      title: title.trim(),
      body: body.trim(),
      priority: priority || "Normal",
      schedule: schedule || "now",
      publishDate: schedule === "later" ? publishDate : null,
      attachments,
      userId: userId || "",
      companyId: companyId || "",
      adminId: adminId || "",
      createdAt: new Date().toISOString(),
      status: schedule === "now" ? "published" : "scheduled",
    };

    // Here you would typically save to your database
    // For now, we'll simulate saving to a JSON file
    const announcementsPath = path.join(
      process.cwd(),
      "data",
      "announcements.json"
    );

    // Ensure data directory exists
    const dataDir = path.dirname(announcementsPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Read existing announcements or create new array
    let announcements = [];
    if (fs.existsSync(announcementsPath)) {
      try {
        const data = fs.readFileSync(announcementsPath, "utf8");
        announcements = JSON.parse(data);
      } catch (error) {
        announcements = [];
      }
    }

    // Add new announcement
    announcements.push(announcement);

    // Save to file
    fs.writeFileSync(announcementsPath, JSON.stringify(announcements, null, 2));

    // Return success response
    res.status(201).json({
      success: true,
      message: "Announcement created successfully",
      announcement: {
        id: announcement.id,
        title: announcement.title,
        priority: announcement.priority,
        schedule: announcement.schedule,
        status: announcement.status,
        createdAt: announcement.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
}
