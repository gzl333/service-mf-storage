// 把文件大小转换为适当的显示形式, size初始单位为byte， 最大值为5TiB
export default function (unit: 1000 | 1024, fixed = 2) {
  return (size: number) => {
    if (size / unit ** 4 >= 1) {
      return (size / unit ** 4).toFixed(fixed) + (unit === 1000 ? ' TB' : ' TB') // '1024 -> TiB'
    } else if (size / unit ** 3 >= 1) {
      return (size / unit ** 3).toFixed(fixed) + (unit === 1000 ? ' GB' : ' GB')
    } else if (size / unit ** 2 >= 1) {
      return (size / unit ** 2).toFixed(fixed) + (unit === 1000 ? ' MB' : ' MB')
    } else if (size / unit >= 1) {
      return (size / unit).toFixed(fixed) + (unit === 1000 ? ' KB' : ' KB')
    } else {
      return size.toFixed(fixed) + ' Byte'
    }
  }
}
