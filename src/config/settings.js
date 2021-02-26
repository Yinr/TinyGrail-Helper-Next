import { configGenerator } from './base'

// 设置
const Settings = configGenerator('settings', {
  pre_temple: 'on',
  hide_grail: 'off',
  hide_link: 'off',
  hide_temple: 'off',
  hide_board: 'off',
  auction_num: 'one',
  merge_order: 'off',
  get_bonus: 'on',
  gallery: 'off',
  valhalla_sacrifices: 'on'
})

export { Settings }
