const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycby-cE33sgv6-bJ5O1tHLt8v__a8ep1UBrEaoC4NBmKcKs65bP32xZ1xUepjGflVWt0RCg/exec";

const uploadForm = document.getElementById("uploadForm");
const imageInput = document.getElementById("imageInput");
const previewWrapper = document.getElementById("previewWrapper");
const previewImage = document.getElementById("previewImage");
const submitButton = document.getElementById("submitButton");

const resultSection = document.getElementById("resultSection");
const scoreValue = document.getElementById("scoreValue");
const scoreRank = document.getElementById("scoreRank");
const scoreComment = document.getElementById("scoreComment");

const errorSection = document.getElementById("errorSection");
const errorMessage = document.getElementById("errorMessage");

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
    submitButton.disabled = false;
    submitButton.textContent = "採点する";
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
  resultSection.hidden = false;
}

function showError(message) {
  errorMessage.textContent = message;
  errorSection.hidden = false;
}

function hideMessages() {
  resultSection.hidden = true;
  errorSection.hidden = true;
}
