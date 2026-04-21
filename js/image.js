export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("画像の読み込みに失敗しました。"));
    reader.readAsDataURL(file);
  });
}

export function getBase64FromDataUrl(dataUrl) {
  return dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
}

export function createFileKey(file) {
  return [file.name, file.size, file.lastModified].join(":");
}
