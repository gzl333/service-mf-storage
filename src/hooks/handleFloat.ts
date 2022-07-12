export const FloatSub = (num1: number, num2: number) => {
  let r1
  let r2
  try {
    r1 = num1.toString().split('.')[1].length
  } catch (e) {
    r1 = 0
  }
  try {
    r2 = num2.toString().split('.')[1].length
  } catch (e) {
    r2 = 0
  }
  const m = Math.pow(10, Math.max(r1, r2))
  // 动态控制精度长度
  // n = (r1 = r2) ? r1 : r2;
  return (num1 * m - num2 * m) / m
}
