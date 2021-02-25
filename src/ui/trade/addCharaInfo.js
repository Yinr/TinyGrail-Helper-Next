import { getData, postData } from '../../utils/api'
import { launchObserver, getMe } from '../../utils/utils'
import { formatDate, formatNumber } from '../../utils/formatter'
import { showDialog, closeDialog } from '../../utils/dialog'

import { openAuctionDialog } from './openAuctionDialog'
import { openBuildDialog } from './openBuildDialog'
import { changeLinkPos } from './changeLinkPos'
import { showGallery } from './showGallery'

import { setFullFillICO } from '../../trade/ico'
import { loadUserAuctions } from '../../trade/auction'

import { Settings } from '../../config/settings'
import { FollowList } from '../../config/followList'
import { CharaInitPrice } from '../../config/charaInitPrice'
import { ItemsSetting } from '../../config/itemsSetting'
import { AutoTempleList } from '../../config/autoTempleList'

const followChara = (charaId) => { // 关注角色
  let button = '<button id="followCharaButton" class="text_button">[关注角色]</button>'
  if (FollowList.get().charas.includes(charaId)) {
    button = '<button id="followCharaButton" class="text_button">[取消关注]</button>'
  }
  if ($(`#grailBox.chara${charaId} #kChartButton`).length) $(`#grailBox.chara${charaId} #kChartButton`).before(button)
  else $(`#grailBox.chara${charaId} .title .text`).after(button)

  $(`#grailBox.chara${charaId} #followCharaButton`).on('click', () => {
    const followList = FollowList.get()
    if (followList.charas.includes(charaId)) {
      followList.charas.splice(followList.charas.indexOf(charaId), 1)
      $(`#grailBox.chara${charaId} #followCharaButton`).text('[关注角色]')
    } else {
      followList.charas.unshift(charaId)
      $(`#grailBox.chara${charaId} #followCharaButton`).text('[取消关注]')
    }
    FollowList.set(followList)
  })
}

const followAuctions = (charaId) => { // 关注竞拍情况
  getData(`chara/user/${charaId}/tinygrail/false`).then((d) => {
    if (d.State === 0) {
      let button
      if (FollowList.get().auctions.includes(charaId)) {
        button = '<button id="followAuctionButton" class="text_button">[取消关注]</button>'
      } else {
        button = '<button id="followAuctionButton" class="text_button">[关注竞拍]</button>'
      }
      $(`#grailBox.chara${charaId} #buildButton`).before(button)
      $(`#grailBox.chara${charaId} #followAuctionButton`).on('click', () => {
        const followList = FollowList.get()
        if (followList.auctions.includes(charaId)) {
          followList.auctions.splice(followList.auctions.indexOf(charaId), 1)
          $(`#grailBox.chara${charaId} #followAuctionButton`).text('[关注竞拍]')
        } else {
          followList.auctions.unshift(charaId)
          $(`#grailBox.chara${charaId} #followAuctionButton`).text('[取消关注]')
        }
        FollowList.set(followList)
      })
    }
  })
}

const sell_out = (charaId, init_price) => {
  $($(`#grailBox.chara${charaId} .info .text`)[1]).append('<button id="sell_out" class="text_button" title="以发行价全部卖出">[全部卖出]</button>')
  $(`#grailBox.chara${charaId} #sell_out`).on('click', function () {
    getData(`chara/user/${charaId}`).then((d) => {
      $(`#grailBox.chara${charaId} .ask .price`).val(init_price)
      $(`#grailBox.chara${charaId} .ask .amount`).val(d.Value.Amount)
    })
  })
}

const showInitialPrice = (charaId) => {
  const charaInitPrice = CharaInitPrice.get()
  if (charaInitPrice[charaId]) {
    const init_price = charaInitPrice[charaId].init_price
    const time = charaInitPrice[charaId].time
    $($(`#grailBox.chara${charaId} .info .text`)[1]).append(`<span title="上市时间:${time}">发行价：${init_price}</span>`)
    sell_out(charaId, init_price)
  } else {
    getData(`chara/charts/${charaId}/2019-08-08`).then((d) => {
      if (d.Value[0]) {
        const init_price = d.Value[0].Begin.toFixed(2)
        const time = d.Value[0].Time.replace('T', ' ')
        const charaInitPrice = CharaInitPrice.get()
        charaInitPrice[charaId] = { init_price: init_price, time: time }
        CharaInitPrice.set(charaInitPrice)
        $($(`#grailBox.chara${charaId} .info .text`)[1]).append(`<span title="上市时间:${time}">发行价：${init_price}</span>`)
        sell_out(charaId, init_price)
      }
    })
  }
}

