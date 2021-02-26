import { getData } from '../utils/api'

export const getSacrifices = async (charaId, user, userType = 'UserId') => {
  let Sacrifices = 0
  let Assets = 0
  const templeInfo = await getData(`chara/temple/${charaId}`)
  let temple = templeInfo.Value.find(i => i[userType] === user)
  if (temple === undefined) {
    const linkInfo = await getData(`chara/links/${charaId}`)
    temple = linkInfo.Value.find(i => i[userType] === user)
  }
  if (temple !== undefined) {
    Sacrifices = temple.Sacrifices || 0
    Assets = temple.Assets || 0
  }
  const Damage = Math.max(Sacrifices - Assets, 0)
  return { Sacrifices, Assets, Damage }
}
