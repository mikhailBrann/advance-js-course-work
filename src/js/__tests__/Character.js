import Character from "../Character";

test("Character create instances of a class", async () => {
    expect(() => new Character(1)).toThrow("You can't create instances of a class Character");
});

test("Character create child of a class", async () => {
    class Child extends Character {
        constructor(level) {
            super(level);
        }
    }
    expect(new Child(1)).toBeInstanceOf(Child);
});


test("Character check characteristic", async () => {
    class Child extends Character {
        constructor(level) {
            super(level);
        }
    }

    const testObject = {
        level: 1,
        attack: 0,
        defence: 0,
        health: 50,
        type: 'generic'
    };

    expect(new Child(1)).toEqual(testObject);
});