const priceWarning = (charaId) => {
  const price = $(`#grailBox.chara${charaId} .bid .price`).val()
  $(`#grailBox.chara${charaId} #bidButton`).after('<button style="display:none" id="confirm_bidButton" class="active bid">买入</button>')
  $(`#grailBox.chara${charaId} .bid .price`).on('input', function () {
    const price_now = $(`#grailBox.chara${charaId} .bid .price`).val()
    if (price_now > Math.max(price * 3, 100)) {
      $(`#grailBox.chara${charaId} .bid .price`).css({ color: 'red' })
      $(`#grailBox.chara${charaId} #confirm_bidButton`).show()
      $(`#grailBox.chara${charaId} #bidButton`).hide()
    } else {
      $(`#grailBox.chara${charaId} #confirm_bidButton`).hide()
      $(`#grailBox.chara${charaId} #bidButton`).show()
      $(`#grailBox.chara${charaId} .bid .price`).css({ color: 'inherit' })
    }
  })
  $(`#grailBox.chara${charaId} #confirm_bidButton`).on('click', function () {
    const price = $(`#grailBox.chara${charaId} .bid .price`).val()
    const amount = $(`#grailBox.chara${charaId} .bid .amount`).val()
    if (!confirm(`买入价格过高提醒！\n确定以${price}的价格买入${amount}股？`)) {
      return
    }
    $(`#grailBox.chara${charaId} #bidButton`).click()
  })
}

const changeBaseAmount = (charaId) => {
  $(`#grailBox.chara${charaId} input.amount`).val(1)
}

const mergeorderList = (orderListHistory) => {
  const mergedorderList = []; let i = 0
  mergedorderList.push(orderListHistory[0])
  for (let j = 1; j < orderListHistory.length; j++) {
    if ((orderListHistory[j].Price === mergedorderList[i].Price) && Math.abs(new Date(orderListHistory[j].TradeTime) - new Date(mergedorderList[i].TradeTime)) < 10 * 1000) {
      // 10s内同价格订单合并
      mergedorderList[i].Amount += orderListHistory[j].Amount
    } else {
      mergedorderList.push(orderListHistory[j])
      i++
    }
  }
  return mergedorderList
}

const mergeorderListHistory = (charaId) => {
  if (Settings.get().merge_order === 'on') {
    getData(`chara/user/${charaId}`).then((d) => {
      if (d.State === 0 && d.Value) {
        $(`.chara${charaId} .ask .ask_list li[class!=ask]`).hide()
        const askHistory = mergeorderList(d.Value.AskHistory)
        for (let i = 0; i < askHistory.length; i++) {
          const ask = askHistory[i]
          if (ask) $(`.chara${charaId} .ask .ask_list`).prepend(`<li title="${formatDate(ask.TradeTime)}">₵${formatNumber(ask.Price, 2)} / ${formatNumber(ask.Amount, 0)} / +${formatNumber(ask.Amount * ask.Price, 2)}<span class="cancel">[成交]</span></li>`)
        }
        $(`.chara${charaId} .bid .bid_list li[class!=bid]`).hide()
        const bidHistory = mergeorderList(d.Value.BidHistory)
        for (let i = 0; i < bidHistory.length; i++) {
          const bid = bidHistory[i]
          if (bid) $(`.chara${charaId} .bid .bid_list`).prepend(`<li title="${formatDate(bid.TradeTime)}">₵${formatNumber(bid.Price, 2)} / ${formatNumber(bid.Amount, 0)} / -${formatNumber(bid.Amount * bid.Price, 2)}<span class="cancel">[成交]</span></li>`)
        }
      }
    })
  }
}

const showOwnTemple = (charaId) => {
  const pre_temple = Settings.get().pre_temple
  const temples = $(`#grailBox.chara${charaId} .assets_box #lastTemples.assets .item`)
  const me = getMe()
  for (let i = 0; i < temples.length; i++) {
    const user = temples[i].querySelector('.name a').href.split('/').pop()
    if (user === me) {
      temples[i].classList.add('my_temple')
      temples[i].classList.remove('replicated')
      if (pre_temple === 'on') $(`#grailBox.chara${charaId} .assets_box #lastTemples.assets`).prepend(temples[i])
      break
    }
  }
  $(`#grailBox.chara${charaId} #expandButton`).on('click', () => { showOwnTemple(charaId) })
}

