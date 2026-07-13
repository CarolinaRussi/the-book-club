const DEFAULT_MAX_EDGE = 1920;
const DEFAULT_MAX_BYTES = 10 * 1024 * 1024;
const DEFAULT_QUALITY = 0.82;

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.addEventListener("load", () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    });
    image.addEventListener("error", (error) => {
      URL.revokeObjectURL(objectUrl);
      reject(error);
    });
    image.src = objectUrl;
  });
}

function canvasToJpegBlob(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Falha ao comprimir a imagem."));
      },
      "image/jpeg",
      quality,
    );
  });
}

export async function compressImageFile(
  file: File,
  options?: {
    maxEdge?: number;
    maxBytes?: number;
    quality?: number;
  },
): Promise<File> {
  if (!file.type.startsWith("image/")) {
    return file;
  }

  const maxEdge = options?.maxEdge ?? DEFAULT_MAX_EDGE;
  const maxBytes = options?.maxBytes ?? DEFAULT_MAX_BYTES;
  let quality = options?.quality ?? DEFAULT_QUALITY;

  const image = await loadImageFromFile(file);
  const longestEdge = Math.max(image.width, image.height);
  const scale = longestEdge > maxEdge ? maxEdge / longestEdge : 1;
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas 2D não disponível");
  }
  context.drawImage(image, 0, 0, width, height);

  let blob = await canvasToJpegBlob(canvas, quality);
  while (blob.size > maxBytes && quality > 0.45) {
    quality -= 0.1;
    blob = await canvasToJpegBlob(canvas, quality);
  }

  if (blob.size > maxBytes) {
    throw new Error(
      "A foto continua grande demais após comprimir. Escolha outra imagem.",
    );
  }

  if (blob.size >= file.size && file.size <= maxBytes && scale === 1) {
    return file;
  }

  const baseName = file.name.replace(/\.[^.]+$/, "") || "recap";
  return new File([blob], `${baseName}.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}
