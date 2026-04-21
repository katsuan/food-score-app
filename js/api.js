const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycby-cE33sgv6-bJ5O1tHLt8v__a8ep1UBrEaoC4NBmKcKs65bP32xZ1xUepjGflVWt0RCg/exec";

export async function requestScore({ menuName, comment, imageFile, imageBase64 }) {
  const payload = {
    menuName,
    comment,
    image: {
      name: imageFile.name,
      type: imageFile.type,
      size: imageFile.size,
      base64: imageBase64
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

  return response.json();
}
