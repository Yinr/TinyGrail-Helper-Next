import { FollowList } from '../../config/followList'
import { AutoTempleList } from '../../config/autoTempleList'
import { FillICOList } from '../../config/fillICOList'

export const markFollow = () => {
  const followInfoTagsClass = 'item-info-tags'
  const followInfoTag = `<small class="${followInfoTagsClass}"></small>`
  const followChara = '<div title="已关注角色" class="item-info-tag item-info-chara-icon"></div>'
  const followAuc = '<div title="已关注拍卖" class="item-info-tag item-info-auc-icon"></div>'
  const followIco = '<div title="已自动补款" class="item-info-tag item-info-ico-icon"></div>'
  const followTemple = '<div title="已自动建塔" class="item-info-tag item-info-temple-icon"></div>'

  $('.item_list').each((_, el) => {
    const itemEl = $(el)
    let id = itemEl.data('id')
    if (!id) {
      const avatarUrl = itemEl.find('a.avatar').attr('href') // 角色链接中提取角色 ID
      const recMatch = itemEl.find('.row .time').text().match(/#(\d+)/) || ['', ''] // 交易记录中提取角色 ID
      id = parseInt(avatarUrl ? avatarUrl.match(/topic\/crt\/(\d+)([?/]|$)/)[1] : recMatch[1])
    }

    let followInfoTagEl = itemEl.find(`.${followInfoTagsClass}`)
    if (!followInfoTagEl.length) followInfoTagEl = itemEl.find('.inner .row').before(followInfoTag).prev()

    if (!id || !followInfoTagEl) return

    let followInfo = ''

    const followList = FollowList.get()
    if (followList.charas.includes(id)) followInfo += followChara
    if (followList.auctions.includes(id)) followInfo += followAuc

    const templeInfo = AutoTempleList.get().find(e => parseInt(e.charaId) === id)
    if (templeInfo) {
      followInfo += followTemple
      if (templeInfo.bidPrice && templeInfo.target) {
        followInfo += `<small title="自动建塔价 × 数量">(${templeInfo.bidPrice} * ${templeInfo.target})</small>`
      }
    }

    const fillIcoInfo = FillICOList.get().find(e => parseInt(e.charaId) === id)
    if (fillIcoInfo) {
      followInfo += followIco
      if (fillIcoInfo.target) {
        followInfo += `<small title="自动补款目标">(lv${fillIcoInfo.target})</small>`
      }
    }

    followInfoTagEl.html(followInfo)
  })
}
