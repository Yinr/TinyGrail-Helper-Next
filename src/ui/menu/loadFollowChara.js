import { generateCharacterList, loadCharacterList } from './loadCharacterList'

import { FollowList } from '../../config/followList'

export const loadFollowChara = (page) => {
  const followList = FollowList.get()
  const start = 50 * (page - 1)
  const ids = followList.charas.slice(start, start + 50)
  const totalPages = Math.ceil(followList.charas.length / 50)
  generateCharacterList(ids).then(list => {
    loadCharacterList(list, page, totalPages, loadFollowChara, 'chara', true)
  })
}
