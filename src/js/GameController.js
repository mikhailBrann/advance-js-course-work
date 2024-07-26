import themes from './themes';
import { calcPositionToField } from './utils';
import { generateTeam } from './generators';
import PositionedCharacter from './PositionedCharacter';
import Bowman from './characters/Bowman';
import Swordsman from './characters/Swordsman';
import Magician from './characters/Magician';
import Daemon from './characters/Daemon';
import Undead from './characters/Undead';
import Vampire from './characters/Vampire';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
  }

  init() {
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
    this.gamePlay.drawUi(themes.prairie);
    const heroesTeam = generateTeam([Bowman, Swordsman, Magician], 3, 3);
    const enemiesTeam = generateTeam([Daemon, Undead, Vampire], 3, 3);
    const startHeroesPositionPointExludes = [];
    const startEnemiesPositionPointExludes = [];
    const startChaptersPositions = [];
    

    heroesTeam.characters.forEach( character => {
      const position = calcPositionToField(this.gamePlay.boardSize, startHeroesPositionPointExludes, 'left');
      startHeroesPositionPointExludes.push(position);
      startChaptersPositions.push(new PositionedCharacter(character.value, position));
    });


    enemiesTeam.characters.forEach( character => {
      const position = calcPositionToField(this.gamePlay.boardSize, startEnemiesPositionPointExludes, 'right');
      startEnemiesPositionPointExludes.push(position);
      startChaptersPositions.push(new PositionedCharacter(character.value, position));
    });

    this.gamePlay.redrawPositions(startChaptersPositions);
  }

  onCellClick(index) {
    // TODO: react to click
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
  }
}
