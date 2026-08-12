import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const SUPABASE_URL = "https://ekgozxcqkjzzamrgiyal.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrZ296eGNxa2p6emFtcmdpeWFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3MTcwNzMsImV4cCI6MjEwMDI5MzA3M30.dHLWw52EqX4G6z10VJS-_Cw8qlJdJaIDFJnjFQWbAhY";
const BUCKET = "products";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const folders = [
  "bep-nau",
  "may-hut-am",
  "may-loc-khong-khi",
  "may-nuoc-nong",
  "may-nuoc-nong-gian-tiep",
  "may-say",
  "may-xay-sinh-to",
  "plp",
  "rice-cooker",
  "tu-lanh"
];

function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const mimeMap: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".avif": "image/avif",
    ".svg": "image/svg+xml",
    ".gif": "image/gif",
  };
  return mimeMap[ext] || "application/octet-stream";
}

async function uploadFolderRecursive(dirPath: string, basePath: string) {
  if (!fs.existsSync(dirPath)) return;
  const files = fs.readdirSync(dirPath);
  
  for (const file of files) {
    const localPath = path.join(dirPath, file);
    if (fs.statSync(localPath).isDirectory()) {
      await uploadFolderRecursive(localPath, `${basePath}/${file}`);
      continue;
    }
    
    const fileBuffer = fs.readFileSync(localPath);
    const contentType = getMimeType(file);
    const remotePath = `${basePath}/${file}`;
    
    console.log(`Uploading ${remotePath}...`);
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(remotePath, fileBuffer, {
        contentType,
        upsert: true,
      });
      
    if (error) {
      console.error(`Failed to upload ${remotePath}:`, error.message);
    } else {
      console.log(`Success: ${remotePath}`);
    }
  }
}

async function updateCategoriesFile() {
  const categoriesPath = path.resolve(__dirname, "../src/data/categories.ts");
  let content = fs.readFileSync(categoriesPath, "utf-8");
  
  const baseUrl = "https://ekgozxcqkjzzamrgiyal.supabase.co/storage/v1/object/public/products";
  
  for (const folder of folders) {
    // Replace "/folder/..." with "https://..."
    const regex = new RegExp(`"/${folder}/([^"]+)"`, "g");
    content = content.replace(regex, `"${baseUrl}/${folder}/$1"`);
  }
  
  fs.writeFileSync(categoriesPath, content, "utf-8");
  console.log("Updated categories.ts");
}

async function main() {
  console.log("Starting upload process...");
  for (const folder of folders) {
    const dirPath = path.resolve(__dirname, "../public", folder);
    await uploadFolderRecursive(dirPath, folder);
  }
  console.log("Uploads complete. Updating categories.ts...");
  await updateCategoriesFile();
  console.log("All done!");
}

main().catch(console.error);
