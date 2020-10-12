import { configGenerator } from './base'

// 设置
const Settings = configGenerator('settings', {
  pre_temple: 'on',
  hide_grail: 'off',
  auction_num: 'one',
  merge_order: 'off',
  get_bonus: 'on',
  gallery: 'off'
})

export { Settings }
