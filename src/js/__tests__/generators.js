import { characterGenerator, generateTeam } from '../generators';
import Bowman from '../characters/Bowman';
import Swordsman from '../characters/Swordsman';
import Magician from '../characters/Magician';

test('characterGenerator produces infinite new characters from allowedTypes', () => {
  const allowedTypes = [Bowman, Swordsman, Magician];
  const maxLevel = 4;
  const generator = characterGenerator(allowedTypes, maxLevel);

  const characters = new Set();
  const iterations = 1000;

  for (let i = 0; i < iterations; i++) {
    const character = generator.next().value;
    expect(allowedTypes).toContain(character.constructor);
    expect(character.level).toBeGreaterThanOrEqual(1);
    expect(character.level).toBeLessThanOrEqual(maxLevel);
    characters.add(character);
  }

  expect(characters.size).toEqual(iterations);
});

test('generateTeam creates correct number of characters within level range', () => {
    const allowedTypes = [Bowman, Swordsman, Magician];
    const maxLevel = 4;
    const characterCount = 5;
  
    const team = generateTeam(allowedTypes, maxLevel, characterCount);
    const maxLevelTeam = Math.max(...team.characters.map(char => char.value.level));
  
    expect(team.characters.length).toEqual(characterCount);
    expect(maxLevelTeam <= maxLevel).toEqual(true);
});