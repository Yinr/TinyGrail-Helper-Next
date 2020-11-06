import { generateCharacterList, loadCharacterList } from './loadCharacterList'
import { loadAutoBuild } from './loadAutoBuild'

import { FillICOList } from '../../config/fillICOList'

export const loadAutoFillICO = (page) => {
  const list = FillICOList.get()
  const charas = []
  for (let i = 0; i < list.length; i++) charas.push(list[i].charaId)
  const start = 50 * (page - 1)
  const ids = charas.slice(start, start + 50)
  const totalPages = Math.ceil(charas.length / 50)
  generateCharacterList(ids).then(list => {
    loadCharacterList(list, page, totalPages, loadAutoBuild, 'chara_ico', false)
  })
}
