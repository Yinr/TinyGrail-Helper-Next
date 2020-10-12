import { configGenerator } from './base'

/** Item Info
 *  item.Id: (int) chara.Id, ICO ID
 *  item.charaId: (int) chara.CharacterId
 *  item.name: (string) chara.Name
 *  item.target: (int) 目标等级
 *  item.end: (int) chara.End, End Time
 */

// ico自动补款
const FillICOList = configGenerator('fillicoList', [])

export { FillICOList }
