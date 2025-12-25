import axios from "axios";
import { useState } from "react";

export function useFileUpload() {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('imagen', file);

    setUploading(true);
    setProgress(0);

    try {
      const response = await axios.post('http://localhost:3002/upload', formData, {
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percent);
        },
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data;
    } finally {
      setUploading(false);
    }
  };

  const createPreview = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const clearPreview =() =>{
    setPreview(null)
  }

  return { uploadFile, progress, uploading, preview, createPreview , clearPreview};
}

