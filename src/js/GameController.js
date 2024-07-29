import themes from './themes';
import { calcPositionToField, checkMotionRadius } from './utils';
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
    this.selectedCharacterIndex = null;

    // TODO: add event listeners to gamePlay events
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));

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
    const findChar = this.findCharacter(index);
    const isHero = this.characterIs(index);

    console.log(findChar.character.walkingDistance);

    if(isHero) {
      this.charactersOnField.forEach(char => this.gamePlay.deselectCell(char.position));
      this.gamePlay.selectCell(index);
      this.selectedCharacterIndex = index;
      return;
    }

    if(this.selectedCharacterIndex !== null) {
      return;
    } 
    
    if(!findChar) {
      this.gamePlay.constructor.showError('please, select character cell');
      return;
    }

    if(!isHero) {
      this.gamePlay.constructor.showError('you can\'t select enemies cell');
      return;
    }
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
    this.showCharacter(index);
    this.setViewCursor(index);
    
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
    this.gamePlay.hideCellTooltip(index);
  }

  setViewCursor(indexCell) {
    if(this.selectedCharacterIndex !== null) {
      const hero = this.charactersOnField.find(char => char.position === this.selectedCharacterIndex);

      if(this.characterIs(indexCell)) {
        this.gamePlay.setCursor('pointer');
        return;
      }

      //check if cursor indecate of enemy
      if(this.characterIs(indexCell, [Daemon, Undead, Vampire])) {
        this.gamePlay.setCursor('crosshair');
        return;
      }

      const checkWalkRadius = checkMotionRadius(indexCell, hero.position, hero.character.walkingDistance, this.gamePlay.boardSize);

      if(checkWalkRadius) {
        this.deselectCells();
        this.gamePlay.setCursor('pointer');
        this.gamePlay.selectCell(indexCell, 'green');
        return;
      }

      this.deselectCells();
      this.gamePlay.setCursor('auto');
      return;
    } 
  }

  showCharacter(index) {
    const findChar = this.findCharacter(index);

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

  findCharacter(index) {
    return this.charactersOnField.find(char => char.position === index);
  }

  characterIs(index, charactersType=[Bowman, Swordsman, Magician]) {
    const findChar = this.findCharacter(index);
    return findChar? charactersType.find(char => findChar.character instanceof char) : false;
  }

  deselectCells() {
    for(let i = 0; i <= ((this.gamePlay.boardSize ** 2) - 1); i++) {
      if(i == this.selectedCharacterIndex) {
        continue;   
      }

      this.gamePlay.deselectCell(i);
    }
  }
}
