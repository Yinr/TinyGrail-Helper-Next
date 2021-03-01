import './style.scss'

import { launchObserver } from './utils/utils'

import { autoBuildTemple } from './trade/temple'
import { autoFillICO, autoJoinFollowIco } from './trade/ico'
import { getShareBonus } from './trade/bonus'

import { hideBonusButton } from './ui/main/hideBonusButton'
import { showTopWeek } from './ui/main/showTopWeek'
import { showValhallaPersonal } from './ui/main/showValhallaPersonal'
import { loadHelperMenu } from './ui/menu/menu'
import { markFollow } from './ui/menu/markFollow'
import { addCharaInfo, addICOInfo } from './ui/trade/addCharaInfo'
import { changeLinkPos } from './ui/trade/changeLinkPos'
import { showGallery } from './ui/trade/showGallery'
import { openAuctionDialogSimple } from './ui/trade/openAuctionDialog'
import { showHideGrailBox } from './ui/user/showHideGrailBox'

import { Settings } from './config/settings'

if (!location.pathname.startsWith('/rakuen/topic')) {
  // 自动建塔
  setInterval(autoBuildTemple, 60 * 60 * 1000)

  // ICO 自动补款
  setInterval(autoFillICO, 30 * 1000)

  // 关注角色 ICO 自动凑人头
  setInterval(autoJoinFollowIco, 60 * 60 * 1000)
}

const listenToGrailBox = (parentNode = document.body, listenIco = true) => {
  // charater trade info
  launchObserver({
    parentNode: parentNode,
    selector: '#grailBox .assets_box:not(.tinygrail-helped)',
    successCallback: () => {
      addCharaInfo(parseInt($('#grailBox .assets_box:not(.tinygrail-helped)').closest('#grailBox').attr('class').match(/chara(\d+)/)[1]))
    },
    stopWhenSuccess: false
  })
  if (listenIco) {
    // charater ico info
    launchObserver({
      parentNode: parentNode,
      selector: '#grailBox .trade .money:not(.tinygrail-helped)',
      successCallback: () => {
        addICOInfo(parseInt($('#grailBox .trade .money:not(.tinygrail-helped)').closest('#grailBox').attr('class').match(/chara(\d+)/)[1]))
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
    selector: '#lastLinks.tab_page_item .assets .link.item:not(.swap-checked)',
    successCallback: () => {
      changeLinkPos('#lastLinks') // 修改连接顺序
      $('#lastLinks.tab_page_item .assets .link.item:not(.swap-checked)').addClass('swap-checked')
    },
    stopWhenSuccess: false
  })
  listenToGrailBox(document.body)

  // 英灵殿个人持股显示
  if (Settings.get().valhalla_sacrifices === 'on') {
    launchObserver({
      parentNode: document.body,
      selector: '#valhalla',
      successCallback: () => {
        showValhallaPersonal()
      }
    })
  }

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
  launchObserver({
    parentNode: document.body,
    selector: 'ul .load_more',
    successCallback: (mutationList) => {
      if (mutationList.some(muRecord => Array.from(muRecord.addedNodes.values()).some(el => $(el).is('.load_more')))) {
        markFollow()
      }
    },
    stopWhenSuccess: false
  })
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
