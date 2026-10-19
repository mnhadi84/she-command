// Re-encode to remove EXIF/GPS metadata and keep field photos within request limits.
export async function preparePhoto(file: File): Promise<{ image: string; mimeType: string }> {
  if (!file.type.startsWith("image/") || file.size > 25_000_000) throw new Error("Choose an image smaller than 25 MB.");
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Photo processing is unavailable.");
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const image = canvas.toDataURL("image/jpeg", 0.85).split(",")[1];
    if (!image) throw new Error("Photo processing failed.");
    return { image, mimeType: "image/jpeg" };
  } finally { bitmap.close(); }
}