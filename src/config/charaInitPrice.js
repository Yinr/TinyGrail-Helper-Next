import { configGenerator } from './base'

/** Item Info
 *  [charaId].init_price: (string) 发行价
 *  [charaId].time: (string) 上市时间
 */

// 发行价缓存
const CharaInitPrice = configGenerator('chara_initPrice', {})

export { CharaInitPrice }
