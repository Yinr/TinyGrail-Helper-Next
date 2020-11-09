import { configGenerator } from './base'

/** Item Info
 *  ['autoFill']: (bool) 星光碎片自动补塔功能开关
 *  ['lotusland']: (int) 幻想乡自动抽奖金额上限
 *  ['chaosCube']: (int) 混沌魔方炮塔角色 ID
 *  ['guidepost'].['monoId']: (int) 虚空道标炮塔角色 ID
 *  ['guidepost'].['toMonoId']: (int) 虚空道标目标角色 ID
 *  ['stardust'].[level]: (int) 星光碎片相应等级能源角色 ID
 */

// 道具设置
const ItemsSetting = configGenerator('ItemsSetting', {})

export { ItemsSetting }
