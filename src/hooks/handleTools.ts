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
export const handleTime = (time: number) => {
  // 文件切片上传 每一片开始的时候 会有一刻速度为0
  if (time > 0) {
    // 超过一小时
    if (time / 60 / 60 > 1) {
      const intHour = parseInt((time / 60 / 60).toString())
      const floatHour = parseFloat((time / 60 / 60).toFixed(1))
      const num = FloatSub(floatHour, intHour)
      const min = num * 60
      if (intHour < 24) {
        return intHour + '小时' + min + '分钟'
      } else {
        return '超过一天'
      }
      //  超过一分钟
    } else if (time / 60 > 1) {
      const intMin = parseInt((time / 60).toString())
      const floatMin = parseFloat((time / 60).toFixed(1))
      const num = FloatSub(floatMin, intMin)
      const sec = num * 60
      return intMin + '分钟' + sec + '秒'
    } else {
      const sec = parseInt(time.toString())
      if (sec > 0) {
        return sec + '秒'
      } else {
        return 0 + '秒'
      }
    }
  } else {
    return '计算中'
  }
}
