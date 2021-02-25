import { configGenerator } from './base'

/** Item Info
 *  ['lotusland']: (int) 幻想乡自动抽奖金额上限
 *  ['chaosCube']: (int) 混沌魔方炮塔角色 ID
 *  ['guidepost'].['monoId']: (int) 虚空道标炮塔角色 ID
 *  ['guidepost'].['toMonoId']: (int) 虚空道标目标角色 ID
 *  ['starbreak'].['attackId']: (int) 闪光结晶炮塔角色 ID
 *  ['starbreak'].['toAttackId']: (int) 闪光结晶目标角色 ID
 *
 *  ['autoFill']: (bool) 星光碎片自动补塔功能开关 // v3.0.30 取消
 *  ['autoFillMin']: (int) 星光碎片自动补塔最低值，缺损数小于此值不自动补塔 // v3.0.30 取消
 *  ['stardust'].[level]: (int) 星光碎片相应等级能源角色 ID // v3.0.30 取消
 */

// 道具设置
const ItemsSetting = configGenerator('ItemsSetting', {})

export { ItemsSetting }