const changeTempleCover = (charaId) => {
  const setChaosCube = (temple) => {
    $('#chaosCubeButton').on('click', () => {
      const templeId = temple.CharacterId
      const itemsSetting = ItemsSetting.get()
      itemsSetting.chaosCube = templeId
      ItemsSetting.set(itemsSetting)
    })
  }

  const addButton = (temple, user) => {
    $('#TB_window .action').append(`<button id="changeCoverButton2" class="text_button" title="修改圣殿封面">[修改]</button>
                                    <button id="copyCoverButton" class="text_button" title="复制圣殿图片为自己圣殿的封面">[复制]</button>`)
    $('#changeCoverButton2').on('click', () => {
      const cover = prompt('图片url(你可以复制已有圣殿图片的url)：')
      const url = 'https://tinygrail.oss-cn-hangzhou.aliyuncs.com/' + cover.match(/cover\/\S+\.jpg/)[0]
      postData(`chara/temple/cover/${charaId}/${temple.UserId}`, url).then((d) => {
        if (d.State === 0) {
          alert('更换封面成功。')
          $('#TB_window img.cover').attr('src', cover)
          $(`#grailBox.chara${charaId} .assets_box .assets .item`).each(function () {
            if (user === this.querySelector('.name a').href.split('/').pop()) { $(this).find('div.card').css({ 'background-image': 'url(https://tinygrail.mange.cn/' + cover.match(/cover\/\S+\.jpg/)[0] + '!w150)' }) }
          })
        } else {
          alert(d.Message)
        }
      })
    })

    $('#copyCoverButton').on('click', () => {
      const cover = $('#TB_window .container .cover').attr('src')
      const url = 'https://tinygrail.oss-cn-hangzhou.aliyuncs.com/' + cover.match(/cover\/\S+\.jpg/)[0]
      postData(`chara/temple/cover/${charaId}`, url).then((d) => {
        if (d.State === 0) {
          alert('更换封面成功。')
          location.reload()
        } else {
          alert(d.Message)
        }
      })
    })
  }

  $(`#grailBox.chara${charaId} .assets .item`).on('click', (e) => {
    const me = getMe()
    const $el = $(e.currentTarget)
    let temple = $el.data('temple')
    let isLink = false
    if (temple === undefined && ($el.hasClass('left') || $el.hasClass('right'))) {
      temple = $el.find('.card').data('temple')
      isLink = true
    }
    if (temple === undefined) return
    let user = temple.Name
    if (temple.LinkId === parseInt(charaId)) {
      user = $el.siblings('.item').find('.card').data('temple').Name
    }
    if (user !== me && temple.CharacterId !== parseInt(charaId)) return
    if (isLink) {
      if (user === me) setChaosCube(temple)
      else addButton(temple, user)
    } else {
      launchObserver({
        parentNode: document.body,
        selector: '#TB_window .action',
        successCallback: () => {
          if (user === me) setChaosCube(temple)
          else addButton(temple, user)
        }
      })
    }
  })
}

const showOwnLink = (charaId) => {
  const pre_link = Settings.get().pre_temple
  const links = $(`#grailBox.chara${charaId} .assets_box #lastLinks.assets .link.item`)
  const me = getMe()
  for (let i = 0; i < links.length; i++) {
    const user = links[i].querySelector('.name a').href.split('/').pop()
    if (user === me) {
      links[i].classList.add('my_link')
      if (pre_link === 'on') $(links[i]).siblings('.rank.item').after(links[i])
      break
    }
  }
}

