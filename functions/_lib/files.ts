import type { FileKind } from "../../shared/forms";

export type Sniffed = { kind: FileKind; contentType: string; ext: string };

/**
 * Works out what a file really is from its first bytes. The name and the browser's MIME type
 * are ignored, so a renamed script can't be stored as a "photo".
 */
export function sniff(bytes: Uint8Array, fileName: string): Sniffed | null {
  const at = (offset: number, ...values: number[]) => values.every((v, i) => bytes[offset + i] === v);
  const ascii = (offset: number, text: string) => at(offset, ...Array.from(text, (c) => c.charCodeAt(0)));

  if (at(0, 0xff, 0xd8, 0xff)) return { kind: "image", contentType: "image/jpeg", ext: "jpg" };
  if (at(0, 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return { kind: "image", contentType: "image/png", ext: "png" };
  if (ascii(0, "RIFF") && ascii(8, "WEBP")) return { kind: "image", contentType: "image/webp", ext: "webp" };
  if (ascii(4, "ftyp")) {
    const brand = String.fromCharCode(...bytes.slice(8, 12));
    if (["heic", "heix", "hevc", "heim", "heis", "mif1", "msf1"].includes(brand)) {
      return { kind: "image", contentType: "image/heic", ext: "heic" };
    }
  }
  if (ascii(0, "%PDF-")) return { kind: "pdf", contentType: "application/pdf", ext: "pdf" };
  // DOCX is a zip; only accept it when the name says .docx (a bare zip could be anything).
  if (at(0, 0x50, 0x4b, 0x03, 0x04) && /\.docx$/i.test(fileName)) {
    return {
      kind: "document",
      contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ext: "docx",
    };
  }
  if (at(0, 0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1) && /\.doc$/i.test(fileName)) {
    return { kind: "document", contentType: "application/msword", ext: "doc" };
  }
  return null;
}

/** A file name safe to put in a Content-Disposition header. */
export function safeFileName(name: string) {
  const cleaned = name.replace(/[^\w.\- ()]+/g, "_").replace(/_+/g, "_").trim().slice(0, 120);
  return cleaned || "file";
}
