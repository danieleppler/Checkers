let selection_mode;
let curr_marked_tiles;
let curr_piece_to_move;
let curr_threatned_pieces;
let board;
let BlackTurn;
let blackPieces;
let whitePieces;
let GlobalLastTarget;
function initGame() {
  selection_mode = false;
  curr_marked_tiles = [];
  curr_piece_to_move = {};
  curr_threatned_pieces = [];
  board = document.getElementById("board");
  BlackTurn = true;
  blackPieces = 12;
  whitePieces = 12;
  initBoard();
  initPieces();
  initEventListeners();
}
function resetGame() {
  while (board.hasChildNodes()) board.firstChild.remove();
  initGame();
}
function ConvertCharToPiece(locationId, pieceId, color) {
  const piece = document.createElement("div");
  piece.id = (color == "white" ? "wp" : "bp") + pieceId;
  piece.className = (color == "white" ? "bg-white" : "bg-black") + " piece";
  board.children[locationId].appendChild(piece);
}
function initPieces() {
  let blackCounter = 0;
  let whiteCounter = 0;
  // prettier-ignore
  {
         //full board
    /*["","w","","w","","w","","w",
                        "w","","w","","w","","w","",
                        "","w","","w","","w","","w",
                        '','','','','','','','',
                        '','','','','','','','',
                        'b','','b','','b','','b','',
                        '','b','','b','','b','','b',
                        'b','','b','','b','','b','',
    ];*/
    var boardAsString = ["","w","","w","","w","","w",
                        "w","","w","","w","","w","",
                        "","w","","w","","w","","w",
                        '','','','','','','','',
                        '','','','','','','','',
                        'b','','b','','b','','b','',
                        '','b','','b','','b','','b',
                        'b','','b','','b','','b','',
    ]
    }
  for (let i = 0; i < 64; i++) {
    if (boardAsString[i] == "w") {
      ConvertCharToPiece(i, whiteCounter++, "white");
    } else if (boardAsString[i] == "b") {
      ConvertCharToPiece(i, blackCounter++, "black");
    }
  }
}
function initBoard() {
  for (let i = 0; i < 8; i++)
    for (let j = 0; j < 8; j++) {
      const tile = document.createElement("div");
      tile.classList += "tile";
      if (i % 2 == 0) tile.classList += j % 2 == 0 ? " bg-white" : " bg-black";
      else tile.className += j % 2 == 0 ? " bg-black" : " bg-white";
      tile.id = i * 8 + j;
      board.appendChild(tile);
    }
}
function DeselectTiles() {
  curr_marked_tiles.forEach((element) => {
    element.classList.remove("marked");
  });
  curr_marked_tiles = [];
  curr_threatned_pieces = [];
  selection_mode = false;
}
function CheckIfToPromotePiece(targetTile) {
  const targetRow = Math.floor(targetTile.id / 8);
  if (targetRow == 0 || targetRow == 7) curr_piece_to_move.classList += " king";
}
function movePiece(targetTile) {
  if (CheckIfCouldCaptureAndDidnt(targetTile)) {
    if (!checkForWinner()) BlackTurn = !BlackTurn;
    checkForLegalMove();
    return;
  }
  let idx = curr_threatned_pieces.findIndex((x) =>
    x.targets.includes(targetTile)
  );
  targetTile.append(curr_piece_to_move);
  let i = 0;
  let endRemoving = false;
  if (idx != -1) {
    curr_threatned_pieces[idx].targets.forEach((el) => {
      CheckIfToPromotePiece(el);
      if (!endRemoving) CapturePiece(curr_threatned_pieces[idx].pieces[i]);
      i++;
      if (el == targetTile) endRemoving = true;
    });
  }
  DeselectTiles();
  CheckIfToPromotePiece(targetTile);
  if (!checkForWinner()) BlackTurn = !BlackTurn;
  checkForLegalMove();
}
function checkForWinner() {
  if (whitePieces == 0) {
    const winner = "Black";
    showModal("winnerModal", `${winner} Wins! .`);
    resetGame();
    return;
  }
  if (blackPieces == 0) {
    const winner = "White";
    showModal("winnerModal", `${winner} Wins!`);
    resetGame();
    return;
  }
}
function CapturePiece(PieceNeedToCapture) {
  PieceNeedToCapture.classList.contains("bg-white")
    ? whitePieces--
    : blackPieces--;
  const parentTile = PieceNeedToCapture.parentNode;
  parentTile.removeChild(PieceNeedToCapture);
  updateScoreBoard();
}
function updateScoreBoard() {
  let ws = document.getElementById("white_score");
  ws.innerHTML = whitePieces;
  let bs = document.getElementById("black_score");
  bs.innerHTML = blackPieces;
}
function MarkTilesForRegularPiece(curr_piece_to_move) {
  const currTile = curr_piece_to_move.parentNode;
  let row = Math.floor(currTile.id / 8);
  let col = currTile.id % 8;
  var direction;
  if (BlackTurn) direction = -1;
  else direction = 1;
  markTileWithoutCapture(row, col, direction);
  markTileWithCapture(BlackTurn ? "white" : "black", row, col, direction);
}
function markValidTiles(curr_piece_tomove) {
  if (curr_piece_tomove.classList.contains("king"))
    markTilesForKing(curr_piece_tomove);
  MarkTilesForRegularPiece(curr_piece_tomove);
  if (curr_marked_tiles.length > 0) selection_mode = true;
  else {
    alert("This piece has no legal move");
    return;
  }
  curr_piece_to_move = curr_piece_tomove;
}
function MarkTile(index) {
  curr_marked_tiles.push(board.children[index]);
  board.children[index].classList += " marked";
}
function markTileWithoutCapture(row, col, direction) {
  if ((direction == 1 && row == 7) || (direction == -1 && row == 0)) return;
  if (
    col != 0 &&
    board.children[(row + direction * 1) * 8 + (col - 1)].children.length == 0
  ) {
    MarkTile((row + direction * 1) * 8 + (col - 1));
  }
  if (
    col != 7 &&
    board.children[(row + direction * 1) * 8 + (col + 1)].children.length == 0
  ) {
    MarkTile((row + direction * 1) * 8 + (col + 1));
  }
}
function IsAbleToCaptureUpRight(opponent, row, col) {
  if (row < 2 || col > 5) return false;
  if (
    board.children[(row - 2) * 8 + (col + 2)].children.length == 0 &&
    board.children[(row - 1) * 8 + (col + 1)].children.length > 0 &&
    board.children[(row - 1) * 8 + (col + 1)].children[0].classList.contains(
      "bg-" + opponent
    )
  ) {
    return true;
  }
}
function IsAbleToCaptureUpLeft(opponent, row, col) {
  if (row < 2 || col < 2) return false;
  if (
    board.children[(row - 2) * 8 + (col - 2)].children.length == 0 &&
    board.children[(row - 1) * 8 + (col - 1)].children.length > 0 &&
    board.children[(row - 1) * 8 + (col - 1)].children[0].classList.contains(
      "bg-" + opponent
    )
  ) {
    return true;
  }
}
function IsAbleToCaptureDownRight(opponent, row, col) {
  if (col > 5 || row > 5) return false;
  if (
    board.children[(row + 2) * 8 + (col + 2)].children.length == 0 &&
    board.children[(row + 1) * 8 + (col + 1)].children.length > 0 &&
    board.children[(row + 1) * 8 + (col + 1)].children[0].classList.contains(
      "bg-" + opponent
    )
  ) {
    return true;
  }
}
function IsAbleToCaptureDownLeft(opponent, row, col) {
  if (col < 2 || row > 5) return false;
  if (
    board.children[(row + 2) * 8 + (col - 2)].children.length == 0 &&
    board.children[(row + 1) * 8 + (col - 1)].children.length > 0 &&
    board.children[(row + 1) * 8 + (col - 1)].children[0].classList.contains(
      "bg-" + opponent
    )
  ) {
    return true;
  }
}
function isAbleToMoveUpRight(row, col) {
  if (row <= 0) return false;
  if (col < 7 && board.children[(row - 1) * 8 + (col + 1)].children.length == 0)
    return true;
}
function isAbleToMoveUpLeft(row, col) {
  if (row <= 0) return false;
  if (col > 0 && board.children[(row - 1) * 8 + (col - 1)].children.length == 0)
    return true;
}
function isAbleToMoveDownRight(row, col) {
  if (row >= 7) return false;
  if (col < 7 && board.children[(row + 1) * 8 + (col + 1)].children.length == 0)
    return true;
}
function isAbleToMoveDownLeft(row, col) {
  if (row >= 7) return false;
  if (col > 0 && board.children[(row + 1) * 8 + (col - 1)].children.length == 0)
    return true;
}
function IsKingAbleToCaptureUpLeft(row, col) {
  if (row <= 0 || col <= 0) return -1;
  while (
    row > 0 &&
    col > 0 &&
    board.children[row * 8 + col].children.length == 0
  ) {
    row--;
    col--;
  }
  row++;
  col++;
  if (row < 2 || col < 2) return -1;
  if (IsAbleToCaptureUpLeft(BlackTurn ? "white" : "black", row, col))
    return (row - 2) * 8 + col - 2;
  return -1;
}
function IsKingAbleToCaptureUpRight(row, col) {
  if (row <= 0 || col >= 7) return -1;
  while (
    row > 0 &&
    col < 7 &&
    board.children[row * 8 + col].children.length == 0
  ) {
    row--;
    col++;
  }
  row++;
  col--;
  if (row < 2 || col > 5) return -1;
  if (IsAbleToCaptureUpRight(BlackTurn ? "white" : "black", row, col))
    return (row - 2) * 8 + col + 2;
  return -1;
}
function IsKingAbleToCaptureDownLeft(row, col) {
  if (row >= 7 || col <= 0) return -1;
  while (
    row < 7 &&
    col > 0 &&
    board.children[row * 8 + col].children.length == 0
  ) {
    row++;
    col--;
  }
  row--;
  col++;
  if (row > 5 || col < 2) return -1;
  if (IsAbleToCaptureDownLeft(BlackTurn ? "white" : "black", row, col))
    return (row + 2) * 8 + col - 2;
  return -1;
}
function IsKingAbleToCaptureDownRight(row, col) {
  if (row >= 7 || col >= 7) return -1;
  while (
    row < 7 &&
    col < 7 &&
    board.children[row * 8 + col].children.length == 0
  ) {
    row++;
    col++;
  }
  row--;
  col--;
  if (row > 5 || col > 5) return -1;
  if (IsAbleToCaptureDownRight(BlackTurn ? "white" : "black", row, col))
    return (row + 2) * 8 + col + 2;
  return -1;
}
function checkIfSelectionIsValid(tile) {
  if (
    tile.children.length > 0 &&
    curr_piece_to_move.id == tile.children[0].id
  ) {
    DeselectTiles();
    return;
  }
  if (curr_marked_tiles.includes(tile)) {
    movePiece(tile);
  } else {
    alert("Please chose one of the marked tiles");
  }
}
function CheckValidInitialSelection(tile) {
  if (tile.children.length == 0) return false;
  let IsCurrentPlayerPiece = true;
  //check if the piece in the tile is player piece
  if (
    BlackTurn
      ? tile.children[0].classList.contains("bg-black")
        ? ""
        : (IsCurrentPlayerPiece = false)
      : tile.children[0].classList.contains("bg-white")
      ? ""
      : (IsCurrentPlayerPiece = false)
  );
  if (!IsCurrentPlayerPiece) {
    alert("Please chose a" + (BlackTurn ? " black " : " white ") + "piece");
    return false;
  }
  return true;
}
function CheckIfCouldCaptureAndDidnt(targetTile) {
  //prettier-ignore
  {
    let idx = curr_threatned_pieces.findIndex((x) => x.targets.includes(targetTile));
  if (idx != -1 && curr_threatned_pieces[idx].targets[curr_threatned_pieces[idx].targets.length - 1] != targetTile) {
    alert("You had the chance to capture a piece and you did'nt . Your piece is burnet!");
    if (curr_piece_to_move.classList.contains("bg-white")) whitePieces--;
    else blackPieces--;
    updateScoreBoard();
    let parent = curr_piece_to_move.parentNode;
    parent.removeChild(curr_piece_to_move);
    DeselectTiles();
    return true;}
  if (!(idx != -1 && curr_threatned_pieces[idx].targets.length > 1 && curr_threatned_pieces[idx].targets[ curr_threatned_pieces[idx].targets.length - 1] == targetTile)) {
    let ThreathingPieceLocation = GetCurrentThreatningPieceLocation(
      BlackTurn ? "black" : "white",
      targetTile
    );
    if (ThreathingPieceLocation != -1) {
      alert("You had the chance to capture a piece and you did'nt . Your piece is burnet!");
      let ThreathingPiece = board.children[ThreathingPieceLocation].children[0];
      if (ThreathingPiece.classList.contains("bg-white")) whitePieces--;
      else blackPieces--;
      updateScoreBoard();
      board.children[ThreathingPieceLocation].removeChild(ThreathingPiece);
      DeselectTiles();
      return true;
    }
  }
  return false;
  }
}
function checkForLegalMove() {
  let player = BlackTurn ? "black" : "white";
  let opponent = BlackTurn ? "white" : "black";
  let HasLegalMove = false;
  for (let i = 0; i < 64; i++) {
    if (
      board.children[i].children.length > 0 &&
      board.children[i].children[0].classList.contains("bg-" + player)
    ) {
      let row = Math.floor(i / 8);
      let col = i % 8;
      if (
        player == "black" ||
        board.children[i].children[0].classList.contains("king")
      )
        if (
          IsAbleToCaptureUpLeft(opponent, row, col) ||
          isAbleToMoveUpLeft(row, col) ||
          isAbleToMoveUpRight(row, col) ||
          IsAbleToCaptureUpRight(opponent, row, col)
        ) {
          HasLegalMove = true;
        }
      if (
        (!HasLegalMove && player == "white") ||
        board.children[i].children[0].classList.contains("king")
      )
        if (
          IsAbleToCaptureDownLeft(opponent, row, col) ||
          isAbleToMoveDownLeft(row, col) ||
          IsAbleToCaptureDownRight(opponent, row, col) ||
          isAbleToMoveDownRight(row, col)
        ) {
          HasLegalMove = true;
        }
      if (HasLegalMove) break;
    }
  }
  if (!HasLegalMove) {
    showModal(
      "noMovesModal",
      "No legal move for " + player + " . " + opponent + " won"
    );
    resetGame();
  }
}
function markTilesForKing(curr_piece_to_move) {
  let opponent = BlackTurn ? "white" : "black";
  const currTile = curr_piece_to_move.parentNode;
  let row = Math.floor(currTile.id / 8);
  let col = currTile.id % 8;
  markTilesForKingDownLeft(opponent, row, col);
  markTilesForKingDownRight(opponent, row, col);
  markTilesForKingUpLeft(opponent, row, col);
  markTilesForKingUpRight(opponent, row, col);
}
function markTilesForKingUpRight(opponent, row, col) {
  i = 0;
  while (isAbleToMoveUpRight(row - i, col + i)) {
    i++;
    MarkTile((row - i) * 8 + (col + i));
  }
  if (IsAbleToCaptureUpRight(opponent, row - i, col + i)) {
    MarkTile((row - i - 2) * 8 + col + i + 2);
    curr_threatned_pieces.push({
      targets: [board.children[(row - 2 - i) * 8 + (col + 2 + i)]],
      pieces: [board.children[(row - 1 - i) * 8 + (col + 1 + i)].children[0]],
    });
    IsAbleToDoubleCapture(
      opponent,
      row - i - 2,
      col + i + 2,
      (row - i - 2) * 8 + col + i + 2
    );
  }
}
function markTilesForKingUpLeft(opponent, row, col) {
  i = 0;
  while (isAbleToMoveUpLeft(row - i, col - i)) {
    i++;
    MarkTile((row - i) * 8 + (col - i));
  }
  if (IsAbleToCaptureUpLeft(opponent, row - i, col - i)) {
    MarkTile((row - i - 2) * 8 + col - i - 2);
    curr_threatned_pieces.push({
      targets: [board.children[(row - 2 - i) * 8 + (col - 2 - i)]],
      pieces: [board.children[(row - 1 - i) * 8 + (col - 1 - i)].children[0]],
    });
    IsAbleToDoubleCapture(
      opponent,
      row - i - 2,
      col - i - 2,
      (row - i - 2) * 8 + col - i - 2
    );
  }
}
function markTilesForKingDownRight(opponent, row, col) {
  i = 0;
  while (isAbleToMoveDownRight(row + i, col + i)) {
    i++;
    MarkTile((row + i) * 8 + (col + i));
  }
  if (IsAbleToCaptureDownRight(opponent, row + i, col + i)) {
    MarkTile((row + i + 2) * 8 + col + i + 2);
    curr_threatned_pieces.push({
      targets: [board.children[(row + i + 2) * 8 + (col + i + 2)]],
      pieces: [board.children[(row + i + 1) * 8 + (col + i + 1)].children[0]],
    });
    IsAbleToDoubleCapture(
      opponent,
      row + i + 2,
      col + i + 2,
      (row + i + 2) * 8 + col + i + 2
    );
  }
}
function markTilesForKingDownLeft(opponent, row, col) {
  let i = 0;
  while (isAbleToMoveDownLeft(row + i, col - i)) {
    i++;
    MarkTile((row + i) * 8 + (col - i));
  }
  if (IsAbleToCaptureDownLeft(opponent, row + i, col - i)) {
    MarkTile((row + i + 2) * 8 + col - i - 2);
    curr_threatned_pieces.push({
      targets: [board.children[(row + 2 + i) * 8 + (col - 2 - i)]],
      pieces: [board.children[(row + 1 + i) * 8 + (col - 1 - i)].children[0]],
    });
    IsAbleToDoubleCapture(
      opponent,
      row + i + 2,
      col - i - 2,
      (row + i + 2) * 8 + col - i - 2
    );
  }
}
function markTileWithCapture(opponent, row, col, direction) {
  if ((direction == 1 && row > 5) || (direction == -1 && row < 2)) return;
  //check if the piece had a capturing chance, if the player chose not to capture, alert him and remove the piece from the board
  //prettier-ignore
  {
    if (col > 1 && board.children[(row + direction * 2) * 8 + (col - 2)].children.length == 0 &&
      board.children[(row + direction * 1) * 8 + (col - 1)].children.length >0 &&
      board.children[(row + direction * 1) * 8 + (col - 1)].children[0].classList.contains("bg-" + opponent)) {
      MarkTile((row + direction * 2) * 8 + (col - 2));
      curr_threatned_pieces.push({
        targets: [board.children[(row + direction * 2) * 8 + (col - 2)]],
        pieces: [board.children[(row + direction * 1) * 8 + (col - 1)].children[0],],});
      IsAbleToDoubleCapture(opponent,row + direction * 2,col - 2,board.children[(row + direction * 2) * 8 + (col - 2)].id);}
    if (col < 6 && board.children[(row + direction * 2) * 8 + (col + 2)].children.length == 0 && board.children[(row + direction * 1) * 8 + (col + 1)].children.length >0 &&
      board.children[(row + direction * 1) * 8 + (col + 1)].children[0].classList.contains("bg-" + opponent)) {
      MarkTile((row + direction * 2) * 8 + (col + 2));
      curr_threatned_pieces.push({targets: [board.children[(row + direction * 2) * 8 + (col + 2)]],pieces: [board.children[(row + direction * 1) * 8 + (col + 1)].children[0],],
      });
      IsAbleToDoubleCapture(opponent,row + direction * 2,col + 2,board.children[(row + direction * 2) * 8 + (col + 2)].id
      );
    }
  }
}
function ifCanDoubleCaptureUpRight(opponent, row, col) {
  if (IsAbleToCaptureUpRight(opponent, row, col)) {
    if (
      !curr_marked_tiles.includes(board.children[(row - 2) * 8 + (col + 2)])
    ) {
      MarkTile((row - 2) * 8 + (col + 2));
      let idx = curr_threatned_pieces.findIndex((x) =>
        x.targets.map((x) => x.id).includes(GlobalLastTarget.toString())
      );
      if (idx == -1) {
        idx = 0;
        curr_threatned_pieces[idx] = { targets: [], pieces: [] };
      }
      GlobalLastTarget = board.children[(row - 2) * 8 + (col + 2)].id;
      curr_threatned_pieces[idx].targets.push(
        board.children[(row - 2) * 8 + (col + 2)]
      );
      curr_threatned_pieces[idx].pieces.push(
        board.children[(row - 1) * 8 + (col + 1)].children[0]
      );
      return true;
    }
  }
  return false;
}
function ifCanDoubleCaptureUpLeft(opponent, row, col) {
  if (IsAbleToCaptureUpLeft(opponent, row, col)) {
    if (
      !curr_marked_tiles.includes(board.children[(row - 2) * 8 + (col - 2)])
    ) {
      MarkTile((row - 2) * 8 + (col - 2));
      let idx = curr_threatned_pieces.findIndex((x) =>
        x.targets.map((x) => x.id).includes(GlobalLastTarget.toString())
      );
      if (idx == -1) {
        idx = 0;
        curr_threatned_pieces[idx] = { targets: [], pieces: [] };
      }
      GlobalLastTarget = board.children[(row - 2) * 8 + (col - 2)].id;
      curr_threatned_pieces[idx].targets.push(
        board.children[(row - 2) * 8 + (col - 2)]
      );
      curr_threatned_pieces[idx].pieces.push(
        board.children[(row - 1) * 8 + (col - 1)].children[0]
      );
      return true;
    }
  }
  return false;
}
function ifCanDoubleCaptureDownRight(opponent, row, col) {
  if (IsAbleToCaptureDownRight(opponent, row, col)) {
    if (
      !curr_marked_tiles.includes(board.children[(row + 2) * 8 + (col + 2)])
    ) {
      MarkTile((row + 2) * 8 + (col + 2));
      let idx = curr_threatned_pieces.findIndex((x) =>
        x.targets.map((x) => x.id).includes(GlobalLastTarget.toString())
      );
      if (idx == -1) {
        GlobalLastTarget = board.children[(row + 2) * 8 + (col + 2)].id;
        idx = 0;
        curr_threatned_pieces[idx] = { targets: [], pieces: [] };
      }
      curr_threatned_pieces[idx].targets.push(
        board.children[(row + 2) * 8 + (col + 2)]
      );
      curr_threatned_pieces[idx].pieces.push(
        board.children[(row + 1) * 8 + (col + 1)].children[0]
      );
      return true;
    }
  }
  return false;
}
function ifCanDoubleCaptureDownLeft(opponent, row, col) {
  if (IsAbleToCaptureDownLeft(opponent, row, col)) {
    if (
      !curr_marked_tiles.includes(board.children[(row + 2) * 8 + (col - 2)])
    ) {
      MarkTile((row + 2) * 8 + (col - 2));
      let idx = curr_threatned_pieces.findIndex((x) =>
        x.targets.map((x) => x.id).includes(GlobalLastTarget.toString())
      );
      if (idx == -1) {
        GlobalLastTarget = board.children[(row + 2) * 8 + (col - 2)].id;
        idx = 0;
        curr_threatned_pieces[idx] = { targets: [], pieces: [] };
      }
      curr_threatned_pieces[idx].targets.push(
        board.children[(row + 2) * 8 + (col - 2)]
      );
      curr_threatned_pieces[idx].pieces.push(
        board.children[(row + 1) * 8 + (col - 1)].children[0]
      );
      return true;
    }
  }
  return false;
}
function IsAbleToDoubleCapture(opponent, row, col, LastTarget) {
  GlobalLastTarget = LastTarget;
  let canCapture = true;
  while (canCapture) {
    canCapture = false;
    if (ifCanDoubleCaptureUpRight(opponent, row, col)) {
      row -= 2;
      col += 2;
      canCapture = true;
      continue;
    }
    if (ifCanDoubleCaptureUpLeft(opponent, row, col)) {
      row -= 2;
      col -= 2;
      canCapture = true;
      continue;
    }
    if (ifCanDoubleCaptureDownRight(opponent, row, col)) {
      row += 2;
      col += 2;
      canCapture = true;
      continue;
    }
    if (ifCanDoubleCaptureDownLeft(opponent, row, col)) {
      row += 2;
      col -= 2;
      canCapture = true;
      continue;
    }
  }
  return canCapture;
}
function GetCurrentThreatningPieceLocation(player, targetTile) {
  let opponent = player == "white" ? "black" : "white";
  let ThreatningPiecesLocations = [];
  //prettier-ignore
  {
for (let i = 0; i < 64; i++) {
    if (board.children[i].children.length > 0 && board.children[i].children[0].classList.contains("bg-" + player)) {
      let row = Math.floor(board.children[i].id / 8);
      let col = board.children[i].id % 8;
      if (board.children[i].children[0].classList.contains("king")) {
        let idx = IsKingAbleToCaptureUpLeft(row - 1, col - 1);
        if (idx == -1) idx = IsKingAbleToCaptureUpRight(row - 1, col + 1);
        if (idx == -1) idx = IsKingAbleToCaptureDownLeft(row + 1, col - 1);
        if (idx == -1) idx = IsKingAbleToCaptureDownRight(row + 1, col + 1);
        if (idx != -1) {
          if ( targetTile.id == idx && board.children[i].children[0].id === curr_piece_to_move.id &&
            !IsAbleToDoubleCapture(opponent,Math.floor(idx / 8),idx % 8,(Math.floor(idx / 8) * idx) % 8))
            return -1;
          ThreatningPiecesLocations.push(i);
        }
      }
      if (player == "white" && IsAbleToCaptureDownLeft(opponent, row, col)) {
        if (targetTile.id == board.children[(row + 2) * 8 + (col - 2)].id && board.children[i].children[0].id === curr_piece_to_move.id &&
         !IsAbleToDoubleCapture(opponent, row + 2, col - 2, targetTile)
        )
          return -1;
        ThreatningPiecesLocations.push(i);
      }
      if (player == "white" && IsAbleToCaptureDownRight(opponent, row, col)) {
        if (targetTile.id == board.children[(row + 2) * 8 + (col + 2)].id && board.children[i].children[0].id === curr_piece_to_move.id &&
          !IsAbleToDoubleCapture(opponent, row + 2, col + 2, targetTile)
        )
          return -1;
        ThreatningPiecesLocations.push(i);
      }
      if (player == "black" && IsAbleToCaptureUpLeft(opponent, row, col)) {
        if ( targetTile.id == board.children[(row - 2) * 8 + (col - 2)].id && board.children[i].children[0].id === curr_piece_to_move.id &&
          !IsAbleToDoubleCapture(opponent, row - 2, col - 2, targetTile)
        )
          return -1;
        ThreatningPiecesLocations.push(i);
      }
      if (player == "black" && IsAbleToCaptureUpRight(opponent, row, col)) {
        if (targetTile.id == board.children[(row - 2) * 8 + (col + 2)].id &&board.children[i].children[0].id === curr_piece_to_move.id &&
          !IsAbleToDoubleCapture(opponent, row - 2, col + 2, targetTile)
        )
          return -1;
        ThreatningPiecesLocations.push(i);
      }
    }
  }
  if (ThreatningPiecesLocations.length > 0) return ThreatningPiecesLocations[0];
  else return -1;
  }
}