const openHistoryDialog = (chara, page) => {
  const dialog = `<div class="title">上${page}周拍卖结果 - #${chara.Id} 「${chara.Name}」 ₵${formatNumber(chara.Current, 2)} / ${formatNumber(chara.Total, 0)}</div>
                  <div class="desc" style="display:none"></div>
                  <div class="result" style="display:none; max-height: 500px; overflow: auto;"></div>
                  <div class="page_inner">
                  <a id="nextweek" class="p" style="display:none; float: left;margin-bottom: 5px;margin-left: 50px;">后一周</a>
                  <a id="lastweek" class="p" style="display:none; float: right;margin-bottom: 5px;margin-right: 50px;">前一周</a>
                  </div>
                  <div class="loading"></div>`
  showDialog(dialog)

  const charaInitPrice = CharaInitPrice.get()
  const week_ms = 7 * 24 * 3600 * 1000
  const templeWeek = Math.floor((new Date() - new Date('2019/10/05')) / week_ms + 1)
  const icoWeek = Math.floor((new Date() - new Date(charaInitPrice[chara.Id].time)) / week_ms + 1)
  const week = Math.min(templeWeek, icoWeek)
  getData(`chara/auction/list/${chara.Id}/${page}`).then((d) => {
    $('#TB_window .loading').hide()
    if (d.State === 0 && d.Value.length > 0) {
      let success = 0
      let total = 0
      d.Value.forEach((a) => {
        let state = 'even'
        let name = '失败'
        if (a.State === 1) {
          success++
          total += a.Amount
          state = 'raise'
          name = '成功'
        }
        const record = `<div class="row"><span class="time">${formatDate(a.Bid)}</span>
                        <span class="user"><a target="_blank" href="/user/${a.Username}">${a.Nickname}</a></span>
                        <span class="price">₵${formatNumber(a.Price, 2)} / ${formatNumber(a.Amount, 0)}</span>
                        <span class="tag ${state}">${name}</span></div>`
        $('#TB_window .result').append(record)
      })
      $('#TB_window .desc').text(`共有${d.Value.length}人参与拍卖，成功${success}人 / ${total}股`)
      $('#TB_window .result').show()
    } else {
      $('#TB_window .desc').text('暂无拍卖数据')
    }
    $('#TB_window .desc').show()
    if (page > 1) $('#nextweek').show()
    if (page < week) $('#lastweek').show()
    $('#nextweek').on('click', () => {
      page--
      closeDialog()
      openHistoryDialog(chara, page)
    })
    $('#lastweek').on('click', () => {
      page++
      closeDialog()
      openHistoryDialog(chara, page)
    })
  })
}

const showAuctionHistory = (chara) => {
  const charaId = chara.CharacterId || chara.Id
  const button = '<button id="auctionHistorys" class="text_button">[往期拍卖]</button>'
  $(`#grailBox.chara${charaId} #auctionHistoryButton`).after(button)
  $(`#grailBox.chara${charaId} #auctionHistoryButton`).hide()
  $(`#grailBox.chara${charaId} #auctionHistorys`).on('click', () => {
    openHistoryDialog(chara, 1)
  })
}

const openTradeHistoryDialog = (chara) => {
  const dialog = `<div class="title">交易历史记录 - #${chara.Id} 「${chara.Name}」 ₵${formatNumber(chara.Current, 2)} / ${formatNumber(chara.Total, 0)}</div>
                  <div class="result" style="display:none; max-height: 500px; overflow: auto;"></div>
                  <div class="desc" style="display:none"></div>
                  <div class="loading"></div>`
  showDialog(dialog)

  const loadTradeHistory = (page) => {
    $('#TB_window .loading').hide()
    $('#TB_window .result').show()
    $('#TB_window .result').html('')
    const records = tradeHistory.slice(50 * (page - 1), 50 * page)
    if (records.length) {
      for (let i = 0; i < records.length; i++) {
        const record = `<div class="row">
                        <span class="time" title="交易时间">${formatDate(records[i].Time)}</span>
                        <span class="price" title="价格">₵${formatNumber((records[i].Price / records[i].Amount), 2)}</span>
                        <span class="amount" title="数量">${formatNumber(records[i].Amount, 0)}</span>
                        <span class="price" title="交易额">₵${formatNumber(records[i].Price, 2)}</span>
                        </div>`
        $('#TB_window .result').append(record)
      }
      $('#TB_window .desc').html('')
      $('#TB_window .desc').text(`共有${tradeHistory.length}条记录，当前 ${page} / ${totalPages} 页`)

      for (let i = 1; i <= totalPages; i++) {
        const pager = `<span class="page" data-page="${i}">[${i}]</span>`
        $('#TB_window .desc').append(pager)
      }

      $('#TB_window .desc .page').on('click', (e) => {
        const page = $(e.target).data('page')
        loadTradeHistory(page)
      })

      $('#TB_window .result').show()
    } else {
      $('#TB_window .desc').text('暂无交易记录')
    }
    $('#TB_window .desc').show()
  }

  let tradeHistory, totalPages
  getData(`chara/charts/${chara.Id}/2019-08-08`).then((d) => {
    if (d.State === 0) {
      tradeHistory = d.Value.reverse()
      totalPages = Math.ceil(d.Value.length / 50)
      loadTradeHistory(1)
    }
  })
}

