// --- POPUP FUNCTIONS ---

function closePopup(){
  document.getElementById("storyPopup").style.display = "none";
}

function showPasswordBox(){
  document.getElementById("passwordBox").classList.remove("hidden");
}

function checkPassword(){
  const input = document.getElementById("storyPassword").value.trim();
  const error = document.getElementById("errorMsg");

  if(input.toLowerCase() === "shreyu"){
    // success → redirect
    window.location.href = "/story";
  } else {
    error.classList.remove("hidden");
  }
}
