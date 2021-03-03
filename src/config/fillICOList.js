import { configGenerator } from './base'

/** Item Info
 *  item.Id: (int) chara.Id, ICO ID
 *  item.charaId: (int) chara.CharacterId
 *  item.name: (string) chara.Name
 *  item.target: (int) 目标等级
 *  item.fillMin: (boolean) 是否按不爆注的最低等级补款
 *  item.end: (string) chara.End, End Time
 */

// ico自动补款
const FillICOList = configGenerator('fillicoList', [], {
  postGet: value => value.map(item => ({
    ...item,
    Id: parseInt(item.Id),
    charaId: parseInt(item.charaId),
    target: parseInt(item.target),
    end: item.end
  })).sort((a, b) => a.end - b.end)
})

export { FillICOList }
