export const isEmpty = obj => ((obj==null) || (Object.getOwnPropertyNames(obj).length === 0))
export const isEmptyObj = obj => ((isEmpty(obj)) || (Object.keys(obj).length === 0))
export const rangeArray = (beg, end) => Array.from(Array(end+1-beg),(val,index)=>index+beg)
export const arrayRemove = (array, element) => array.filter(el => el !== element)
export const arrayInsert = (array, i, ...rest) => array.slice(0,i).concat(rest,array.slice(i))

export const arrayToObject = (array, keyField) =>
  array.reduce((obj, item) => {
    obj[item[keyField]] = item
    return obj
  }, {})

export const getLocFilePrefix = () => {
  let retStr = ""
  return retStr
}

export const jsonCopy = (obj) => JSON.parse(JSON.stringify(obj))
export const pad = (n) => ((n < 10) && (n >=0)) ? (`0${  n}`) : n
export const removeAllDigits = str => str.replace(/\d/g, "")
export const keepAllDigits = str => str.replace(/\D/g, "")
export const uniqueArray = array => [ ...new Set(array)]
export const nbrOfKeysInObj = obj => ((obj==null) ? 0 : Object.getOwnPropertyNames(obj).length )
export const jsonEqual = (a,b) => JSON.stringify(a) === JSON.stringify(b)

export const nullToEmptyStr = str => (str==null) ? "": str

export const removeEqualEndOfStr = (a, b) => {
  let resStr = ""
  let diffFound = false
  for (let i = a.length-1; i >= 0; i--) {
    if (diffFound || (a[i]!==b[i])){
      diffFound = true
      resStr = a[i] + resStr
    }
  }
  return resStr
}

/* Example mapped function on object
const oMap = (o, f) => Object.assign(...Object.keys(o).map(k => ({ [k]: f(o[k]) })))
// For instance - square of each value:
let mappedObj = oMap(myObj, (x) => x * x)
*/
