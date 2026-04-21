import { requestScore } from "./js/api.js";
import {
  bindUIEvents,
  clearMessages,
  getFormData,
  getPreviewBase64ForFile,
  setLoading,
  showError,
  showResult
} from "./js/ui.js";

bindUIEvents({ onSubmit: handleFormSubmit });

async function handleFormSubmit(event) {
  event.preventDefault();
  clearMessages();

  const { imageFile, menuName, comment } = getFormData();
  if (!imageFile) {
    showError("画像を選択してください。");
    return;
  }

  try {
    setLoading(true);

    const imageBase64 = await getPreviewBase64ForFile(imageFile);
    const data = await requestScore({
      menuName,
      comment,
      imageFile,
      imageBase64
    });

    if (!data.ok) {
      throw new Error(data.message || "採点に失敗しました。");
    }

    showResult(data);
  } catch (error) {
    console.error(error);
    showError(error.message || "エラーが発生しました。");
  } finally {
    setLoading(false);
  }
}
