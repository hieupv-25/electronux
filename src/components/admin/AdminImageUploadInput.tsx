"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";

type AdminImageUploadInputProps = {
  name: string;
  label: string;
  defaultValue?: string | null;
  folder?: string;
  bucket?: "products" | "services";
  placeholder?: string;
};

export default function AdminImageUploadInput({
  name,
  label,
  defaultValue,
  folder,
  bucket = "products",
  placeholder = "https://...",
}: AdminImageUploadInputProps) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [status, setStatus] = useState("");
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(file?: File) {
    if (!file) return;

    setUploading(true);
    setStatus("Đang tải ảnh lên Supabase...");

    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("bucket", bucket);
      if (folder) formData.set("folder", folder);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        throw new Error(data.error || "Upload ảnh thất bại");
      }

      setValue(data.url);
      setStatus("Đã tải ảnh lên Supabase");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Upload ảnh thất bại");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="admin-upload-field">
      <label>
        {label}
        <input
          name={name}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
        />
      </label>

      <label className="admin-upload-field__picker">
        <span>{uploading ? "Đang tải..." : "Chọn ảnh từ máy"}</span>
        <input
          type="file"
          accept="image/*"
          disabled={uploading}
          onChange={(event) => {
            void handleFileChange(event.target.files?.[0]);
            event.currentTarget.value = "";
          }}
        />
      </label>

      {status && <p>{status}</p>}
      {value && (
        <div className="admin-upload-field__preview">
          <img src={value} alt="" />
        </div>
      )}
    </div>
  );
}
