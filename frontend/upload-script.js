// To use this script, run: npm install @aws-sdk/client-s3 mime-types
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import mime from "mime-types";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- CONFIGURATION ---
const BUCKET_NAME = "citizen-cleanliness-frontend-web"; // Replace with your exact S3 bucket name
const REGION = "us-east-1"; // Replace with your AWS Region

// Ensure your ~/.aws/credentials file is set up, or export AWS_ACCESS_KEY_ID & AWS_SECRET_ACCESS_KEY in your terminal.
const s3Client = new S3Client({ region: REGION });

const DIST_DIR = path.join(__dirname, "dist");

// Recursive function to get all files in a directory
const getFiles = (dir, fileList = []) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getFiles(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  }
  return fileList;
};

const uploadToS3 = async () => {
  if (!fs.existsSync(DIST_DIR)) {
    console.error("❌ Error: dist/ directory not found. Did you run 'npm run build'?");
    process.exit(1);
  }

  const filesToUpload = getFiles(DIST_DIR);
  console.log(`🚀 Found ${filesToUpload.length} files to upload to S3 bucket '${BUCKET_NAME}'...\n`);

  for (const filePath of filesToUpload) {
    // Ensure the S3 Key doesn't include the 'dist/' folder name, just the files inside it
    const s3Key = path.relative(DIST_DIR, filePath).replace(/\\/g, "/");

    // Guess the Content-Type based on the file extension (Crucial for styling/JS to work on S3)
    const contentType = mime.lookup(filePath) || "application/octet-stream";

    const fileContent = fs.readFileSync(filePath);

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: fileContent,
      ContentType: contentType, // Without this, CSS and JS won't load in browsers!
    });

    try {
      await s3Client.send(command);
      console.log(`✅ Uploaded [${contentType}]: ${s3Key}`);
    } catch (error) {
      console.error(`❌ Failed to upload ${s3Key}:`, error.message);
    }
  }

  console.log("\n🎉 All files uploaded successfully!");
  console.log(`🔗 Your website should be live at: http://${BUCKET_NAME}.s3-website-${REGION}.amazonaws.com`);
};

uploadToS3();
