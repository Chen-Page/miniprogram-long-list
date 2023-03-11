// 新的工具类js

/**
 * 判断对象类型
 * @param {*} o 对象
 * @returns {string} 数据格式字符串
 */
let type = (o) => {
  let s = Object.prototype.toString.call(o)
  return s.match(/\[object (.*?)\]/)[1].toLowerCase()
}
// 为type方法添加isString/isArray/isNumber等方法
[
  'Null',
  'Undefined',
  'Object',
  'Array',
  'String',
  'Number',
  'Boolean',
  'Function',
  'RegExp'
].forEach(function (t) {
  type['is' + t] = function (o) {
    return type(o) === t.toLowerCase()
  }
})

/**
 * 判断是否为长度0的字符串和数组，空对象，是否为undefined null，是否为NaN的数字
 * @param {*} obj 对象
 */
let isEmpty = (obj) => {
  if (obj === 'null' || obj === 'undefined') {
    return true
  } else if (type.isString(obj) || type.isArray(obj)) {
    return obj.length === 0
  } else if (type.isNumber(obj)) {
    return isNaN(obj)
  } else if (type.isUndefined(obj) || type.isNull(obj)) {
    return true
  } else if (type.isObject(obj)) {
    return Object.keys(obj).length === 0
  } else {
    return false
  }
}

/**
 * 提示信息
 * @param {*} options 
 */
let alert = (options) => {
  return new Promise((resolve, reject) => {
    if (type.isString(options)) {
      wx.showToast({
        title: options,
        icon: 'none'
      })
      resolve({
        confirm: true,
        cancel: false
      })
    } else {
      let success = options.success || voidFunction
      let fail = options.fail || voidFunction
      options.showCancel = false
      options.success = (res) => {
        success(res)
        resolve(res)
      }
      options.fail = (err) => {
        fail(err)
        reject(err)
      }
      wx.showModal(options)
    }
  })
}

/**
 * 弹窗提示
 * @param {*} options 
 */
let confirm = (options = {}) => {
  let success = options.success || voidFunction
  let fail = options.fail || voidFunction
  return new Promise((resolve, reject) => {
    let obj = {
      showCancel: true,
      success(res) {
        success(res)
        resolve(res)
      },
      fail() {
        fail()
        reject()
      }
    }
    obj = deepMerge(options, obj)
    wx.showModal(obj)
  })
}

/**
 * 深克隆
 * @param {*} target 目标对象
 */
let deepClone = (target) => {
  let result
  if (typeof target === 'object') {
    if (Array.isArray(target)) {
      result = []
      for (let i in target) {
        result.push(deepClone(target[i]))
      }
    } else if (target === null) {
      result = target
    } else if (target.constructor === RegExp) {
      result = target
    } else {
      result = {}
      for (let i in target) {
        result[i] = deepClone(target[i])
      }
    }
  } else {
    result = target
  }
  return result
}

/**
 * 深度合并对象
 * @param {*} obj1 - 对象1
 * @param {*} obj2 - 对象2
 */
let deepMerge = (obj1, obj2) => {
  let result
  if (typeof obj2 != 'object' || obj2 === null) {
    // 字符串 数字 null undefined 函数 symbol 等直接取后值
    result = obj2
  } else if (Array.isArray(obj2)) {
    // 后值为数组
    result = []
    if (!Array.isArray(obj1)) {
      // 前一个数值不是数组，则直接用第二个覆盖
      result = obj2
    } else {
      // 两对象都为数组，则合并
      let maxLength = Math.max(obj1.length, obj2.length)
      let minLength = Math.min(obj1.length, obj2.length)
      for (let i = 0; i < maxLength; i++) {
        if (i < minLength) {
          // 两数组共同部分合并
          result[i] = deepMerge(obj1[i], obj2[i])
        } else {
          // 超出部分使用长度更长的数组的内容
          if (obj1.length > obj2.length) {
            result[i] = obj1[i]
          } else {
            result[i] = obj2[i]
          }
        }
      }
    }
  } else if (obj2 !== null && typeof obj2 == 'object') {
    // 对象
    result = {}
    let key1 = Object.keys(obj1)
    let key2 = Object.keys(obj2)
    let keys = Array.from(new Set([...key1, ...key2]))
    // 由于无法直接判断 obj = {a: undefined} 和 obj = {} 中 a 的存在
    // 所以需要先判断键是否存在，不存在则直接使用另一个对象的值
    for (let i in keys) {
      if (key1.includes(keys[i]) && key2.includes(keys[i])) {
        // 两对象都有的子属性
        result[keys[i]] = deepMerge(obj1[keys[i]], obj2[keys[i]])
      } else {
        if (obj1[keys[i]] === undefined) {
          result[keys[i]] = obj2[keys[i]]
        } else {
          result[keys[i]] = obj1[keys[i]]
        }
      }
    }
  }
  return result
}

