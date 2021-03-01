import { getData } from '../../utils/api'
import { launchObserver } from '../../utils/utils'

import { getSacrifices } from '../../trade/getSacrifices'

const showValhallaItems = async (itemList) => {
  for (let i = 0; i < itemList.length; i++) {
    const chara = $(itemList[i])
    const id = chara.find('a.avatar[data-id]').data('id')
    const charaInfo = await getData(`chara/user/${id}`)
    const amount = charaInfo.Value.Amount

    const { Sacrifices, Damage } = await getSacrifices(id)
    const title = `持股数 | 献祭值${Damage ? ' (损耗值)' : ''}，点击刷新`
    const text = `${amount} | ${Sacrifices}${Damage ? `(${Damage})` : ''}`
    const info = chara.find('.valhalla-sacrifices')
    if (info.length === 0) {
      chara.find('a.avatar[data-id] > img').after(`<div class="valhalla-sacrifices" title="${title}"><small>${text}</small></div>`)
    } else {
      info.attr('title', title).find('small').text(text)
    }
  }
}

export const showValhallaPersonal = () => {
  launchObserver({
    parentNode: document.getElementById('valhalla'),
    selector: '#valhalla li.initial_item.chara',
    successCallback: (mutationList) => {
      const itemList = mutationList.map(i => Array.from(i.addedNodes).filter(j => j.classList && j.classList.contains('initial_item'))).reduce((acc, val) => acc.concat(val), [])
      showValhallaItems(itemList)
    },
    stopWhenSuccess: false
  })

  $('#valhalla').on('click', '.valhalla-sacrifices', (e) => {
    showValhallaItems($(e.currentTarget).closest('li.initial_item.chara'))
    e.stopPropagation()
  })
}
