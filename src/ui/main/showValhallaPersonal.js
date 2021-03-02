import { getData } from '../../utils/api'
import { launchObserver } from '../../utils/utils'

import { getSacrifices } from '../../trade/getSacrifices'

import { PersistentCache } from '../../config/persistentCache'

const addValhallaElement = (charaElement, amount, sacrifices, damage) => {
  const title = `持股数 | 献祭值${damage ? ' (损耗值)' : ''}，点击刷新`
  const text = `${amount} | ${sacrifices}${damage ? `(${damage})` : ''}`
  charaElement = $(charaElement)
  const info = charaElement.find('.valhalla-sacrifices')
  if (info.length === 0) {
    charaElement.find('a.avatar[data-id] > img').after(`<div class="valhalla-sacrifices" title="${title}"><small>${text}</small></div>`)
  } else {
    info.attr('title', title).find('small').text(text)
  }
}

const showValhallaItems = async (itemList) => {
  const sacrificesCache = PersistentCache.get().sacrifices || {}
  const freshItem = []
  const time = (new Date()).valueOf()
  const cacheEnd = time - 24 * 60 * 60 * 1000 // 缓存时长 12 小时
  itemList.forEach(i => {
    const charaId = i.querySelector('a.avatar[data-id]').dataset.id
    if (charaId in sacrificesCache) {
      const sacrifices = sacrificesCache[charaId]
      addValhallaElement(i, sacrifices.amount, sacrifices.sacrifices, sacrifices.damage)
      if ((new Date(sacrifices.time)) < cacheEnd) {
        delete sacrifices[charaId]
        freshItem.push(i)
      }
    } else { freshItem.push(i) }
  })
  for (const [key, value] of Object.entries(sacrificesCache)) {
    if ((new Date(value.time)) < cacheEnd) delete sacrificesCache[key]
  }
  PersistentCache.set({ ...PersistentCache.get(), sacrifices: sacrificesCache })

  for (let i = 0; i < freshItem.length; i++) {
    const chara = $(itemList[i])
    const id = chara.find('a.avatar[data-id]').data('id')
    const charaInfo = await getData(`chara/user/${id}`)
    const amount = charaInfo.Value.Amount

    const { Sacrifices, Damage } = await getSacrifices(id)
    addValhallaElement(chara, amount, Sacrifices, Damage)
    sacrificesCache[id.toString()] = { amount: amount, sacrifices: Sacrifices, damage: Damage, time: time }
  }
  PersistentCache.set({ ...PersistentCache.get(), sacrifices: sacrificesCache })
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
