import { postData } from '../../utils/api'

import { loadCharacterList } from './loadCharacterList'
import { loadUserAuctions, loadValhalla } from '../../trade/auction'

import { FollowList } from '../../config/followList'

export const loadFollowAuction = (page) => {
  const followList = FollowList.get()
  const start = 20 * (page - 1)
  const ids = followList.auctions.slice(start, start + 20)
  const totalPages = Math.ceil(followList.auctions.length / 20)
  postData('chara/list', ids).then((d) => {
    if (d.State === 0) {
      loadCharacterList(d.Value, page, totalPages, loadFollowAuction, 'auction', true)
      postData('chara/auction/list', ids).then((d) => {
        loadUserAuctions(d)
      })
      loadValhalla(ids)
    }
  })
}
