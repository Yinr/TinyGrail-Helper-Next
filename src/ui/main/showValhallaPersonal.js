import { getData } from '../../utils/api'

export const showValhallaPersonal = async (itemList) => {
  for (let i = 0; i < itemList.length; i++) {
    const chara = $(itemList[i])
    const id = chara.find('a.avatar[data-id]').data('id')
    const charaInfo = await getData(`chara/user/${id}`)
    const amount = charaInfo.Value.Amount
    const userId = charaInfo.Value.Id

    let sacrifices = 0
    let assets = 0
    const templeInfo = await getData(`chara/temple/${id}`)
    const temple = templeInfo.Value.find(i => i.UserId === userId)
    if (temple === undefined) {
      const linkInfo = await getData(`chara/links/${id}`)
      const link = linkInfo.Value.find(i => i.UserId === userId) || {}
      if (link !== undefined) {
        sacrifices = link.Sacrifices || 0
        assets = link.Assets || 0
      }
    } else {
      sacrifices = temple.Sacrifices || 0
      assets = temple.Assets || 0
    }
    const damage = Math.max(sacrifices - assets, 0)
    chara.find('a.avatar[data-id] > img').after(`<div style="text-align: center; line-height: 1em;" title="持股数 | 献祭值${damage ? ' (损耗值)' : ''}"><small>${amount} | ${sacrifices}${damage ? `(${damage})` : ''}</small></div>`)
  }
}
