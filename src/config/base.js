const configGenerator = (name, defaultValue, config = {
  postGet: (value) => value, // 获取设置后的过滤处理函数
  preSet: (value) => value // 保存设置前的过滤处理函数
}) => {
  const storageName = `TinyGrail_${name}`
  return {
    name,
    storageName,
    getRaw () {
      return localStorage.getItem(storageName)
    },
    get () {
      let value = null
      try {
        value = JSON.parse(this.getRaw())
        if (config.postGet) {
          value = config.postGet(value)
        }
      } catch (err) {
        console.error(`Fail to get config of ${storageName}`, { valueString: this.getRaw(), value, err })
      }
      return value || defaultValue
    },
    setRaw (valueString, raiseError = false) {
      try {
        localStorage.setItem(storageName, valueString)
      } catch (err) {
        console.error(`Fail to set config of ${storageName}`, { valueString, err })
        if (raiseError) throw err
      }
    },
    set (value) {
      if (config.preSet) {
        try {
          value = config.preSet(value)
        } catch (err) {
          console.warn(`Fail to preparse config of ${storageName}`, { value, err })
        }
      }
      this.setRaw(JSON.stringify(value))
      return value
    }
  }
}

export { configGenerator }
