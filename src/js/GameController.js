import themes from './themes';
import { calcPositionToField, checkMotionRadius, getMotionRadius } from './utils';
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
    this.charactersOnField = [];
    this.selectedCharacterIndex = null;
    this.chapterIsWalks = false;
    this.chapterIsAttacks = false;
  }

  init() {
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
    const findChar = this.findCharacter(index);

    this.setEnemyAction();

    // TODO: react to click
    if(this.selectedCharacterIndex !== null) {
      this.setActionCursor(index);
      return;
    }

    //if the hero does not choose and click on empty cell
    if(!findChar) {
      this.gamePlay.constructor.showError('please, select character cell');
      return;
    }

    //if the hero does not choose and click on hero cell
    if(this.characterIs(index)) {
      this.charactersOnField.forEach(char => this.gamePlay.deselectCell(char.position));
      this.gamePlay.selectCell(index);
      this.selectedCharacterIndex = index;
      return;
    }

    //if the hero does not choose and click on enemy cell
    if(this.characterIs(index, [Daemon, Undead, Vampire])) {
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
    this.deselectCells();
  }

  setActionCursor(indexCell) {
    const hero = this.findCharacter(this.selectedCharacterIndex);
    const checkWalkRadius = checkMotionRadius(indexCell, hero.position, hero.character.walkingDistance, this.gamePlay.boardSize);
    const checkAttackRadius = checkMotionRadius(indexCell, hero.position, hero.character.attackDistance, this.gamePlay.boardSize);
    const enemyIndexInTeam = this.charactersOnField.indexOf(this.findCharacter(indexCell));
    const enemy = this.charactersOnField[enemyIndexInTeam];

    //check if choise chapter
    if(this.characterIs(indexCell)) {
      this.charactersOnField.forEach(char => this.gamePlay.deselectCell(char.position));
      this.gamePlay.selectCell(indexCell);
      this.selectedCharacterIndex = indexCell;
      return;
    }

    //check if cursor indecate of walking
    if(checkWalkRadius && enemyIndexInTeam === -1 && !this.chapterIsWalks) {
      this.charactersOnField.forEach(char => this.gamePlay.deselectCell(char.position));
      const currentChar = this.charactersOnField[this.charactersOnField.indexOf(hero)];

      this.selectedCharacterIndex = indexCell;
      currentChar.position = indexCell;
      this.resetChaptersView(indexCell);
      this.resetChapterMove();
      return;
    }  

    //check if cursor indecate of attack
    if(checkAttackRadius && !this.chapterIsAttacks) {
      this.chapterIsAttacks = true;

      if(!enemy) {
        return;
      }
      
      const damage = enemy.character.getDamage(hero.character.attack);

      this.gamePlay.showDamage(enemy.position, damage).then(() => {
        if(damage >= enemy.character.health) {
          this.charactersOnField.splice(enemyIndexInTeam, 1);
        } else {
          enemy.character.setDamage(damage);
        }
        
        this.resetChaptersView(indexCell);
        this.resetChapterMove();
        return;
      });
    }
  }

  setViewCursor(indexCell) {
    if(this.selectedCharacterIndex !== null) {
      const hero = this.findCharacter(this.selectedCharacterIndex);

      //default cursor on cell
      if(this.characterIs(indexCell)) {
        this.gamePlay.setCursor('pointer');
        return;
      }

      //check if cursor indecate of enemy
      const checkAttackDistance = checkMotionRadius(indexCell, hero.position, hero.character.attackDistance, this.gamePlay.boardSize); 
      if(checkAttackDistance && this.characterIs(indexCell, [Daemon, Undead, Vampire])) {
        this.gamePlay.setCursor('crosshair');
        this.gamePlay.selectCell(indexCell, 'red');
        return;
      }

      //check if cursor indecate of walking
      const checkWalkRadius = checkMotionRadius(indexCell, hero.position, hero.character.walkingDistance, this.gamePlay.boardSize);    
      if(checkWalkRadius) {
        this.deselectCells();
        this.gamePlay.setCursor('pointer');
        this.gamePlay.selectCell(indexCell, 'green');
        return;
      }

      //reload cursor statment
      this.gamePlay.setCursor('not-allowed');
      return;
    } 
  }

  setEnemyAction() {
    const enemies = this.getChaptersOfType();
    const randomEnemy = enemies[Math.floor(Math.random() * enemies.length)];
    const nearbyHeroesPosition = this.getChaptersOfType([Swordsman, Bowman, Magician]).reduce((prev, curr) => 
      Math.abs(curr.position - randomEnemy.position) < Math.abs(prev - randomEnemy.position) ? curr.position : prev
    , 0);

    console.log(
      getMotionRadius(randomEnemy.position, randomEnemy.character.walkingDistance, this.gamePlay.boardSize),
      randomEnemy.position,
      this.findCharacter(nearbyHeroesPosition),
      this.findCharacter(randomEnemy.position)
    );

    //const checkWalkRadius = checkMotionRadius(indexCell, hero.position, hero.character.walkingDistance, this.gamePlay.boardSize);
    //const checkAttackRadius = checkMotionRadius(indexCell, hero.position, hero.character.attackDistance, this.gamePlay.boardSize);
    //const nearbyHero = this.findCharacter(nearbyHeroesPosition);

    
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
    return this.charactersOnField.find(char => char.position === index) ?? false;
  }

  characterIs(index, charactersType=[Bowman, Swordsman, Magician]) {
    const findChar = this.findCharacter(index);
    return findChar? charactersType.find(char => findChar.character instanceof char) : false;
  }

  getChaptersOfType(types=[Daemon, Undead, Vampire]) {
    return this.charactersOnField.filter(char => types.some(type => char.character instanceof type));
  }

  resetChapterMove(walk=false, attack=false) {
    this.chapterIsWalks = walk;
    this.chapterIsAttacks = attack;
    this.selectedCharacterIndex = null;
  }

  resetChaptersView(indexCell) {
    if(indexCell) {
      this.gamePlay.hideCellTooltip(indexCell);
    }

    this.gamePlay.redrawPositions(this.charactersOnField);
    this.charactersOnField.forEach(char => this.gamePlay.deselectCell(char.position));
    this.gamePlay.setCursor('auto');
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
