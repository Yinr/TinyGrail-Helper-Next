import { launchObserver } from '../../utils/utils'

import { Settings } from '../../config/settings'

const toggleGrailBox = () => {
  const $title = $('#grail li.title')
  if ($title.hasClass('hide_grail_title')) {
    $title.closest('div.horizontalOptions').next().removeClass('hide_grail')
    $('div.grail.page_inner').removeClass('hide_grail')
    $title.removeClass('hide_grail_title')
  } else {
    $title.closest('div.horizontalOptions').next().addClass('hide_grail')
    $('div.grail.page_inner').addClass('hide_grail')
    $title.addClass('hide_grail_title')
  }
}

export const showHideGrailBox = () => {
  const hide = Settings.get().hide_grail
  if (hide === 'on') {
    toggleGrailBox()
  }

  $('#grail li.title').attr('title', '显示/隐藏小圣杯').on('click', toggleGrailBox)

  launchObserver({
    parentNode: document.querySelector('#user_home'),
    selector: '.grail.page_inner',
    successCallback: () => {
      console.log('modify page inner')
      if ($('#grail li.title').hasClass('hide_grail_title')) {
        $('div.grail.page_inner').addClass('hide_grail')
      }
    },
    config: { childList: true },
    stopWhenSuccess: false
  })
}
