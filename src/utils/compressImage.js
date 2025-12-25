export const compressImage = async (file, maxWidth = 1920, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      // nuevas dimensiones
      const ratio = Math.min(maxWidth / img.width, 1);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;

      // dibujar imagen
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // convertir a blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Error comprimiendo imagen"));
            return;
          }

          const compressedFile = new File([blob], file.name, {
            type: "image/jpeg",
          });

          resolve(compressedFile);
        },
        "image/jpeg",
        quality
      );
    };

    img.onerror = () => reject(new Error("Error cargando imagen"));
    img.src = URL.createObjectURL(file);
  });
};
