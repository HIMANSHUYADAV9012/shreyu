const API_URL = "https://facereco-lc31.onrender.com/verify";

let video, canvas, captureBtn, rescanBtn, loadingMsg, resultMsg;
let facePanel, passwordPanel, faceTabBtn, passTabBtn;
let teaserView, verificationView;
let stream = null;
let isProcessing = false;

document.addEventListener('DOMContentLoaded', () => {
  video = document.getElementById('video');
  canvas = document.getElementById('canvas');
  captureBtn = document.getElementById('captureBtn');
  rescanBtn = document.getElementById('rescanBtn');
  loadingMsg = document.getElementById('loadingMsg');
  resultMsg = document.getElementById('resultMsg');
  facePanel = document.getElementById('facePanel');
  passwordPanel = document.getElementById('passwordPanel');
  faceTabBtn = document.getElementById('faceTabBtn');
  passTabBtn = document.getElementById('passTabBtn');
  teaserView = document.getElementById('teaserView');
  verificationView = document.getElementById('verificationView');

  if (captureBtn) captureBtn.addEventListener('click', captureAndVerify);
  if (rescanBtn) rescanBtn.addEventListener('click', rescan);
  if (faceTabBtn) faceTabBtn.addEventListener('click', switchToFace);
  if (passTabBtn) passTabBtn.addEventListener('click', switchToPassword);
});

window.showVerificationView = function () {
  teaserView.classList.add('hidden');
  verificationView.classList.remove('hidden');
  switchToFace();
};

async function switchToFace() {
  facePanel.style.display = 'block';
  passwordPanel.style.display = 'none';
  faceTabBtn.className = "flex-1 py-2 text-white font-medium rounded-full transition-all duration-200 bg-pink-500/50";
  passTabBtn.className = "flex-1 py-2 text-white/70 font-medium rounded-full transition-all duration-200";
  await initCamera();
}

function switchToPassword() {
  facePanel.style.display = 'none';
  passwordPanel.style.display = 'block';
  passTabBtn.className = "flex-1 py-2 text-white font-medium rounded-full transition-all duration-200 bg-pink-500/50";
  faceTabBtn.className = "flex-1 py-2 text-white/70 font-medium rounded-full transition-all duration-200";
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
    video.srcObject = null;
  }
}

async function initCamera() {
  if (stream) return;
  try {
    const constraints = { video: { facingMode: "user" }, audio: false };
    stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;
    await video.play();
    if (resultMsg) resultMsg.classList.add('hidden');
    if (rescanBtn) rescanBtn.classList.add('hidden');
    if (loadingMsg) loadingMsg.classList.add('hidden');
    if (captureBtn) {
      captureBtn.disabled = false;
      captureBtn.classList.remove('opacity-50');
    }
    isProcessing = false;
  } catch (err) {
    console.error("Camera error:", err);
    showResult(false, "Camera access denied or not available.");
    if (captureBtn) {
      captureBtn.disabled = true;
      captureBtn.classList.add('opacity-50');
    }
  }
}

async function captureAndVerify() {
  if (isProcessing) return;
  if (!stream) await initCamera();
  if (!stream) return;

  isProcessing = true;
  captureBtn.disabled = true;
  captureBtn.classList.add('opacity-50');
  loadingMsg.classList.remove('hidden');
  resultMsg.classList.add('hidden');
  rescanBtn.classList.add('hidden');

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const context = canvas.getContext('2d');
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
  if (!blob) {
    showResult(false, "Failed to capture image.");
    resetAfterVerify();
    return;
  }

  const formData = new FormData();
  formData.append('file', blob, 'face_capture.jpg');

  try {
    const response = await fetch(API_URL, { method: 'POST', body: formData });
    const data = await response.json();

    if (response.ok && data.success === true && data.matched === true) {
      showResult(true, `✅ Verified! Welcome ${data.person_name} ✨`);
      setTimeout(() => {
        window.location.href = "/story";
      }, 1200);
    } else if (response.ok && data.success === true && data.matched === false) {
      showResult(false, `❌ Face does not match. Try again, my love 💔`);
      resetAfterVerify();
    } else {
      const msg = data.message || "Verification failed. Try again.";
      showResult(false, `❌ ${msg}`);
      resetAfterVerify();
    }
  } catch (err) {
    console.error("API error:", err);
    showResult(false, "Server error. Please try again.");
    resetAfterVerify();
  }
}

function showResult(success, message) {
  loadingMsg.classList.add('hidden');
  resultMsg.innerHTML = message;
  resultMsg.classList.remove('hidden');
  if (success) {
    resultMsg.classList.add('text-green-300');
    resultMsg.classList.remove('text-red-300');
  } else {
    resultMsg.classList.add('text-red-300');
    resultMsg.classList.remove('text-green-300');
  }
}

function resetAfterVerify() {
  isProcessing = false;
  captureBtn.disabled = false;
  captureBtn.classList.remove('opacity-50');
  rescanBtn.classList.remove('hidden');
}

function rescan() {
  resultMsg.classList.add('hidden');
  rescanBtn.classList.add('hidden');
  captureBtn.disabled = false;
  captureBtn.classList.remove('opacity-50');
  isProcessing = false;
  if (!stream) initCamera();
}

window.checkPassword = function () {
  const input = document.getElementById('storyPassword').value.trim();
  const error = document.getElementById('errorMsg');
  if (input.toLowerCase() === "shreyu") {
    window.location.href = "/story";
  } else {
    error.classList.remove('hidden');
  }
};

window.closePopup = function () {
  document.getElementById("storyPopup").style.display = "none";
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
};
