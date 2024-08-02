/**
 * Базовый класс, от которого наследуются классы персонажей
 * @property level - уровень персонажа, от 1 до 4
 * @property attack - показатель атаки
 * @property defence - показатель защиты
 * @property health - здоровье персонажа
 * @property type - строка с одним из допустимых значений:
 * swordsman
 * bowman
 * magician
 * daemon
 * undead
 * vampire
 */
export default class Character {
  constructor(level, type = 'generic') {
    this.level = level;
    this.attack = 0;
    this.defence = 0;
    this.health = 50;
    this.type = type;

    // TODO: выбросите исключение, если кто-то использует "new Character()"
    if (new.target === Character) {
      throw new Error("You can't create instances of a class Character");
    } 
    
    this.setMotionParams(type);
  }

  setMotionParams(type) {
    switch(type) {
      case ['swordsman', 'undead'].find(charType => charType === type):
        this.walkingDistance = 4;
        this.attackDistance = 1;
        break;

      case ['bowman', 'vampire'].find(charType => charType === type):
        this.walkingDistance = 2;
        this.attackDistance = 2;
        break;

      case ['magician', 'daemon'].find(charType => charType === type):
        this.walkingDistance = 1;
        this.attackDistance = 4;
        break;
    
      default:
        break;
    }
  }

  setDamage(damage) {
    this.health -= this.getDamage(damage);
  }

  getDamage(damage) {
    return Math.max(damage - this.defence, damage * 1);
  }
}
