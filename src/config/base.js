const configGenerator = (name, defaultValue, config = {}) => {
  const storageName = `TinyGrail_${name}`
  const { postGet, preSet, storage } = {
    // postGet: (value) => value, // 获取设置后的过滤处理函数
    // preSet: (value) => value, // 保存设置前的过滤处理函数
    storage: localStorage, // 存储区域：localStorage, sessionStorage
    ...config
  }
  return {
    name,
    storageName,
    getRaw () {
      return storage.getItem(storageName)
    },
    get () {
      let value = null
      try {
        value = JSON.parse(this.getRaw())
        if (postGet) {
          value = postGet(value)
        }
      } catch (err) {
        console.error(`Fail to get config of ${storageName}`, { valueString: this.getRaw(), value, err })
      }
      return value || defaultValue
    },
    setRaw (valueString, raiseError = false) {
      try {
        storage.setItem(storageName, valueString)
      } catch (err) {
        console.error(`Fail to set config of ${storageName}`, { valueString, err })
        if (raiseError) throw err
      }
    },
    set (value) {
      if (preSet) {
        try {
          value = preSet(value)
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
