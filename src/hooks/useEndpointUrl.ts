export const conversionBase = (localId: string, str: string, num: number) => {
  let index = localId.indexOf(str)
  for (let i = 0; i < num; i++) {
    index = localId.indexOf(str, index + 1)
  }
  return localId.slice(0, index)
}