const showTradeHistory = (chara) => {
  const charaId = chara.CharacterId || chara.Id
  $(`#grailBox.chara${charaId} #kChartButton`).after('<button id="tradeHistoryButton" class="text_button">[交易记录]</button>')
  $(`#grailBox.chara${charaId} #tradeHistoryButton`).on('click', () => {
    openTradeHistoryDialog(chara)
  })
}

const showPrice = (chara) => {
  const charaId = chara.CharacterId || chara.Id
  const price = chara.Price.toFixed(2)
  $($(`#grailBox.chara${charaId} .info .text`)[1]).append(`<span>评估价：${price}</span>`)
}

const showTempleRate = (chara) => {
  const charaId = chara.CharacterId || chara.Id
  const rate = chara.Rate
  const level = chara.Level
  getData(`chara/temple/${chara.Id}`).then((d) => {
    const templeAll = { 1: 0, 2: 0, 3: 0 }
    for (let i = 0; i < d.Value.length; i++) {
      templeAll[d.Value[i].Level]++
    }
    const templeRate = rate * (level + 1) * 0.3
    $(`#grailBox.chara${charaId} .assets_box .bold .sub`).attr('title', '活股股息:' + formatNumber(rate, 2))
    $(`#grailBox.chara${charaId} .assets_box .bold .sub`).before(`<span class="sub"> (${templeAll[3]} + ${templeAll[2]} + ${templeAll[1]})</span>`)
    if ($(`#grailBox.chara${charaId} #expandButton`).length) {
      $(`#grailBox.chara${charaId} #expandButton`).before(`<span class="sub" title="圣殿股息:${formatNumber(templeRate, 2)}"> (${formatNumber(templeRate, 2)})</span>`)
    } else {
      launchObserver({
        parentNode: document.querySelector(`#grailBox.chara${charaId}`),
        selector: `#grailBox.chara${charaId} #expandButton`,
        successCallback: () => {
          $(`#grailBox.chara${charaId} #expandButton`).before(`<span class="sub" title="圣殿股息:${formatNumber(templeRate, 2)}"> (${formatNumber(templeRate, 2)})</span>`)
        }
      })
    }
  })
}

const setBuildTemple = (chara) => {
  const charaId = chara.CharacterId || chara.Id
  let button = '<button id="autobuildButton" class="text_button">[自动建塔]</button>'
  if (AutoTempleList.get().some(item => parseInt(item.charaId) === parseInt(charaId))) {
    button = '<button id="autobuildButton" class="text_button">[自动建塔中]</button>'
  }
  if ($(`#grailBox.chara${charaId} #buildButton`).length) $(`#grailBox.chara${charaId} #buildButton`).after(button)
  else $(`#grailBox.chara${charaId} .title .text`).after(button)

  $(`#grailBox.chara${charaId} #autobuildButton`).on('click', () => {
    openBuildDialog(chara)
  })
}

const fixAuctions = (chara) => {
  const charaId = chara.CharacterId || chara.Id
  getData(`chara/user/${chara.Id}/tinygrail/false`).then((d) => {
    chara.Price = d.Value.Price
    chara.State = d.Value.Amount
    let button = '<button id="auctionButton2" class="text_button">[萌王投票]</button>'
    if (d.State === 0 && d.Value.Amount > 0) button = '<button id="auctionButton2" class="text_button">[参与竞拍]</button>'
    $(`#grailBox.chara${charaId} #buildButton`).before(button)
    $(`#grailBox.chara${charaId} #auctionButton`).hide()
    launchObserver({
      parentNode: document.body,
      selector: `#grailBox.chara${charaId} #auctionButton`,
      successCallback: () => {
        $(`#grailBox.chara${charaId} #auctionButton`).hide()
      }
    })
    postData('chara/auction/list', [chara.Id]).then((d) => {
      loadUserAuctions(d)
      $(`#grailBox.chara${charaId} #auctionButton2`).on('click', () => {
        openAuctionDialog(chara, d)
      })
    })
  })
}

