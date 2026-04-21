const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycby-cE33sgv6-bJ5O1tHLt8v__a8ep1UBrEaoC4NBmKcKs65bP32xZ1xUepjGflVWt0RCg/exec";

const uploadForm = document.getElementById("uploadForm");
const imageInput = document.getElementById("imageInput");
const previewWrapper = document.getElementById("previewWrapper");
const previewImage = document.getElementById("previewImage");
const submitButton = document.getElementById("submitButton");

const loadingModal = document.getElementById("loadingModal");
const resultModal = document.getElementById("resultModal");
const closeModalButton = document.getElementById("closeModalButton");
const scoreValue = document.getElementById("scoreValue");
const scoreRank = document.getElementById("scoreRank");
const scoreComment = document.getElementById("scoreComment");

const errorSection = document.getElementById("errorSection");
const errorMessage = document.getElementById("errorMessage");
let activeModalCount = 0;

closeModalButton.addEventListener("click", hideResultModal);

resultModal.addEventListener("click", (event) => {
  const target = event.target;
  if (target instanceof HTMLElement && target.dataset.closeModal === "true") {
    hideResultModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !resultModal.hidden) {
    hideResultModal();
  }
});

imageInput.addEventListener("change", () => {
  const file = imageInput.files?.[0];
  if (!file) {
    previewWrapper.hidden = true;
    previewImage.removeAttribute("src");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    previewImage.src = reader.result;
    previewWrapper.hidden = false;
  };
  reader.readAsDataURL(file);
});

uploadForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  hideMessages();

  const imageFile = imageInput.files?.[0];
  const menuName = document.getElementById("menuName").value.trim();
  const comment = document.getElementById("comment").value.trim();

  if (!imageFile) {
    showError("画像を選択してください。");
    return;
  }

  try {
    submitButton.disabled = true;
    submitButton.textContent = "採点中...";
    submitButton.classList.add("is-loading");
    showLoadingModal();

    const base64Image = await fileToBase64(imageFile);

    const payload = {
      menuName,
      comment,
      image: {
        name: imageFile.name,
        type: imageFile.type,
        size: imageFile.size,
        base64: base64Image
      }
    };

    const response = await fetch(GAS_WEB_APP_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`通信エラー: ${response.status}`);
    }

    const data = await response.json();

    if (!data.ok) {
      throw new Error(data.message || "採点に失敗しました。");
    }

    showResult(data);
  } catch (error) {
    console.error(error);
    showError(error.message || "エラーが発生しました。");
  } finally {
    hideLoadingModal();
    submitButton.disabled = false;
    submitButton.textContent = "採点する";
    submitButton.classList.remove("is-loading");
  }
});

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = String(reader.result);
      const base64 = result.includes(",") ? result.split(",")[1] : result;
      resolve(base64);
    };

    reader.onerror = () => reject(new Error("画像の読み込みに失敗しました。"));
    reader.readAsDataURL(file);
  });
}

function showResult(data) {
  scoreValue.textContent = data.score ?? 0;
  scoreRank.textContent = data.rank ?? "";
  scoreComment.textContent = data.comment ?? "";
  openModal(resultModal);
  closeModalButton.focus();
}

function showError(message) {
  errorMessage.textContent = message;
  errorSection.hidden = false;
}

function hideMessages() {
  errorSection.hidden = true;
  hideResultModal();
}

function showLoadingModal() {
  openModal(loadingModal);
}

function hideLoadingModal() {
  closeModal(loadingModal);
}

function hideResultModal() {
  closeModal(resultModal);
}

function openModal(modalElement) {
  if (!modalElement.hidden) {
    return;
  }

  modalElement.hidden = false;
  modalElement.setAttribute("aria-hidden", "false");
  activeModalCount += 1;
  updateBodyScrollState();
}

function closeModal(modalElement) {
  if (modalElement.hidden) {
    return;
  }

  modalElement.hidden = true;
  modalElement.setAttribute("aria-hidden", "true");
  activeModalCount = Math.max(0, activeModalCount - 1);
  updateBodyScrollState();
}

function updateBodyScrollState() {
  document.body.classList.toggle("modal-open", activeModalCount > 0);
}
