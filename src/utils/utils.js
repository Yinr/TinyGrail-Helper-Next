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
    if (successCallback) successCallback(mutationList)
  }
  const observer = new MutationObserver(observeFunc)
  observer.observe(parentNode, config)
}

export { getMe, launchObserver, normalizeAvatar }