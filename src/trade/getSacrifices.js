import { getData } from '../utils/api'

import { getMe } from '../utils/utils'

export const getSacrifices = async (charaId, username) => {
  let Sacrifices = 0
  let Assets = 0
  const templeInfo = await getData(`chara/user/temple/${username || getMe()}/1/100?keyword=${charaId}`)
  const temple = templeInfo.Value.Items.find(i => i.CharacterId === charaId)
  if (temple !== undefined) {
    Sacrifices = temple.Sacrifices || 0
    Assets = temple.Assets || 0
  }
  const Damage = Math.max(Sacrifices - Assets, 0)
  return { Sacrifices, Assets, Damage }
}
