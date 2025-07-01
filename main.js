class Game {
  constructor() {
    this.initGame();
  }

  initGame() {
    this.selection_mode = false;
    this.curr_marked_tiles = [];
    this.curr_piece_to_move = {};
    this.curr_threatned_pieces = [];
    this.board = document.getElementById("board");
    this.BlackTurn = true;
    this.blackPieces = 12;
    this.whitePieces = 12;
    this.initBoard();
    this.initPieces();
    this.initEventListeners();
  }

  resetGame() {
    while (this.board.hasChildNodes()) this.board.firstChild.remove();
    this.initGame();
  }

  initPieces() {
    let blackCounter = 0;
    let whiteCounter = 0;
    for (let i = 0; i < 64; i++) {
      if (i <= 23 && this.board.children[i].classList.contains("bg-black")) {
        const white_piece = document.createElement("div");
        white_piece.id = "wp" + whiteCounter++;
        white_piece.className = "bg-white piece";
        this.board.children[i].appendChild(white_piece);
      } else if (
        i >= 40 &&
        this.board.children[i].classList.contains("bg-black")
      ) {
        const black_piece = document.createElement("div");
        black_piece.id = "bp" + blackCounter++;
        black_piece.className = "bg-black piece";
        this.board.children[i].appendChild(black_piece);
      }
    }
  }

  initBoard() {
    for (let i = 0; i < 8; i++)
      for (let j = 0; j < 8; j++) {
        const tile = document.createElement("div");
        tile.classList += "tile";
        if (i % 2 == 0)
          tile.classList += j % 2 == 0 ? " bg-white" : " bg-black";
        else tile.className += j % 2 == 0 ? " bg-black" : " bg-white";
        tile.id = i * 8 + j;
        this.board.appendChild(tile);
      }
  }

  initEventListeners() {
    document.querySelectorAll(".tile").forEach((tile) => {
      tile.addEventListener("click", (e) => this.handleTileClick(e));
    });
    document
      .getElementById("resignBtn")
      .addEventListener("click", () => this.handleResignClick());
    document
      .getElementById("drawBtn")
      .addEventListener("click", () => this.handleDrawClick());
    document
      .getElementById("resignYesBtn")
      .addEventListener("click", () => this.handleResignConfirm());
    document
      .getElementById("resignNoBtn")
      .addEventListener("click", () => this.handleResignCancel());
    document
      .getElementById("drawYesBtn")
      .addEventListener("click", () => this.handleDrawAccept());
    document
      .getElementById("drawNoBtn")
      .addEventListener("click", () => this.handleDrawDecline());
  }

  handleDrawAccept() {
    // First properly clean up the draw modal and its overlay
    this.hideModal("drawModal");
    // Then show the winner modal with a fresh overlay
    this.showModal("winnerModal", "Game Drawn by Agreement!");
    this.resetGame();
  }

  handleDrawDecline() {
    this.hideModal("drawModal");
    // No alert needed, just continue the game
  }
  handleResignClick() {
    this.showModal("resignModal");
  }

  handleResignConfirm() {
    this.hideModal("resignModal");
    const winner = this.BlackTurn ? "Black" : "White";
    const loser = this.BlackTurn ? "Black" : "White";
    this.showModal("winnerModal", `${winner} Wins! ${loser} resigned.`);
  }

  handleResignCancel() {
    this.hideModal("resignModal");
  }

  handleDrawClick() {
    const currentPlayer = this.BlackTurn ? "Black" : "White";
    const otherPlayer = this.BlackTurn ? "White" : "Black";
    this.showModal(
      "drawModal",
      `${otherPlayer}, ${currentPlayer} offers a draw. Do you accept?`
    );
  }

  hideModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = "none";

    // Remove any existing overlays
    const existingOverlays = document.querySelectorAll(".modal-overlay");
    existingOverlays.forEach((overlay) => overlay.remove());

    this.currentOverlay = null;
  }

  showModal(modalId, message) {
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
          this.hideModal(modalId);
          this.resetGame();
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
    this.currentOverlay = overlay;
  }

  handleTileClick(e) {
    const tile = e.target.closest(".tile");
    if (this.selection_mode) {
      if (
        tile.children.length > 0 &&
        this.curr_piece_to_move.id == tile.children[0].id
      ) {
        this.DeselectTiles();
        return;
      }
      if (this.curr_marked_tiles.includes(tile)) {
        this.movePiece(tile);
      } else {
        alert("Please chose one of the marked tiles");
      }
    } else {
      if (tile.children.length == 0) return;
      let IsCurrentPlayerPiece = true;
      //check if the piece in the tile is player piece
      if (
        this.BlackTurn
          ? tile.children[0].classList.contains("bg-black")
            ? ""
            : (IsCurrentPlayerPiece = false)
          : tile.children[0].classList.contains("bg-white")
          ? ""
          : (IsCurrentPlayerPiece = false)
      );
      if (!IsCurrentPlayerPiece) {
        alert(
          "Please chose a" + (this.BlackTurn ? " black " : " white ") + "piece"
        );
        return;
      }
      this.markValidTiles(tile.children[0]);
    }
  }

  DeselectTiles() {
    this.curr_marked_tiles.forEach((element) => {
      element.classList.remove("marked");
    });
    this.curr_marked_tiles = [];
    this.curr_threatned_pieces = [];
    this.selection_mode = false;
  }

  CheckIfCouldCaptureAndDidnt(targetTile) {
    let idx = this.curr_threatned_pieces.findIndex((x) =>
      x.targets.includes(targetTile)
    );
    if (
      idx != -1 &&
      this.curr_threatned_pieces[idx].targets[
        this.curr_threatned_pieces[idx].targets.length - 1
      ] != targetTile
    ) {
      alert(
        "You had the chance to capture a piece and you did'nt . Your piece is burnet!"
      );
      if (this.curr_piece_to_move.classList.contains("bg-white"))
        this.whitePieces--;
      else this.blackPieces--;
      this.updateScoreBoard();
      let parent = this.curr_piece_to_move.parentNode;
      parent.removeChild(this.curr_piece_to_move);
      this.DeselectTiles();

      return true;
    }
    if (
      !(
        idx != -1 &&
        this.curr_threatned_pieces[idx].targets.length > 1 &&
        this.curr_threatned_pieces[idx].targets[
          this.curr_threatned_pieces[idx].targets.length - 1
        ] == targetTile
      )
    ) {
      let ThreathingPieceLocation = this.GetCurrentThreatningPieceLocation(
        this.BlackTurn ? "black" : "white",
        targetTile
      );
      if (ThreathingPieceLocation != -1) {
        alert(
          "You had the chance to capture a piece and you did'nt . Your piece is burnet!"
        );
        let ThreathingPiece =
          this.board.children[ThreathingPieceLocation].children[0];
        if (ThreathingPiece.classList.contains("bg-white")) this.whitePieces--;
        else this.blackPieces--;
        this.updateScoreBoard();
        this.board.children[ThreathingPieceLocation].removeChild(
          ThreathingPiece
        );
        this.DeselectTiles();
        return true;
      }
    }
    return false;
  }

  CheckIfToPromotePiece(targetTile) {
    const targetRow = Math.floor(targetTile.id / 8);
    if (targetRow == 0 || targetRow == 7)
      this.curr_piece_to_move.classList += " king";
  }

  movePiece(targetTile) {
    if (this.CheckIfCouldCaptureAndDidnt(targetTile)) {
      if (!this.checkForWinner()) this.BlackTurn = !this.BlackTurn;
      this.checkForLegalMove();
      return;
    }
    let idx = this.curr_threatned_pieces.findIndex((x) =>
      x.targets.includes(targetTile)
    );
    targetTile.append(this.curr_piece_to_move);
    let i = 0;
    let endRemoving = false;
    if (idx != -1) {
      this.curr_threatned_pieces[idx].targets.forEach((el) => {
        this.CheckIfToPromotePiece(el);
        if (!endRemoving)
          this.CapturePiece(this.curr_threatned_pieces[idx].pieces[i]);
        i++;
        if (el == targetTile) endRemoving = true;
      });
    }
    this.DeselectTiles();
    this.CheckIfToPromotePiece(targetTile);
    if (!this.checkForWinner()) this.BlackTurn = !this.BlackTurn;
    this.checkForLegalMove();
  }

  checkForLegalMove() {
    let player = this.BlackTurn ? "bg-black" : "bg-white";
    let opponent = this.BlackTurn ? "white" : "black";
    let HasLegalMove = false;
    for (let i = 0; i < 64; i++) {
      if (
        this.board.children[i].children.length > 0 &&
        this.board.children[i].children[0].classList.contains(player)
      ) {
        let row = Math.floor(i / 8);
        let col = i % 8;
        if (
          this.IsAbleToCaptureDownLeft(opponent, row, col) ||
          this.isAbleToMoveDownLeft(row, col) ||
          this.IsAbleToCaptureDownRight(opponent, row, col) ||
          this.isAbleToMoveDownRight(row, col) ||
          this.IsAbleToCaptureUpLeft(opponent, row, col) ||
          this.isAbleToMoveUpLeft(row, col) ||
          this.isAbleToMoveUpRight(opponent, row, col) ||
          this.IsAbleToCaptureUpRight(row, col)
        ) {
          HasLegalMove = true;
          break;
        }
      }
    }
    if (!HasLegalMove) {
      this.showModal(
        "noMovesModal",
        "No legal move for " + player + " . " + opponent + " won"
      );
      this.resetGame();
    }
  }
  checkForWinner() {
    if (this.whitePieces == 0) {
      const winner = "Black";
      this.showModal("winnerModal", `${winner} Wins! .`);
      this.resetGame();
      return;
    }
    if (this.blackPieces == 0) {
      const winner = "White";
      this.showModal("winnerModal", `${winner} Wins!`);
      this.resetGame();
      return;
    }
  }

  CapturePiece(PieceNeedToCapture) {
    PieceNeedToCapture.classList.contains("bg-white")
      ? this.whitePieces--
      : this.blackPieces--;
    const parentTile = PieceNeedToCapture.parentNode;
    parentTile.removeChild(PieceNeedToCapture);
    this.updateScoreBoard();
  }

  updateScoreBoard() {
    let ws = document.getElementById("white_score");
    ws.innerHTML = this.whitePieces;
    let bs = document.getElementById("black_score");
    bs.innerHTML = this.blackPieces;
  }

  markTilesForKing(curr_piece_to_move) {
    let opponent = this.BlackTurn ? "white" : "black";
    const currTile = curr_piece_to_move.parentNode;
    let row = Math.floor(currTile.id / 8);
    let col = currTile.id % 8;
    let i = 0;
    while (this.isAbleToMoveDownLeft(row + i, col - i)) {
      i++;
      this.MarkTile((row + i) * 8 + (col - i));
    }
    if (this.IsAbleToCaptureDownLeft(opponent, row + i, col - i)) {
      this.MarkTile((row + i + 2) * 8 + col - i - 2);
      this.curr_threatned_pieces.push({
        targets: [this.board.children[(row + 2 + i) * 8 + (col - 2 - i)]],
        pieces: [
          this.board.children[(row + 1 + i) * 8 + (col - 1 - i)].children[0],
        ],
      });
      this.IsAbleToDoubleCapture(
        opponent,
        row + i + 2,
        col - i - 2,
        (row + i + 2) * 8 + col - i - 2
      );
    }

    i = 0;
    while (this.isAbleToMoveDownRight(row + i, col + i)) {
      i++;
      this.MarkTile((row + i) * 8 + (col + i));
    }
    if (this.IsAbleToCaptureDownRight(opponent, row + i, col + i)) {
      this.MarkTile((row + i + 2) * 8 + col + i + 2);
      this.curr_threatned_pieces.push({
        targets: [this.board.children[(row + i + 2) * 8 + (col + i + 2)]],
        pieces: [
          this.board.children[(row + i + 1) * 8 + (col + i + 1)].children[0],
        ],
      });
      this.IsAbleToDoubleCapture(
        opponent,
        row + i + 2,
        col + i + 2,
        (row + i + 2) * 8 + col + i + 2
      );
    }

    i = 0;
    while (this.isAbleToMoveUpLeft(row - i, col - i)) {
      i++;
      this.MarkTile((row - i) * 8 + (col - i));
    }
    if (this.IsAbleToCaptureUpLeft(opponent, row - i, col - i)) {
      this.MarkTile((row - i - 2) * 8 + col - i - 2);
      this.curr_threatned_pieces.push({
        targets: [this.board.children[(row - 2 - i) * 8 + (col - 2 - i)]],
        pieces: [
          this.board.children[(row - 1 - i) * 8 + (col - 1 - i)].children[0],
        ],
      });
      this.IsAbleToDoubleCapture(
        opponent,
        row - i - 2,
        col - i - 2,
        (row - i - 2) * 8 + col - i - 2
      );
    }

    i = 0;
    while (this.isAbleToMoveUpRight(row - i, col + i)) {
      i++;
      this.MarkTile((row - i) * 8 + (col + i));
    }
    if (this.IsAbleToCaptureUpRight(opponent, row - i, col + i)) {
      this.MarkTile((row - i - 2) * 8 + col + i + 2);
      this.curr_threatned_pieces.push({
        targets: [this.board.children[(row - 2 - i) * 8 + (col + 2 + i)]],
        pieces: [
          this.board.children[(row - 1 - i) * 8 + (col + 1 + i)].children[0],
        ],
      });
      this.IsAbleToDoubleCapture(
        opponent,
        row - i - 2,
        col + i + 2,
        (row - i - 2) * 8 + col + i + 2
      );
    }
  }

  MarkTilesForRegularPiece(curr_piece_to_move) {
    const currTile = curr_piece_to_move.parentNode;
    let row = Math.floor(currTile.id / 8);
    let col = currTile.id % 8;
    var direction;
    if (this.BlackTurn) direction = -1;
    else direction = 1;
    this.markTileWithoutCapture(row, col, direction);
    this.markTileWithCapture(
      this.BlackTurn ? "white" : "black",
      row,
      col,
      direction
    );
  }

  markValidTiles(curr_piece_to_move) {
    if (curr_piece_to_move.classList.contains("king"))
      this.markTilesForKing(curr_piece_to_move);
    this.MarkTilesForRegularPiece(curr_piece_to_move);
    if (this.curr_marked_tiles.length > 0) this.selection_mode = true;
    else {
      alert("This piece has no legal move");
      return;
    }
    this.curr_piece_to_move = curr_piece_to_move;
  }

  MarkTile(index) {
    this.curr_marked_tiles.push(this.board.children[index]);
    this.board.children[index].classList += " marked";
  }

  markTileWithoutCapture(row, col, direction) {
    if ((direction == 1 && row == 7) || (direction == -1 && row == 0)) return;
    if (
      col != 0 &&
      this.board.children[(row + direction * 1) * 8 + (col - 1)].children
        .length == 0
    ) {
      this.MarkTile((row + direction * 1) * 8 + (col - 1));
    }
    if (
      col != 7 &&
      this.board.children[(row + direction * 1) * 8 + (col + 1)].children
        .length == 0
    ) {
      this.MarkTile((row + direction * 1) * 8 + (col + 1));
    }
  }

  markTileWithCapture(opponent, row, col, direction) {
    if ((direction == 1 && row > 5) || (direction == -1 && row < 2)) return;
    //check if the piece had a capturing chance, if the player chose not to capture, alert him and remove the piece from the board
    if (
      col > 1 &&
      this.board.children[(row + direction * 2) * 8 + (col - 2)].children
        .length == 0 &&
      this.board.children[(row + direction * 1) * 8 + (col - 1)].children
        .length > 0 &&
      this.board.children[
        (row + direction * 1) * 8 + (col - 1)
      ].children[0].classList.contains("bg-" + opponent)
    ) {
      this.MarkTile((row + direction * 2) * 8 + (col - 2));
      this.curr_threatned_pieces.push({
        targets: [this.board.children[(row + direction * 2) * 8 + (col - 2)]],
        pieces: [
          this.board.children[(row + direction * 1) * 8 + (col - 1)]
            .children[0],
        ],
      });
      this.IsAbleToDoubleCapture(
        opponent,
        row + direction * 2,
        col - 2,
        this.board.children[(row + direction * 2) * 8 + (col - 2)]
      );
    }
    if (
      col < 6 &&
      this.board.children[(row + direction * 2) * 8 + (col + 2)].children
        .length == 0 &&
      this.board.children[(row + direction * 1) * 8 + (col + 1)].children
        .length > 0 &&
      this.board.children[
        (row + direction * 1) * 8 + (col + 1)
      ].children[0].classList.contains("bg-" + opponent)
    ) {
      this.MarkTile((row + direction * 2) * 8 + (col + 2));
      this.curr_threatned_pieces.push({
        targets: [this.board.children[(row + direction * 2) * 8 + (col + 2)]],
        pieces: [
          this.board.children[(row + direction * 1) * 8 + (col + 1)]
            .children[0],
        ],
      });
      this.IsAbleToDoubleCapture(
        opponent,
        row + direction * 2,
        col + 2,
        this.board.children[(row + direction * 2) * 8 + (col + 2)]
      );
    }
  }

  IsAbleToDoubleCapture(opponent, row, col, LastTarget) {
    let canCapture = true;
    while (canCapture) {
      canCapture = false;
      if (this.IsAbleToCaptureUpRight(opponent, row, col)) {
        if (
          !this.curr_marked_tiles.includes(
            this.board.children[(row - 2) * 8 + (col + 2)]
          )
        ) {
          this.MarkTile((row - 2) * 8 + (col + 2));
          let idx = this.curr_threatned_pieces.findIndex((x) =>
            x.targets.includes(LastTarget)
          );
          if (idx == -1) {
            idx = 0;
            this.curr_threatned_pieces[idx] = { targets: [], pieces: [] };
          }
          LastTarget = this.board.children[(row - 2) * 8 + (col + 2)];
          this.curr_threatned_pieces[idx].targets.push(
            this.board.children[(row - 2) * 8 + (col + 2)]
          );
          this.curr_threatned_pieces[idx].pieces.push(
            this.board.children[(row - 1) * 8 + (col + 1)].children[0]
          );
          row -= 2;
          col += 2;
          canCapture = true;

          continue;
        }
      }
      if (this.IsAbleToCaptureUpLeft(opponent, row, col)) {
        if (
          !this.curr_marked_tiles.includes(
            this.board.children[(row - 2) * 8 + (col - 2)]
          )
        ) {
          this.MarkTile((row - 2) * 8 + (col - 2));
          let idx = this.curr_threatned_pieces.findIndex((x) =>
            x.targets.includes(LastTarget)
          );
          if (idx == -1) {
            idx = 0;
            this.curr_threatned_pieces[idx] = { targets: [], pieces: [] };
          }
          LastTarget = this.board.children[(row - 2) * 8 + (col - 2)];
          this.curr_threatned_pieces[idx].targets.push(
            this.board.children[(row - 2) * 8 + (col - 2)]
          );
          this.curr_threatned_pieces[idx].pieces.push(
            this.board.children[(row - 1) * 8 + (col - 1)].children[0]
          );
          row -= 2;
          col -= 2;
          canCapture = true;
          continue;
        }
      }
      if (this.IsAbleToCaptureDownRight(opponent, row, col)) {
        if (
          !this.curr_marked_tiles.includes(
            this.board.children[(row + 2) * 8 + (col + 2)]
          )
        ) {
          this.MarkTile((row + 2) * 8 + (col + 2));
          let idx = this.curr_threatned_pieces.findIndex((x) =>
            x.targets.includes(LastTarget)
          );
          if (idx == -1) {
            LastTarget = this.board.children[(row + 2) * 8 + (col + 2)];
            idx = 0;
            this.curr_threatned_pieces[idx] = { targets: [], pieces: [] };
          }
          this.curr_threatned_pieces[idx].targets.push(
            this.board.children[(row + 2) * 8 + (col + 2)]
          );
          this.curr_threatned_pieces[idx].pieces.push(
            this.board.children[(row + 1) * 8 + (col + 1)].children[0]
          );
          row += 2;
          col += 2;
          canCapture = true;
          continue;
        }
      }
      if (this.IsAbleToCaptureDownLeft(opponent, row, col)) {
        if (
          !this.curr_marked_tiles.includes(
            this.board.children[(row + 2) * 8 + (col - 2)]
          )
        ) {
          this.MarkTile((row + 2) * 8 + (col - 2));
          let idx = this.curr_threatned_pieces.findIndex((x) =>
            x.targets.includes(LastTarget)
          );
          if (idx == -1) {
            LastTarget = this.board.children[(row + 2) * 8 + (col - 2)];
            idx = 0;
            this.curr_threatned_pieces[idx] = { targets: [], pieces: [] };
          }
          this.curr_threatned_pieces[idx].targets.push(
            this.board.children[(row + 2) * 8 + (col - 2)]
          );
          this.curr_threatned_pieces[idx].pieces.push(
            this.board.children[(row + 1) * 8 + (col - 1)].children[0]
          );
          row += 2;
          col -= 2;
          canCapture = true;
          continue;
        }
      }
    }
    return canCapture;
  }

  IsAbleToCaptureUpRight(opponent, row, col) {
    if (row < 2 || col > 5) return false;
    if (
      this.board.children[(row - 2) * 8 + (col + 2)].children.length == 0 &&
      this.board.children[(row - 1) * 8 + (col + 1)].children.length > 0 &&
      this.board.children[
        (row - 1) * 8 + (col + 1)
      ].children[0].classList.contains("bg-" + opponent)
    ) {
      return true;
    }
  }

  IsAbleToCaptureUpLeft(opponent, row, col) {
    if (row < 2 || col < 2) return false;
    if (
      this.board.children[(row - 2) * 8 + (col - 2)].children.length == 0 &&
      this.board.children[(row - 1) * 8 + (col - 1)].children.length > 0 &&
      this.board.children[
        (row - 1) * 8 + (col - 1)
      ].children[0].classList.contains("bg-" + opponent)
    ) {
      return true;
    }
  }
  IsAbleToCaptureDownRight(opponent, row, col) {
    if (col > 5 || row > 5) return false;
    if (
      this.board.children[(row + 2) * 8 + (col + 2)].children.length == 0 &&
      this.board.children[(row + 1) * 8 + (col + 1)].children.length > 0 &&
      this.board.children[
        (row + 1) * 8 + (col + 1)
      ].children[0].classList.contains("bg-" + opponent)
    ) {
      return true;
    }
  }
  IsAbleToCaptureDownLeft(opponent, row, col) {
    if (col < 2 || row > 5) return false;
    if (
      this.board.children[(row + 2) * 8 + (col - 2)].children.length == 0 &&
      this.board.children[(row + 1) * 8 + (col - 1)].children.length > 0 &&
      this.board.children[
        (row + 1) * 8 + (col - 1)
      ].children[0].classList.contains("bg-" + opponent)
    ) {
      return true;
    }
  }

  isAbleToMoveUpRight(row, col) {
    if (row <= 0) return false;
    if (
      col < 7 &&
      this.board.children[(row - 1) * 8 + (col + 1)].children.length == 0
    )
      return true;
  }

  isAbleToMoveUpLeft(row, col) {
    if (row <= 0) return false;
    if (
      col > 0 &&
      this.board.children[(row - 1) * 8 + (col - 1)].children.length == 0
    )
      return true;
  }
  isAbleToMoveDownRight(row, col) {
    if (row >= 7) return false;
    if (
      col < 7 &&
      this.board.children[(row + 1) * 8 + (col + 1)].children.length == 0
    )
      return true;
  }
  isAbleToMoveDownLeft(row, col) {
    if (row >= 7) return false;
    if (
      col > 0 &&
      this.board.children[(row + 1) * 8 + (col - 1)].children.length == 0
    )
      return true;
  }

  IsKingAbleToCaptureUpLeft(row, col) {
    if (row <= 0 || col <= 0) return -1;
    while (
      row > 0 &&
      col > 0 &&
      this.board.children[row * 8 + col].children.length == 0
    ) {
      row--;
      col--;
    }
    row++;
    col++;
    if (row < 2 || col < 2) return -1;
    if (
      this.IsAbleToCaptureUpLeft(this.BlackTurn ? "white" : "black", row, col)
    )
      return (row - 2) * 8 + col - 2;
    return -1;
  }

  IsKingAbleToCaptureUpRight(row, col) {
    if (row <= 0 || col >= 7) return -1;
    while (
      row > 0 &&
      col < 7 &&
      this.board.children[row * 8 + col].children.length == 0
    ) {
      row--;
      col++;
    }
    row++;
    col--;
    if (row < 2 || col > 5) return -1;
    if (
      this.IsAbleToCaptureUpRight(this.BlackTurn ? "white" : "black", row, col)
    )
      return (row - 2) * 8 + col + 2;
    return -1;
  }

  IsKingAbleToCaptureDownLeft(row, col) {
    if (row >= 7 || col <= 0) return -1;
    while (
      row < 7 &&
      col > 0 &&
      this.board.children[row * 8 + col].children.length == 0
    ) {
      row++;
      col--;
    }
    row--;
    col++;
    if (row > 5 || col < 2) return -1;
    if (
      this.IsAbleToCaptureDownLeft(this.BlackTurn ? "white" : "black", row, col)
    )
      return (row + 2) * 8 + col - 2;
    return -1;
  }

  IsKingAbleToCaptureDownRight(row, col) {
    if (row >= 7 || col >= 7) return -1;
    while (
      row < 7 &&
      col < 7 &&
      this.board.children[row * 8 + col].children.length == 0
    ) {
      row++;
      col++;
    }
    row--;
    col--;
    if (row > 5 || col > 5) return -1;
    if (
      this.IsAbleToCaptureDownRight(
        this.BlackTurn ? "white" : "black",
        row,
        col
      )
    )
      return (row + 2) * 8 + col + 2;
    return -1;
  }

  GetCurrentThreatningPieceLocation(player, targetTile) {
    let opponent = player == "white" ? "black" : "white";
    let ThreatningPiecesLocations = [];
    for (let i = 0; i < 64; i++) {
      if (
        this.board.children[i].children.length > 0 &&
        this.board.children[i].children[0].classList.contains("bg-" + player)
      ) {
        let row = Math.floor(board.children[i].id / 8);
        let col = board.children[i].id % 8;
        if (board.children[i].children[0].classList.contains("king")) {
          let idx = this.IsKingAbleToCaptureUpLeft(row - 1, col - 1);
          if (idx == -1)
            idx = this.IsKingAbleToCaptureUpRight(row - 1, col + 1);
          if (idx == -1)
            idx = this.IsKingAbleToCaptureDownLeft(row + 1, col - 1);
          if (idx == -1)
            idx = this.IsKingAbleToCaptureDownRight(row + 1, col + 1);
          if (idx != -1) {
            if (
              targetTile.id == idx &&
              this.board.children[i].children[0].id ===
                this.curr_piece_to_move.id &&
              !this.IsAbleToDoubleCapture(
                opponent,
                row + 2,
                col - 2,
                targetTile
              )
            )
              return -1;
            ThreatningPiecesLocations.push(i);
          }
        }
        if (
          player == "white" &&
          this.IsAbleToCaptureDownLeft(opponent, row, col)
        ) {
          if (
            targetTile.id ==
              this.board.children[(row + 2) * 8 + (col - 2)].id &&
            this.board.children[i].children[0].id ===
              this.curr_piece_to_move.id &&
            !this.IsAbleToDoubleCapture(opponent, row + 2, col - 2, targetTile)
          )
            return -1;
          ThreatningPiecesLocations.push(i);
        }
        if (
          player == "white" &&
          this.IsAbleToCaptureDownRight(opponent, row, col)
        ) {
          if (
            targetTile.id ==
              this.board.children[(row + 2) * 8 + (col + 2)].id &&
            this.board.children[i].children[0].id ===
              this.curr_piece_to_move.id &&
            !this.IsAbleToDoubleCapture(opponent, row + 2, col + 2, targetTile)
          )
            return -1;
          ThreatningPiecesLocations.push(i);
        }
        if (
          player == "black" &&
          this.IsAbleToCaptureUpLeft(opponent, row, col)
        ) {
          if (
            targetTile.id ==
              this.board.children[(row - 2) * 8 + (col - 2)].id &&
            this.board.children[i].children[0].id ===
              this.curr_piece_to_move.id &&
            !this.IsAbleToDoubleCapture(opponent, row - 2, col - 2, targetTile)
          )
            return -1;
          ThreatningPiecesLocations.push(i);
        }
        if (
          player == "black" &&
          this.IsAbleToCaptureUpRight(opponent, row, col)
        ) {
          if (
            targetTile.id ==
              this.board.children[(row - 2) * 8 + (col + 2)].id &&
            this.board.children[i].children[0].id ===
              this.curr_piece_to_move.id &&
            !this.IsAbleToDoubleCapture(opponent, row - 2, col + 2, targetTile)
          )
            return -1;
          ThreatningPiecesLocations.push(i);
        }
      }
    }
    if (ThreatningPiecesLocations.length > 0)
      return ThreatningPiecesLocations[0];
    else return -1;
  }
}

window.addEventListener("load", () => {
  new Game();
});
