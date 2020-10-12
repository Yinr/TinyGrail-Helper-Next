import { postData } from '../../utils/api'

import { loadCharacterList } from './loadCharacterList'

import { FollowList } from '../../config/followList'

export const loadFollowChara = (page) => {
  const followList = FollowList.get()
  const start = 50 * (page - 1)
  const ids = followList.charas.slice(start, start + 50)
  const totalPages = Math.ceil(followList.charas.length / 50)
  postData('chara/list', ids).then((d) => {
    if (d.State === 0) {
      loadCharacterList(d.Value, page, totalPages, loadFollowChara, 'chara', true)
    }
  })
}
