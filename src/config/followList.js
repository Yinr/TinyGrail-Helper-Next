import { configGenerator } from './base'

import { parseIntArray } from '../utils/formatter'

const processor = (value) => ({
  ...value,
  charas: parseIntArray(value.charas),
  auctions: parseIntArray(value.auctions)
})

// 关注列表
const FollowList = configGenerator('followList', {
  user: '',
  charas: [],
  auctions: []
}, {
  postGet: processor,
  preSet: processor
})

export { FollowList }
