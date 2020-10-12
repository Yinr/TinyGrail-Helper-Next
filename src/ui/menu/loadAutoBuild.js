import { postData } from '../../utils/api'

import { loadCharacterList } from './loadCharacterList'

import { autoBuildTemple } from '../../trade/temple'
import { AutoTempleList } from '../../config/autoTempleList'

export const loadAutoBuild = (page) => {
  const autoTempleList = AutoTempleList.get()
  autoBuildTemple(autoTempleList)
  const charas = []
  for (let i = 0; i < autoTempleList.length; i++) charas.push(autoTempleList[i].charaId)
  const start = 50 * (page - 1)
  const ids = charas.slice(start, start + 50)
  const totalPages = Math.ceil(charas.length / 50)
  postData('chara/list', ids).then((d) => {
    if (d.State === 0) {
      loadCharacterList(d.Value, page, totalPages, loadAutoBuild, 'chara', false)
    }
  })
}
