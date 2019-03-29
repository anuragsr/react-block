export const mock = false
// export const mock = true
export const l = console.log.bind(window.console)
export const rand = length => {
  let chars = 'M30Z1xA0Nu5Pn8Yo2pXqB5Rly9Gz3vWOj1Hm46IeCfgSrTs7Q9aJb8F6DcE7d2twkUhKiL4V'
  , charLength = chars.length
  , randomStr = ''
  for (let i = 0; i < length; i++) {
    randomStr+= chars[Math.floor(Math.random() * (charLength - 1))]
  }
  return randomStr
}
export const withIndex = arr => arr.map((v,i) => ({value: v, index: i}))
export const getFormattedTime = date => {
  let arr = date.split('T')
  return [arr[0], arr[1].split("+")[0]].join(" ")  
}