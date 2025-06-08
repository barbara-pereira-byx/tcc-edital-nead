import { put, del, list } from "@vercel/blob"

export interface UploadResult {
  url: string
  fileName: string
  size: number
}

export async function uploadFile(file: File, folder = "editais"): Promise<UploadResult> {
  const timestamp = Date.now()
  const originalName = file.name.replace(/\s+/g, "-").toLowerCase()
  const fileName = `${folder}/${timestamp}-${originalName}`

  const blob = await put(fileName, file, {
    access: "public",
  })

  return {
    url: blob.url,
    fileName: file.name,
    size: file.size,
  }
}

export async function deleteFile(url: string): Promise<void> {
  await del(url)
}

export async function listFiles(folder = "editais") {
  const { blobs } = await list({
    prefix: folder,
  })

  return blobs
}
