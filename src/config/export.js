import { Settings } from './settings'
import { FollowList } from './followList'
import { FillICOList } from './fillICOList'
import { AutoTempleList } from './autoTempleList'
import { ItemsSetting } from './itemsSetting'
import { LinkPosList } from './linkPosList'

const configVersion = 3

const configList = [
  Settings,
  FollowList,
  FillICOList,
  AutoTempleList,
  ItemsSetting,
  LinkPosList
]

const exportConfig = () => JSON.stringify({
  meta: {
    project: 'TinyGrail_Helper_Next',
    confver: configVersion,
    exportTime: (new Date()).toISOString()
  },
  config: configList.reduce((config, configItem) => {
    const configValue = configItem.getRaw()
    return configValue
      ? { ...config, [configItem.name]: configValue }
      : config
  }, {})
})

const importSingleConfig = (configStorage, configToImport) => {
  if (configStorage.name in configToImport) {
    console.log(`importing ${configStorage.name}`)
    configStorage.setRaw(configToImport[configStorage.name], true)
  }
}

const importConfig = (configString) => {
  try {
    const errors = []
    const { meta, config } = JSON.parse(configString)

    console.log(`import config version: ${meta.confver}`)
    configList.forEach(configItem => {
      try {
        importSingleConfig(configItem, config)
      } catch (err) {
        errors.push(configItem.name)
      }
    })

    return errors
  } catch (err) {
    console.error('设置导入出错：', { configString, err })
  }
}

export { exportConfig, importConfig }
