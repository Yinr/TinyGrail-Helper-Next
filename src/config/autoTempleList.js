import { configGenerator } from './base'

/** Item Info
 *  item.charaId: (int) 角色ID
 *  item.name: (string) 角色名
 *  item.target: (int) 目标数量
 *  item.bidPrice: (float) 最高买入价格
 */

// 自动建塔
const AutoTempleList = configGenerator('autoTempleList', [])

export { AutoTempleList }
