import { calcTileType } from '../utils';

test("calcTileType func", async () => {
    expect(calcTileType(0, 8)).toEqual('top-left');
    expect(calcTileType(1, 8)).toEqual('top');
    expect(calcTileType(63, 8)).toEqual('bottom-right');
    expect(calcTileType(7, 7)).toEqual('left');
});