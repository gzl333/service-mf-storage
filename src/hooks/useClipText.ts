// 把过长的文本缩短

export default function (limit: number) {
  return (text: string) => {
    if (text.length <= limit) {
      return text
    } else {
      return text.substr(0, limit) + '...'
    }
  }
}
