import { getData } from '../../utils/api'

export const showValhallaPersonal = async (itemList) => {
  for (let i = 0; i < itemList.length; i++) {
    const chara = $(itemList[i])
    const id = chara.find('a.avatar[data-id]').data('id')
    const charaInfo = await getData(`chara/user/${id}`)
    const amount = charaInfo.Value.Amount
    const userId = charaInfo.Value.Id
    const templeInfo = await getData(`chara/temple/${id}`)
    const temple = templeInfo.Value.find(i => i.UserId === userId) || {}
    const sacrifices = temple.Sacrifices || 0
    chara.find('a.avatar[data-id] > img').after(`<div style="text-align: center; line-height: 1em;" title="持股数 | 献祭值"><small>${amount} | ${sacrifices}</small></div>`)
  }
}
