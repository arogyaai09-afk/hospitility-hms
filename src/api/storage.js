import axiosInstance from "./axiosInstance";

export const uploadFile = async (file, folder = "files") => {
  try {
    const formData = new FormData();

    formData.append("file", file);
    formData.append("folder", folder);

    return await axiosInstance.post("/storage/upload", formData);
  } catch (error) {
    throw error || { message: "Failed to upload file" };
  }
};

export const deleteFile = async (folder, filename) => {
  try {
    return await axiosInstance.delete(
      `/storage/files/${folder}/${filename}`
    );
  } catch (error) {
    throw error || { message: "Failed to delete file" };
  }
};