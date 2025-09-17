/**
 * @description: 日志工具类
 */
export class RsLogger {
  constructor(isConsoleEnabled) {
    this.isConsoleEnabled = isConsoleEnabled ?? false
    this.wrapConsoleMethods()
  }

  openLog() {
    this.isConsoleEnabled = true
  }
  closeLog() {
    this.isConsoleEnabled = false
  }

  wrapConsoleMethods() {
    Object.keys(console).forEach((key) => {
      if (typeof console[key] === 'function') {
        this[key] = this.wrapConsoleMethod(console[key])
      }
    })
  }

  wrapConsoleMethod(method) {
    return (...args) => {
      if (this.isConsoleEnabled) {
        method.apply(console, args)
      }
    }
  }
}

// 是否开启日志
const openLog = true

const rsLogger = new RsLogger(openLog)

export default rsLogger