/**
 * 数组合并去重
 * @param {Array} arr1 数组1
 * @param {Array} arr2 数组2
 */
let mergeArray = (arr1 = [], arr2 = []) => {
  let filterList = arr2.filter((item2) => {
    let index = arr1.findIndex((item1) => {
      return isSame(item1, item2)
    })
    return index == -1
  })
  return [...arr1, ...filterList]
}

/**
 * 空方法，用于占位
 */
let voidFunction = () => {}

/**
 * 类似es6的padStart方法
 * @param {*} str 字符串
 * @param {*} len 长度
 * @param {*} padStr 填充字符串
 */
let padStart = (str = '', len = 0, padStr = '') => {
  try {
    str = str.toString()
    while (str.length < len) {
      str = padStr + str
    }
    return str.toString()
  } catch (e) {
    return str
  }
}

/**
 * 类似es6的padEnd方法
 * @param {*} str 字符串
 * @param {*} len 长度
 * @param {*} padStr 填充字符串
 */
let padEnd = (str = '', len = 0, padStr = '') => {
  try {
    str = str.toString()
    while (str.length < len) {
      str = str + padStr
    }
    return str.toString()
  } catch (e) {
    return str
  }
}

/**
 * 随机数组序列，洗牌
 * @param {*} arr 数组
 */
let arrayShuffle = (arr = []) => {
  let m = arr.length
  let t
  let i
  while (m) {
    i = Math.floor(Math.random() * m--)
    t = arr[m]
    arr[m] = arr[i]
    arr[i] = t
  }
  return arr
}

/**
 * 等待
 * @param {*} time 时长(毫秒)
 */
let sleep = (time = 0) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, time)
  })
}

/**
 * 判断两对象是否相同
 * @param {*} obj1 对象1
 * @param {*} obj2 对象2
 */
let isSame = (obj1, obj2) => {
  if (obj1 === obj2) {
    return true
  }
  if (type.isNumber(obj1) && type.isNumber(obj2)) {
    if (isNaN(obj1) && isNaN(obj2)) {
      return true
    }
  }
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length != obj2.length) {
      return false
    }
    let result = true
    for (let i = 0; i < obj1.length; i++) {
      if (!isSame(obj1[i], obj2[i])) {
        result = false
        break
      }
    }
    return result
  }
  if (type.isObject(obj1) && type.isObject(obj2)) {
    let key1 = Object.keys(obj1)
    let key2 = Object.keys(obj2)
    if (!isSame(key1, key2)) {
      return false
    }
    let result = true
    for (let i in obj1) {
      if (!isSame(obj1[i], obj2[i])) {
        result = false
        break
      }
    }
    return result
  }
  return false
}

/**
 * 路由query数据转化成object格式
 * @param {string} str 
 * @returns {object} object
 */
let queryToJson = (str = '') => {
  if (isEmpty(str)) {
    return {}
  }
  if (type.isObject(str)) {
    return str
  }
  let obj = {}
  let arr = str.split('&')
  arr.map((item) => {
    if (!isEmpty(item)) {
      let arr1 = item.split('=')
      if (arr1.length > 1) {
        obj[arr1[0]] = arr1[1]
      }
    }
  })
  return obj
}

/**
 * 将json格式数据转换为路由query格式
 * @param {object} obj 
 * @returns {string} string
 */
let jsonToQuery = (obj = {}) => {
  let str = ''
  if (isEmpty(obj)) {
    return str
  }
  if (type.isString(obj)) {
    return obj
  }
  for (let i in obj) {
    str = `${str}&${i}=${obj[i]}`
  }
  str = str.slice(1)
  return str
}

/**
 * 获取tabbar
 */
let getTabbar = () => {
  let pages = getCurrentPages()
  let thisPage = pages[pages.length - 1]
  let tabbar = thisPage.selectComponent('#tabbar')
  if (!tabbar) {
    return {
      setTabBarBadge: voidFunction
    }
  }
  return tabbar
}

/**
 * 格式请求数据
 * @param {*} data 
 */
let formatRequestData = (data = {}) => {
  let str = ``
  for (let i in data) {
    str += `${i}=${encodeURI(data[i])}&`
  }
  str = str.substr(0, str.length - 1)
  return str
}

/**
 * 判断是方法还是对象
 * @param {*} value 对象
 */
function isObject(value) {
  const type = typeof value
  return value != null && (type == 'object' || type == 'function')
}

const root = window;

