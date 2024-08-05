import GameStateService from '../GameStateService';


describe('GameStateService', () => {
    describe('load method', () => {
      let gameStateService;
      let storage;
  
      beforeEach(() => {
        storage = {
          data: {},
          setItem(key, value) {
            this.data[key] = value;
          },
          getItem(key) {
            return this.data[key];
          },
          clear() {
            this.data = {};
          }
        };
        gameStateService = new GameStateService(storage);
      });
  
      it('should return parsed state when valid JSON is stored', () => {
        const mockState = { score: 100, level: 2 };
        storage.setItem('state', JSON.stringify(mockState));
  
        const result = gameStateService.load();
  
        expect(result).toEqual(mockState);
      });
  
      it('should throw an error when stored state is invalid JSON', () => {
        storage.setItem('state', 'invalid json');
  
        expect(() => {
          gameStateService.load();
        }).toThrow('Invalid state');
      });
  
      it('should throw an error when no state is stored', () => {
        storage.clear();
  
        expect(() => {
          gameStateService.load();
        }).toThrow('Invalid state');
      });
    });
  });