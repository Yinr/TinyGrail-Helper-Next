import { getData } from '../../utils/api'

import { getSacrifices } from '../../trade/getSacrifices'

export const showValhallaPersonal = async (itemList) => {
  for (let i = 0; i < itemList.length; i++) {
    const chara = $(itemList[i])
    const id = chara.find('a.avatar[data-id]').data('id')
    const charaInfo = await getData(`chara/user/${id}`)
    const amount = charaInfo.Value.Amount
    const userId = charaInfo.Value.Id

    const { Sacrifices, Damage } = await getSacrifices(id, userId)
    chara.find('a.avatar[data-id] > img').after(`<div style="text-align: center; line-height: 1em;" title="持股数 | 献祭值${Damage ? ' (损耗值)' : ''}"><small>${amount} | ${Sacrifices}${Damage ? `(${Damage})` : ''}</small></div>`)
  }
}