/**
 * 函数防抖，类似lodash中的同名方法
 * @param {*} func 方法
 * @param {*} wait 等待时间
 * @param {*} options 其他设置
 */
function debounce(func, wait, options) {
  let lastArgs,
    lastThis,
    maxWait,
    result,
    timerId,
    lastCallTime

  let lastInvokeTime = 0
  let leading = false
  let maxing = false
  let trailing = true

  const useRAF = (!wait && wait !== 0 && typeof root.requestAnimationFrame === 'function')

  if (typeof func != 'function') {
    throw new TypeError('Expected a function')
  }
  wait = +wait || 0
  if (isObject(options)) {
    leading = !!options.leading
    maxing = 'maxWait' in options
    maxWait = maxing ? Math.max(+options.maxWait || 0, wait) : maxWait
    trailing = 'trailing' in options ? !!options.trailing : trailing
  }

  function invokeFunc(time) {
    const args = lastArgs
    const thisArg = lastThis

    lastArgs = lastThis = undefined
    lastInvokeTime = time
    result = func.apply(thisArg, args)
    return result
  }

  function startTimer(pendingFunc, wait) {
    if (useRAF) {
      return root.requestAnimationFrame(pendingFunc)
    }
    return setTimeout(pendingFunc, wait)
  }

  function cancelTimer(id) {
    if (useRAF) {
      return root.cancelAnimationFrame(id)
    }
    clearTimeout(id)
  }

  function leadingEdge(time) {
    lastInvokeTime = time
    timerId = startTimer(timerExpired, wait)
    return leading ? invokeFunc(time) : result
  }

  function remainingWait(time) {
    const timeSinceLastCall = time - lastCallTime
    const timeSinceLastInvoke = time - lastInvokeTime
    const timeWaiting = wait - timeSinceLastCall

    return maxing ?
      Math.min(timeWaiting, maxWait - timeSinceLastInvoke) :
      timeWaiting
  }

  function shouldInvoke(time) {
    const timeSinceLastCall = time - lastCallTime
    const timeSinceLastInvoke = time - lastInvokeTime
    return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
      (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait))
  }

  function timerExpired() {
    const time = Date.now()


    if (shouldInvoke(time)) {
      return trailingEdge(time)
    }
    timerId = startTimer(timerExpired, remainingWait(time))
  }

  function trailingEdge(time) {
    timerId = undefined
    if (trailing && lastArgs) {
      return invokeFunc(time)
    }
    lastArgs = lastThis = undefined
    return result
  }

  function cancel() {
    if (timerId !== undefined) {
      cancelTimer(timerId)
    }
    lastInvokeTime = 0
    lastArgs = lastCallTime = lastThis = timerId = undefined
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(Date.now())
  }

  function pending() {
    return timerId !== undefined
  }

  function debounced(...args) {
    const time = Date.now()
    const isInvoking = shouldInvoke(time)



    lastArgs = args
    lastThis = this
    lastCallTime = time

    if (isInvoking) {


      if (timerId === undefined) {
        return leadingEdge(lastCallTime)
      }
      if (maxing) {
        timerId = startTimer(timerExpired, wait)
        return invokeFunc(lastCallTime)
      }
    }
    if (timerId === undefined) {
      timerId = startTimer(timerExpired, wait)
    }
    return result
  }
  debounced.cancel = cancel
  debounced.flush = flush
  debounced.pending = pending
  return debounced
}

/**
 * 函数节流，类似lodash中的同名方法
 * @param {*} func 方法
 * @param {*} wait 等待时间
 * @param {*} options 其他设置
 */
function throttle(func, wait, options) {
  let leading = true
  let trailing = true

  if (typeof func != 'function') {
    throw new TypeError('Expected a function')
  }
  if (isObject(options)) {
    leading = 'leading' in options ? !!options.leading : leading
    trailing = 'trailing' in options ? !!options.trailing : trailing
  }
  return debounce(func, wait, {
    'leading': leading,
    'maxWait': wait,
    'trailing': trailing
  })
}

// 用法：引入文件 var Limit=require("../../utils/limitfunc.js")
//debounce,函数防抖;
//throttle,函数
//
//
// 方法名: Limit.debounce(e => {
//   console.log(e)
//   对应操作
// }, 1000, {
//   leading: true,
//   trailing: false
// })

// 方法名: Limit.throttle(e => {
//   console.log(e)
//    对应的操作
// }, 100)

export {
  type,
  isEmpty,
  deepClone,
  deepMerge,
  voidFunction,
  padStart,
  padEnd,
  arrayShuffle,
  sleep,
  isSame,
  debounce,
  throttle,
  mergeArray,
  alert,
  queryToJson,
  jsonToQuery,
  confirm,
  getTabbar,
  formatRequestData
}