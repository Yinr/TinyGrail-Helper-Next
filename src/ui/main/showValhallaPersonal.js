import { getData } from '../../utils/api'
import { launchObserver } from '../../utils/utils'

import { getSacrifices } from '../../trade/getSacrifices'

const addValhallaElement = (charaElement, amount, sacrifices, damage) => {
  const title = `持股数 | 献祭值${damage ? ' (损耗值)' : ''}，点击刷新`
  const text = `${amount} | ${sacrifices}${damage ? `(${damage})` : ''}`
  const info = charaElement.find('.valhalla-sacrifices')
  if (info.length === 0) {
    charaElement.find('a.avatar[data-id] > img').after(`<div class="valhalla-sacrifices" title="${title}"><small>${text}</small></div>`)
  } else {
    info.attr('title', title).find('small').text(text)
  }
}

const showValhallaItems = async (itemList) => {
  for (let i = 0; i < itemList.length; i++) {
    const chara = $(itemList[i])
    const id = chara.find('a.avatar[data-id]').data('id')
    const charaInfo = await getData(`chara/user/${id}`)
    const amount = charaInfo.Value.Amount

    const { Sacrifices, Damage } = await getSacrifices(id)
    addValhallaElement(chara, amount, Sacrifices, Damage)
  }
}

export const showValhallaPersonal = () => {
  launchObserver({
    parentNode: document.getElementById('valhalla'),
    selector: '#valhalla li.initial_item.chara',
    successCallback: (mutationList) => {
      const itemList = mutationList.itemFilter(i => i.classList && i.classList.contains('initial_item'))
      showValhallaItems(itemList)
    },
    stopWhenSuccess: false
  })

  $('#valhalla').on('click', '.valhalla-sacrifices', (e) => {
    showValhallaItems($(e.currentTarget).closest('li.initial_item.chara'))
    e.stopPropagation()
  })
}
