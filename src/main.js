import './style.scss'

import { launchObserver } from './utils/utils'

import { autoFillTemple } from './trade/magic'
import { autoBuildTemple } from './trade/temple'
import { autoFillICO } from './trade/ico'
import { getShareBonus } from './trade/bonus'

import { hideBonusButton } from './ui/main/hideBonusButton'
import { showTopWeek } from './ui/main/showTopWeek'
import { loadHelperMenu } from './ui/menu/menu'
import { addCharaInfo, addICOInfo } from './ui/trade/addCharaInfo'
import { changeLinkPos } from './ui/trade/changeLinkPos'
import { showGallery } from './ui/trade/showGallery'
import { showHideGrailBox } from './ui/trade/showHideGrailBox'
import { openAuctionDialogSimple } from './ui/trade/openAuctionDialog'

import { Settings } from './config/settings'

// 自动补塔
setInterval(autoFillTemple, 60 * 60 * 1000)

// 自动建塔
setInterval(autoBuildTemple, 60 * 60 * 1000)

// ico自动补款
setInterval(autoFillICO, 30 * 1000)

const listenToGrailBox = (parentNode = document.body, listenIco = true) => {
  // charater trade info
  launchObserver({
    parentNode: parentNode,
    selector: '#grailBox:not(.tinygrail-helped) .assets_box',
    successCallback: () => {
      addCharaInfo(parseInt($('#grailBox:not(.tinygrail-helped)').attr('class').match(/chara(\d+)/)[1]))
    },
    stopWhenSuccess: false
  })
  if (listenIco) {
    // charater ico info
    launchObserver({
      parentNode: parentNode,
      selector: '#grailBox:not(.tinygrail-helped) .trade .money',
      successCallback: () => {
        addICOInfo(parseInt($('#grailBox:not(.tinygrail-helped)').attr('class').match(/chara(\d+)/)[1]))
      },
      stopWhenSuccess: false
    })
  }
}

// character page
if (location.pathname.startsWith('/rakuen/topic/crt') || location.pathname.startsWith('/character')) {
  const parentNode = document.getElementById('subject_info') || document.getElementById('columnCrtB')
  listenToGrailBox(parentNode)
} else

// rakuen homepage
if (location.pathname.startsWith('/rakuen/home')) {
  // 周六未领取股息则自动领取
  if (Settings.get().get_bonus === 'on') getShareBonus()
  launchObserver({
    parentNode: document.body,
    selector: '#topWeek',
    successCallback: () => {
      hideBonusButton() // 隐藏签到
      showTopWeek() // 显示萌王榜排名数值
      showGallery() // 显示画廊
    }
  })
  launchObserver({
    parentNode: document.body,
    selector: '#lastLinks.tab_page_item .assets .link.item',
    successCallback: () => {
      changeLinkPos('#lastLinks') // 修改连接顺序
    }
  })
  listenToGrailBox(document.body)

  // 修改拍卖按钮
  launchObserver({
    parentNode: document.body,
    selector: '.grail_index .auction_button',
    successCallback: () => {
      $(document).off('click', '.grail_index .auction_button')
      $(document).on('click', '.grail_index .auction_button', (e) => {
        openAuctionDialogSimple($(e.currentTarget).data('chara'))
      })
    },
    stopWhenSuccess: false
  })
} else

// menu page
if (location.pathname.startsWith('/rakuen/topiclist')) {
  if ($('.timelineTabs #recentMenu').length > 0) {
    loadHelperMenu()
  } else {
    launchObserver({
      parentNode: document.querySelector('.timelineTabs'),
      selector: '#recentMenu',
      successCallback: () => {
        loadHelperMenu()
      }
    })
  }
} else

// user homepage
if (location.pathname.startsWith('/user')) {
  launchObserver({
    parentNode: document.body,
    selector: '#grail',
    successCallback: () => {
      showHideGrailBox()
      showGallery()
    }
  })
  launchObserver({
    parentNode: document.body,
    selector: '.link_list .grail_list:not([style]) .link .item',
    successCallback: () => {
      if ($('.link_list .grail_list:not([style]) .link .swapPos').length > 0) return
      changeLinkPos('.link_list .grail_list:not([style])') // 修改连接顺序
    },
    stopWhenSuccess: false
  })
  listenToGrailBox(document.body)
}
