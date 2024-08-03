export const themes = {
  prairie: 'prairie',
  desert: 'desert',
  arctic: 'arctic',
  mountain: 'mountain',
};

export function *generateTheme() {
  for (let theme in themes) {
    yield themes[theme];
  }
}
