import {themes, generateTheme } from './themes';
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

    this.params = {
      selectedCharacterIndex: null,
      gameStart: false,
      chapterIsWalks: false,
      chapterIsAttacks: false,
      gameScore: 0,
      enemiesCount: 3,
      heroesCount: 3,
      /*
      to track changes in charactersOnField array
      *https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Proxy
      */
      charactersOnField: new Proxy([], {
        set: (target, prop, value) => {
          target[prop] = value;
          if(prop === 'length') {
           this.onCharactersOnFieldChanges(target);
          }
          return true;
        }
      })
    };
  }

  init() {
    //render first screen
    this.gamePlay.drawUi(themes.prairie);

    // TODO: add event listeners to gamePlay events
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));

    this.gamePlay.addNewGameListener(this.setNewGame.bind(this));
    // TODO: load saved stated from stateService

  }

  generateGame(levelTheme, chapters) {
    this.gamePlay.drawUi(levelTheme);
    this.gamePlay.redrawPositions(chapters);
  }

  setNewGame() {
    this.params.gameStart = false;
    this.params.generateLevelTheme = generateTheme();

    this.params.charactersOnField.length = 0;

    const heroesTeam = generateTeam([Bowman, Swordsman, Magician], 3, this.params.enemiesCount);
    const enemiesTeam = generateTeam([Daemon, Undead, Vampire], 3, this.params.heroesCount);
    const startHeroesPositionPointExludes = [];
    const startEnemiesPositionPointExludes = [];
    
    heroesTeam.characters.forEach( character => {
      const position = calcPositionToField(this.gamePlay.boardSize, startHeroesPositionPointExludes, 'left');
      startHeroesPositionPointExludes.push(position);
      this.params.charactersOnField.push(new PositionedCharacter(character.value, position));
    });

    enemiesTeam.characters.forEach(character => {
      const position = calcPositionToField(this.gamePlay.boardSize, startEnemiesPositionPointExludes, 'right');
      startEnemiesPositionPointExludes.push(position);
      this.params.charactersOnField.push(new PositionedCharacter(character.value, position));
    });

    //update start chapters charcteristics
    this.params.charactersOnField.forEach(char => char.character.updateStartCharacteristic());
    //render game
    this.params.generateLevelTheme.next();
    this.generateGame(themes.prairie, this.params.charactersOnField);
    this.params.gameStart = true;
  }

  setGameOver() {
    this.gamePlay.cellClickListeners.length = 0;
    this.gamePlay.cellEnterListeners.length = 0;
    this.gamePlay.cellLeaveListeners.length = 0;
  }

  setNextLevel(heroes) {
    const theme = this.params.generateLevelTheme.next();
    console.log(theme);
    if(theme.value === 'undefined') {
      this.setGameOver();
      this.gamePlay.constructor.showError('you win!!!\nscore: ' + this.params.gameScore);
      return;
    }
    const startEnemiesPositionPointExludes = [];
    const startHeroesPositionPointExludes = [];
    const enemiesTeam = generateTeam([Daemon, Undead, Vampire], 3, this.params.heroesCount);

    //heroes levelUp
    heroes.forEach(hero => {
      hero.character.setLevelUp();
      const position = calcPositionToField(this.gamePlay.boardSize, startHeroesPositionPointExludes, 'left');
      hero.position = position;
    });

    enemiesTeam.characters.forEach(character => {
      const position = calcPositionToField(this.gamePlay.boardSize, startEnemiesPositionPointExludes, 'right');
      startEnemiesPositionPointExludes.push(position);
      this.params.charactersOnField.push(new PositionedCharacter(character.value, position));
    });

    //update start chapters charcteristics
    const enemies = this.getChaptersOfType();
    enemies.forEach(char => char.character.updateStartCharacteristic());

    this.generateGame(theme.value, this.params.charactersOnField);
  }

  //method observe changes in charactersOnField
  onCharactersOnFieldChanges(changes) {
    const heroes = this.getChaptersOfType([Bowman, Swordsman, Magician]);
    const enemies = this.getChaptersOfType();


    if(this.params.gameStart) {
      if(heroes.length === 0) {
        this.gamePlay.constructor.showError('you lost\nplease, try again\nscore: ' + this.params.gameScore);
        this.setGameOver();
        return;
      }
      
      if(enemies.length === 0) {
        this.setNextLevel(heroes);
      }
    }
  }

  onCellClick(index) {
    const findChar = this.findCharacter(index);

    // TODO: react to click
    if(this.params.selectedCharacterIndex !== null) {
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
      this.params.charactersOnField.forEach(char => this.gamePlay.deselectCell(char.position));
      this.gamePlay.selectCell(index);
      this.params.selectedCharacterIndex = index;
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
    const hero = this.findCharacter(this.params.selectedCharacterIndex);
    if(!hero) {
      return;
    }
    
    const checkWalkRadius = checkMotionRadius(indexCell, hero.position, hero.character.walkingDistance, this.gamePlay.boardSize);
    const checkAttackRadius = checkMotionRadius(indexCell, hero.position, hero.character.attackDistance, this.gamePlay.boardSize);
    const enemyIndexInTeam = this.params.charactersOnField.indexOf(this.findCharacter(indexCell));
    const enemy = this.params.charactersOnField[enemyIndexInTeam];

    //check if choise chapter
    if(this.characterIs(indexCell)) {
      this.params.charactersOnField.forEach(char => this.gamePlay.deselectCell(char.position));
      this.gamePlay.selectCell(indexCell);
      this.params.selectedCharacterIndex = indexCell;
      return;
    }

    //check if cursor indecate of walking
    if(checkWalkRadius && enemyIndexInTeam === -1 && !this.params.chapterIsWalks) {
      this.params.charactersOnField.forEach(char => this.gamePlay.deselectCell(char.position));
      const currentChar = this.params.charactersOnField[this.params.charactersOnField.indexOf(hero)];

      this.params.selectedCharacterIndex = indexCell;
      currentChar.position = indexCell;
      this.resetChaptersView(indexCell);
      this.resetChapterMove();
      //enemy action
      this.setEnemyAction();
      return;
    }  

    //check if cursor indecate of attack
    if(checkAttackRadius && !this.params.chapterIsAttacks) {
      this.params.chapterIsAttacks = true;

      if(!enemy) {
        return;
      }
      
      const damage = enemy.character.getDamage(hero.character.attack);

      this.gamePlay.showDamage(enemy.position, damage).then(() => {
        if(damage >= enemy.character.health) {
          this.params.charactersOnField.splice(enemyIndexInTeam, 1);
          this.params.gameScore += 1;
        } else {
          enemy.character.setDamage(damage);
        }
        
        this.resetChaptersView(indexCell);
        this.resetChapterMove();
        //enemy action
        this.setEnemyAction();
        return;
      });
    }
  }

  setViewCursor(indexCell) {
    const hero = this.findCharacter(this.params.selectedCharacterIndex);

    if(this.params.selectedCharacterIndex !== null && hero) {
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
    const heroes = this.getChaptersOfType([Swordsman, Bowman, Magician]);
    const enemiesPos = enemies.map(char => char.position);
    const heroesPos = heroes.map(char => char.position);
    let isАctionComplite = false;

    //if emeny can attack heroes
    enemies.forEach(randomEnemy => {
      const enemyAttackMotions = getMotionRadius(
        randomEnemy.position, 
        randomEnemy.character.attackDistance, 
        this.gamePlay.boardSize
      ).filter(pos => !enemiesPos.includes(pos));
    
      
      enemyAttackMotions.forEach(pos => {
        const findHero = heroes.find(char => char.position === pos);
        
        if(findHero) {
          heroes.forEach(hero => {
            if(hero.position === pos && !isАctionComplite) {
              isАctionComplite = true;

              const damage = hero.character.getDamage(randomEnemy.character.attack);
              const heroIndex = heroes.indexOf(hero);
              
              this.gamePlay.showDamage(hero.position, damage).then(() => {
                if(damage >= hero.character.health) {
                  this.params.charactersOnField.splice(heroIndex, 1);
                } else {
                  hero.character.setDamage(damage);
                }
                
                this.resetChaptersView(randomEnemy.position);
                this.resetChapterMove();
                return;
              });
            }
          });
        }
      });
    });

    //if enemy dont can attack, but can walk
    const randomEnemy = enemies.length ? enemies[Math.floor(Math.random() * enemies.length)] : false;

    if(!isАctionComplite && randomEnemy) {
      const enemyWalksMotions = getMotionRadius(
        randomEnemy.position, 
        randomEnemy.character.walkingDistance, 
        this.gamePlay.boardSize
      ).filter(pos => !enemiesPos.includes(pos) && !heroesPos.includes(pos));
      const chagedPosition = enemyWalksMotions[Math.floor(Math.random() * enemyWalksMotions.length)];
      
      randomEnemy.position = chagedPosition;
      this.resetChaptersView(chagedPosition);
      isАctionComplite = true;
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
        characterRenderInfo`🎖${level} ⚔${attack.toFixed(1)} 🛡${defence.toFixed(1)} ❤${health.toFixed(1)}`, 
        index
      );
    }
  }

  findCharacter(index) {
    return this.params.charactersOnField.find(char => char.position === index) ?? false;
  }

  characterIs(index, charactersType=[Bowman, Swordsman, Magician]) {
    const findChar = this.findCharacter(index);
    return findChar? charactersType.find(char => findChar.character instanceof char) : false;
  }

  getChaptersOfType(types=[Daemon, Undead, Vampire]) {
    return this.params.charactersOnField.filter(char => types.some(type => char.character instanceof type));
  }

  resetChapterMove(walk=false, attack=false) {
    this.params.chapterIsWalks = walk;
    this.params.chapterIsAttacks = attack;
    this.params.selectedCharacterIndex = null;
  }

  resetChaptersView(indexCell) {
    if(indexCell) {
      this.gamePlay.hideCellTooltip(indexCell);
    }

    this.gamePlay.redrawPositions(this.params.charactersOnField);
    this.params.charactersOnField.forEach(char => this.gamePlay.deselectCell(char.position));
    this.gamePlay.setCursor('auto');
  }

  deselectCells() {
    for(let i = 0; i <= ((this.gamePlay.boardSize ** 2) - 1); i++) {
      if(i == this.params.selectedCharacterIndex) {
        continue;   
      }

      this.gamePlay.deselectCell(i);
    }
  }
}
