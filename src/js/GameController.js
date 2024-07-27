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
    this.charactersOnField = [];

    // TODO: add event listeners to gamePlay events
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));

    // TODO: load saved stated from stateService
    this.gamePlay.drawUi(themes.prairie);
    const heroesTeam = generateTeam([Bowman, Swordsman, Magician], 3, 3);
    const enemiesTeam = generateTeam([Daemon, Undead, Vampire], 3, 3);
    const startHeroesPositionPointExludes = [];
    const startEnemiesPositionPointExludes = [];
    
    heroesTeam.characters.forEach( character => {
      const position = calcPositionToField(this.gamePlay.boardSize, startHeroesPositionPointExludes, 'left');
      startHeroesPositionPointExludes.push(position);
      this.charactersOnField.push(new PositionedCharacter(character.value, position));
    });

    enemiesTeam.characters.forEach( character => {
      const position = calcPositionToField(this.gamePlay.boardSize, startEnemiesPositionPointExludes, 'right');
      startEnemiesPositionPointExludes.push(position);
      this.charactersOnField.push(new PositionedCharacter(character.value, position));
    });

    this.gamePlay.redrawPositions(this.charactersOnField);
  }

  onCellClick(index) {
    // TODO: react to click
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
    const findChar = this.charactersOnField.find(char => char.position === index);

    if(findChar) {
      const characterRenderInfo = (strings, ...values) =>
        strings.reduce((acc, str, i) => {
          return `${acc}${str}${values[i] || ''}`;
        }, '');
      const { level, attack, defence, health } = findChar.character;

      this.gamePlay.showCellTooltip(
        characterRenderInfo`🎖${level} ⚔${attack} 🛡${defence} ❤${health}`, 
        index
      );
    }
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
  }
}
