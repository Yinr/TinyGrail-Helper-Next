import { getData, postData } from '../utils/api'

import { ItemsSetting } from '../config/itemsSetting'

const autoFillTemple = () => {
  if (ItemsSetting.get().autoFill !== true) return

  const autoFillCosts = async (autoFillCostList) => {
    for (let i = 0; i < autoFillCostList.length; i++) {
      const id = autoFillCostList[i].id
      const supplyId = autoFillCostList[i].supplyId
      const cost = autoFillCostList[i].cost
      await postData(`magic/stardust/${supplyId}/${id}/${cost}/true`, null).then((d) => {
        if (d.State === 0) console.log(`自动补塔 #${id} ${d.Value}`)
        else console.log(`自动补塔 #${id} ${d.Message}`)
      })
    }
  }
  const checkLostTemple = (currentPage) => {
    const autoFillCostList = []
    getData(`chara/user/temple/0/${currentPage}/500`).then((d) => {
      if (d.State === 0) {
        for (let i = 0; i < d.Value.Items.length; i++) {
          const info = {}
          const lv = d.Value.Items[i].CharacterLevel
          const itemsSetting = ItemsSetting.get()
          info.id = d.Value.Items[i].CharacterId
          info.supplyId = itemsSetting.stardust ? parseInt(itemsSetting.stardust[lv]) : null
          info.cost = d.Value.Items[i].Sacrifices - d.Value.Items[i].Assets
          if (info.cost >= 100 && info.cost <= 250 && info.id !== info.supplyId && info.supplyId) {
            autoFillCostList.push(info)
          }
        }
        autoFillCosts(autoFillCostList)
        if (currentPage < d.Value.TotalPages) {
          currentPage++
          checkLostTemple(currentPage)
        }
      }
    })
  }

  checkLostTemple(1)
}

export { autoFillTemple }
