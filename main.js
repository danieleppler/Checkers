function initEventListeners() {
  document.querySelectorAll(".tile").forEach((tile) => {
    tile.addEventListener("click", (e) => handleTileClick(e));
  });
  document
    .getElementById("resignBtn")
    .addEventListener("click", () => handleResignClick());
  document
    .getElementById("drawBtn")
    .addEventListener("click", () => handleDrawClick());
  document
    .getElementById("resignYesBtn")
    .addEventListener("click", () => handleResignConfirm());
  document
    .getElementById("resignNoBtn")
    .addEventListener("click", () => handleResignCancel());
  document
    .getElementById("drawYesBtn")
    .addEventListener("click", () => handleDrawAccept());
  document
    .getElementById("drawNoBtn")
    .addEventListener("click", () => handleDrawDecline());
}

function handleDrawAccept() {
  // First properly clean up the draw modal and its overlay
  hideModal("drawModal");
  // Then show the winner modal with a fresh overlay
  showModal("winnerModal", "Game Drawn by Agreement!");
  resetGame();
}

function handleDrawDecline() {
  hideModal("drawModal");
  // No alert needed, just continue the game
}
function handleResignClick() {
  showModal("resignModal");
}

function handleResignConfirm() {
  hideModal("resignModal");
  const winner = BlackTurn ? "White" : "Black";
  const loser = BlackTurn ? "Black" : "White";
  showModal("winnerModal", `${winner} Wins! ${loser} resigned.`);
}

function handleResignCancel() {
  hideModal("resignModal");
}

function handleDrawClick() {
  const currentPlayer = BlackTurn ? "Black" : "White";
  const otherPlayer = BlackTurn ? "White" : "Black";
  showModal(
    "drawModal",
    `${otherPlayer}, ${currentPlayer} offers a draw. Do you accept?`
  );
}

function showModal(modalId, message) {
  const modal = document.getElementById(modalId);
  // Clean up any existing overlays first
  const existingOverlays = document.querySelectorAll(".modal-overlay");
  existingOverlays.forEach((overlay) => overlay.remove());
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  document.body.appendChild(overlay);
  if (modalId === "winnerModal") {
    const closeButton = modal.querySelector(".close-button");
    if (closeButton) {
      closeButton.onclick = () => {
        hideModal(modalId);
        resetGame();
      };
    }
    document.getElementById("winnerMessage").textContent = message;
  } else if (modalId === "noMovesModal") {
    document.getElementById("noMovesMessage").textContent = message;
  } else if (modalId === "drawModal") {
    document.getElementById("drawMessage").textContent = message;
  }

  modal.style.display = "flex";
  modal.style.zIndex = "1000";
  currentOverlay = overlay;
}

function handleTileClick(e) {
  const tile = e.target.closest(".tile");
  if (selection_mode) {
    checkIfSelectionIsValid(tile);
  } else {
    if (CheckValidInitialSelection(tile)) markValidTiles(tile.children[0]);
  }
}

window.addEventListener("load", () => {
  initGame();
});

function hideModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.style.display = "none";

  // Remove any existing overlays
  const existingOverlays = document.querySelectorAll(".modal-overlay");
  existingOverlays.forEach((overlay) => overlay.remove());

  currentOverlay = null;
}
