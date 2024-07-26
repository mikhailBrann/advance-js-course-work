/**
 * @todo
 * @param index - индекс поля
 * @param boardSize - размер квадратного поля (в длину или ширину)
 * @returns строка - тип ячейки на поле:
 *
 * top-left
 * top-right
 * top
 * bottom-left
 * bottom-right
 * bottom
 * right
 * left
 * center
 *
 * @example
 * ```js
 * calcTileType(0, 8); // 'top-left'
 * calcTileType(1, 8); // 'top'
 * calcTileType(63, 8); // 'bottom-right'
 * calcTileType(7, 7); // 'left'
 * ```
 * */
export function calcTileType(index, boardSize) {
  // TODO: ваш код будет тут
  switch(true) {
    case index === 0:
      return 'top-left';
    case index === boardSize - 1:
      return 'top-right';
    case index === boardSize - 1:
      return 'top-right';
    case index === boardSize * (boardSize - 1):
      return 'bottom-left';
    case index === boardSize * boardSize - 1:
      return 'bottom-right';
    case index < boardSize - 1:
      return 'top';
    case index > boardSize * (boardSize - 1):
      return 'bottom';
    case index % boardSize === 0:
      return 'left';
    case index % boardSize === boardSize - 1:
      return 'right';
    default:
      return 'center';
  }
}

export function calcHealthLevel(health) {
  if (health < 15) {
    return 'critical';
  }

  if (health < 50) {
    return 'normal';
  }

  return 'high';
}

export function calcPositionToField(boardSize, occupiedCells=[], direction='left') {
  const bordCellsCount = (boardSize**2) - 1;
  const availableCells = [];
  const randomNumberInArr = arr => arr[Math.floor(Math.random() * arr.length)];

  if(direction == 'left') {
    const firstLine = 0;
    const secondLine = 1;
    availableCells.push(firstLine, secondLine);

    for(let i = 1; i < bordCellsCount; i++) {
      const firstLineCell =  i;
      const secondLineCell = i + 1;

      if(i % boardSize === 0 && 
          (!availableCells.includes(firstLineCell) || !availableCells.includes(secondLineCell)) 
        ) {
        availableCells.push(firstLineCell, secondLineCell);
      }
    }
  }

  if(direction == 'right') {
    for(let i = 1; i < bordCellsCount; i++) {
      if(i % boardSize === 0) {
        availableCells.push(i - 2, i - 1);
      }
    }

    availableCells.push(bordCellsCount - 1, bordCellsCount);
  }

  return randomNumberInArr(availableCells.filter(cell => !occupiedCells.includes(cell)));
}