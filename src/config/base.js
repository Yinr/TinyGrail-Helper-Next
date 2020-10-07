const configGenerator = (name, defaultValue, config = {
  postGet: (value) => value, // 获取设置后的过滤处理函数
  preSet: (value) => value // 保存设置前的过滤处理函数
}) => {
  const storageName = `TinyGrail_${name}`
  return {
    get () {
      if (config.postGet) {
        return config.postGet(JSON.parse(localStorage.getItem(storageName))) || defaultValue
      } else {
        return JSON.parse(localStorage.getItem(storageName)) || defaultValue
      }
    },
    set (value) {
      if (config.preSet) {
        return localStorage.setItem(storageName, JSON.stringify(config.preSet(value)))
      } else {
        return localStorage.setItem(storageName, JSON.stringify(value))
      }
    }
  }
}

export { configGenerator }
