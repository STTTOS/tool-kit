export const getRandomInt = (min: number, max: number) => {
  if (min > max) throw new Error('min cannot greater than max')

  const step = max - min + 1
  return Math.floor(Math.random() * step) + min
}
