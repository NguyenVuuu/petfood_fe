import apiClient from "@/lib/axios";

export interface UploadResponse {
  url: string;
  provider: string;
  key: string;
}

export const uploadService = {
  /** POST /api/upload — multipart/form-data, field "file", field "type" */
  async uploadAvatar(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "avatar");

    const { data } = await apiClient.post<UploadResponse>("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return data;
  },
};