const showEndTime = (chara) => {
  const charaId = chara.CharacterId || chara.Id
  const endTime = (chara.End).slice(0, 19)
  $(`#grailBox.chara${charaId} .title .text`).append(`<div class="sub" style="margin-left: 20px">结束时间: ${endTime}</div>`)
}

const showHideBlock = (titleSelector, blockSelector, settings) => {
  const toggleBlock = () => {
    const $linkTitle = $(titleSelector)
    const $linkBlock = $(blockSelector)
    if ($linkTitle.hasClass('hide_grail_block_title')) {
      $linkTitle.removeClass('hide_grail_block_title')
      $linkBlock.removeClass('hide_grail_block')
    } else {
      $linkTitle.addClass('hide_grail_block_title')
      $linkBlock.addClass('hide_grail_block')
    }
  }

  if (settings === 'on') toggleBlock()
  $(titleSelector).css('cursor', 'pointer').attr('title', '显示/隐藏').off('click').on('click', toggleBlock)
}

const showHideLink = (charaId) => {
  const titleSelector = `#grailBox.chara${charaId} .link_desc .link_count`
  const blockSelector = `#grailBox.chara${charaId} #lastLinks`
  const config = Settings.get().hide_link
  showHideBlock(titleSelector, blockSelector, config)
}
const showHideTemple = (charaId) => {
  const titleSelector = `#grailBox.chara${charaId} .temple_desc .temple_count`
  const blockSelector = `#grailBox.chara${charaId} #lastTemples`
  const config = Settings.get().hide_temple
  showHideBlock(titleSelector, blockSelector, config)
}
const showHideBoard = (charaId) => {
  const titleSelector = `#grailBox.chara${charaId} .board_box .desc .bold`
  const blockSelector = `#grailBox.chara${charaId} .board_box .users, #grailBox.chara${charaId} #loadBoardMemeberButton`
  const config = Settings.get().hide_board
  showHideBlock(titleSelector, blockSelector, config)
}

const addCharaInfo = (cid) => {
  try {
    const charaId = cid || parseInt($('#grailBox .title .name a')[0].href.split('/').pop())
    $(`#grailBox.chara${charaId} .assets_box`).addClass('tinygrail-helped')
    followChara(charaId) // 关注角色
    followAuctions(charaId) // 关注竞拍情况
    showInitialPrice(charaId) // 显示发行价
    priceWarning(charaId) // 买入价格过高提醒
    changeBaseAmount(charaId) // 修改初始买卖单股数
    mergeorderListHistory(charaId) // 合并同一时间订单历史记录
    launchObserver({
      parentNode: document.body,
      selector: `#grailBox.chara${charaId} #lastTemples .item`,
      successCallback: () => {
        showOwnTemple(charaId) // 显示自己的圣殿
        changeTempleCover(charaId) // 修改他人圣殿封面
      }
    })
    launchObserver({
      parentNode: document.body,
      selector: `#grailBox.chara${charaId} #lastLinks .link.item`,
      successCallback: () => {
        showOwnLink(charaId) // 前置自己的连接
        changeLinkPos(`#grailBox.chara${charaId} #lastLinks`) // 修改连接顺序
      }
    })
    launchObserver({
      parentNode: document.body,
      selector: `#grailBox.chara${charaId} .board_box .users .user`,
      successCallback: () => {
        showHideLink(charaId)
        showHideTemple(charaId)
        showHideBoard(charaId)
      }
    })
    showGallery() // 查看画廊
    getData(`chara/${charaId}`).then((d) => {
      const chara = d.Value
      showAuctionHistory(chara) // 历史拍卖
      showTradeHistory(chara) // 交易记录
      showPrice(chara) // 显示评估价
      showTempleRate(chara) // 显示各级圣殿数量及股息计算值
      setBuildTemple(chara) // 自动建塔
      fixAuctions(chara) // 修改默认拍卖底价和数量
    })
  } catch (e) { console.log(e) }
}

const addICOInfo = (cid) => {
  const charaId = cid || parseInt(location.pathname.split('/').pop())
  $(`#grailBox.chara${charaId} .trade .money`).addClass('tinygrail-helped')
  followChara(charaId) // 关注角色
  getData(`chara/${charaId}`).then((d) => {
    const chara = d.Value
    showEndTime(chara) // 显示结束时间
    setBuildTemple(chara) // 自动建塔
    setFullFillICO(chara) // 自动补款
  })
}

export { addCharaInfo, addICOInfo }
