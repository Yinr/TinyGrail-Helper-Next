import { getMe } from '../../utils/utils'

import { LinkPosList } from '../../config/linkPosList'

export const changeLinkPos = (parentNode) => {
  const me = getMe()
  let user
  if (location.pathname.startsWith('/user')) {
    user = location.pathname.split('/').pop()
  }

  const swapLink = (linkEl) => {
    const $link = $(linkEl).closest('.link')
    const $left = $link.find('.left')
    const $right = $link.find('.right')
    const $content = $link.find('.content')
    $left.toggleClass('left').toggleClass('right')
    $right.toggleClass('left').toggleClass('right')
    const $names = $content.find('span')
    $($names[0]).replaceWith($names[1])
    $content.append($names[0])
    $link.toggleClass('swapped')
    const thisUser = user || $link.find('.name a').attr('href').split('/').pop()
    const thisLinkPos = [$right, $left].map((el) => $(el).find('.card').data('temple').CharacterId).join('#')
    const thisConfig = `${thisUser}#${thisLinkPos}`
    console.log(thisConfig)

    // 保存位置顺序
    if (thisUser === me) {
      const reverseConfig = thisConfig.replace(/^(.+)#(\d+)#(\d+)$/, '$1#$3#$2')
      let linkPosList = LinkPosList.get()
      linkPosList = linkPosList.filter((i) => ![thisConfig, reverseConfig].includes(i))
      if ($link.hasClass('swapped')) {
        linkPosList.push(thisConfig)
        console.log('saved link pos: ' + thisConfig)
      }
      LinkPosList.set(linkPosList)
    }
  }

  const linkPosList = LinkPosList.get()

  $(parentNode).find('.link .name').each((i, el) => {
    if ($(el).find('.swapPos').length > 0) return
    $(el).append('<span class="swapPos" title="交换连接两塔的顺序">[换序]</span>')
    // 应用设置
    let thisUser = user
    if (!thisUser) thisUser = $(el).find('a').attr('href').split('/').pop()
    if (thisUser === me) {
      const $link = $(el).closest('.link')
      const leftId = $link.find('.left .card').data('temple').CharacterId
      const rightId = $link.find('.right .card').data('temple').CharacterId
      const reverseConfig = `${thisUser}#${rightId}#${leftId}`
      if (linkPosList.includes(reverseConfig)) swapLink($link)
    }
  })

  $(parentNode).on('click', '.swapPos', (e) => {
    swapLink($(e.currentTarget).closest('.link'))
  })
}
