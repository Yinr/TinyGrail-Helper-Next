import { FollowList } from '../config/followList'

const getMe = () => {
  const followList = FollowList.get()
  let me = followList.user
  if (!me) {
    // character page
    if (location.pathname.startsWith('/rakuen/topic/crt') || location.pathname.startsWith('/character')) {
      me = $('#new_comment .reply_author a')[0].href.split('/').pop()
    } else
    // rakuen homepage
    if (location.pathname.startsWith('/rakuen/home')) {
      me = $('#grailBox2').data('name')
    } else
    // menu page
    if (location.pathname.startsWith('/rakuen/topiclist')) {
    } else
    // user homepage
    if (location.pathname.startsWith('/user')) {
      me = $('.idBadgerNeue a.avatar').attr('href').split('/').pop()
    }
    followList.user = me
    FollowList.set(followList)
  }
  return me
}

const getDayOfWeek = () => {
  let asiaTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Shanghai' })
  asiaTime = new Date(asiaTime)
  return asiaTime.getDay()
}

const isDayOfWeek = (day) => getDayOfWeek() === (day % 7)

const normalizeAvatar = (avatar) => {
  if (!avatar) return '//lain.bgm.tv/pic/user/l/icon.jpg'

  if (avatar.startsWith('https://tinygrail.oss-cn-hangzhou.aliyuncs.com/')) { return avatar + '!w120' }

  const a = avatar.replace('http://', '//')
  return a
}

const launchObserver = ({
  parentNode,
  selector,
  failCallback = null,
  successCallback = null,
  stopWhenSuccess = true,
  config = { childList: true, subtree: true }
}) => {
  if (!parentNode) return
  const observeFunc = mutationList => {
    if (!document.querySelector(selector)) {
      if (failCallback) failCallback()
      return
    }
    if (stopWhenSuccess) observer.disconnect()

    // 提供筛选变动节点并返回符合条件的元素数组的功能
    mutationList.itemFilter = (fn, type = 'addedNodes') => mutationList.map(i => Array.from(i[type]).filter(fn)).reduce((arr, val) => arr.concat(val), [])

    if (successCallback) successCallback(mutationList)
  }
  const observer = new MutationObserver(observeFunc)
  observer.observe(parentNode, config)
}

export { getMe, launchObserver, isDayOfWeek, normalizeAvatar }
