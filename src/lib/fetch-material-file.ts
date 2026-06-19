export async function fetchMaterialFile(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) {
    throw new Error(`Failed to load file (${res.status})`);
  }

  const buffer = await res.arrayBuffer();
  if (buffer.byteLength === 0) {
    throw new Error("File is empty. Ask your admin to re-upload this material.");
  }

  return buffer;
}
