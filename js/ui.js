import {
  createFileKey,
  getBase64FromDataUrl,
  readFileAsDataUrl
} from "./image.js";

const elements = {
  uploadForm: document.getElementById("uploadForm"),
  menuNameInput: document.getElementById("menuName"),
  commentInput: document.getElementById("comment"),
  imageInput: document.getElementById("imageInput"),
  previewWrapper: document.getElementById("previewWrapper"),
  previewImage: document.getElementById("previewImage"),
  submitButton: document.getElementById("submitButton"),
  loadingModal: document.getElementById("loadingModal"),
  resultModal: document.getElementById("resultModal"),
  closeModalButton: document.getElementById("closeModalButton"),
  resultImageFrame: document.getElementById("resultImageFrame"),
  resultPreviewImage: document.getElementById("resultPreviewImage"),
  scoreValue: document.getElementById("scoreValue"),
  scoreRank: document.getElementById("scoreRank"),
  scoreComment: document.getElementById("scoreComment"),
  errorSection: document.getElementById("errorSection"),
  errorMessage: document.getElementById("errorMessage")
};

const state = {
  activeModalCount: 0,
  previewDataUrl: "",
  previewFileKey: ""
};

export function bindUIEvents({ onSubmit }) {
  elements.closeModalButton.addEventListener("click", hideResultModal);
  elements.resultModal.addEventListener("click", handleResultModalClick);
  elements.imageInput.addEventListener("change", handleImageChange);
  elements.uploadForm.addEventListener("submit", onSubmit);
  document.addEventListener("keydown", handleDocumentKeydown);
}

export function getFormData() {
  return {
    imageFile: elements.imageInput.files?.[0],
    menuName: elements.menuNameInput.value.trim(),
    comment: elements.commentInput.value.trim()
  };
}

export async function getPreviewBase64ForFile(file) {
  const dataUrl = hasPreviewForFile(file)
    ? state.previewDataUrl
    : await readFileAsDataUrl(file);

  return getBase64FromDataUrl(dataUrl);
}

export function setLoading(isLoading) {
  elements.submitButton.disabled = isLoading;
  elements.submitButton.textContent = isLoading ? "採点中..." : "採点する";
  elements.submitButton.classList.toggle("is-loading", isLoading);

  if (isLoading) {
    openModal(elements.loadingModal);
    return;
  }

  closeModal(elements.loadingModal);
}

export function showResult(data) {
  elements.scoreValue.textContent = data.score ?? 0;
  elements.scoreRank.textContent = data.rank ?? "";
  elements.scoreComment.textContent = data.comment ?? "";

  syncResultPreview();
  openModal(elements.resultModal);
  elements.closeModalButton.focus();
}

export function showError(message) {
  elements.errorMessage.textContent = message;
  elements.errorSection.hidden = false;
}

export function clearMessages() {
  elements.errorSection.hidden = true;
  hideResultModal();
}

async function handleImageChange() {
  const file = elements.imageInput.files?.[0];
  if (!file) {
    clearPreview();
    return;
  }

  try {
    const dataUrl = await readFileAsDataUrl(file);
    setPreview(file, dataUrl);
  } catch (error) {
    console.error(error);
    clearPreview();
    showError(error.message || "画像の読み込みに失敗しました。");
  }
}

function handleResultModalClick(event) {
  const target = event.target;
  if (target instanceof HTMLElement && target.dataset.closeModal === "true") {
    hideResultModal();
  }
}

function handleDocumentKeydown(event) {
  if (event.key === "Escape" && !elements.resultModal.hidden) {
    hideResultModal();
  }
}

function hideResultModal() {
  closeModal(elements.resultModal);
}

function openModal(modalElement) {
  if (!modalElement.hidden) {
    return;
  }

  modalElement.hidden = false;
  modalElement.setAttribute("aria-hidden", "false");
  state.activeModalCount += 1;
  updateBodyScrollState();
}

function closeModal(modalElement) {
  if (modalElement.hidden) {
    return;
  }

  modalElement.hidden = true;
  modalElement.setAttribute("aria-hidden", "true");
  state.activeModalCount = Math.max(0, state.activeModalCount - 1);
  updateBodyScrollState();
}

function updateBodyScrollState() {
  document.body.classList.toggle("modal-open", state.activeModalCount > 0);
}

function setPreview(file, dataUrl) {
  state.previewDataUrl = dataUrl;
  state.previewFileKey = createFileKey(file);
  elements.previewImage.src = dataUrl;
  elements.previewWrapper.hidden = false;
  syncResultPreview();
}

function clearPreview() {
  state.previewDataUrl = "";
  state.previewFileKey = "";
  elements.previewWrapper.hidden = true;
  elements.previewImage.removeAttribute("src");
  elements.resultPreviewImage.removeAttribute("src");
  elements.resultImageFrame.hidden = true;
}

function syncResultPreview() {
  if (!state.previewDataUrl) {
    elements.resultPreviewImage.removeAttribute("src");
    elements.resultImageFrame.hidden = true;
    return;
  }

  elements.resultPreviewImage.src = state.previewDataUrl;
  elements.resultImageFrame.hidden = false;
}

function hasPreviewForFile(file) {
  return Boolean(
    state.previewDataUrl && state.previewFileKey === createFileKey(file)
  );
}
