import { getData, postData } from '../../utils/api'
import { formatNumber, formatTime } from '../../utils/formatter'
import { normalizeAvatar } from '../../utils/utils'
import { showDialog, closeDialog } from '../../utils/dialog'

import { calculateICO, autoBeginICO } from '../../trade/ico'
import { loadUserAuctions } from '../../trade/auction'

import { FollowList } from '../../config/followList'
import { ItemsSetting } from '../../config/itemsSetting'

let lastEven = false

const renderBalanceLog = (item, even) => {
  const line = even ? 'line_even' : 'line_odd'

  let change = ''
  if (item.Change > 0) {
    change = `<span class="tag raise large">+₵${formatNumber(item.Change, 2)}</span>`
  } else if (item.Change < 0) {
    change = `<span class="tag fall large">-₵${formatNumber(Math.abs(item.Change), 2)}</span>`
  }

  let amount = ''
  if (item.Amount > 0) {
    amount = `<span class="tag new large">+${formatNumber(item.Amount, 0)}</span>`
  } else if (item.Amount < 0) {
    amount = `<span class="tag even large">${formatNumber(item.Amount, 0)}</span>`
  }

  let id = ''
  if (item.Type >= 4 && item.Type <= 13) {
    id = `data-id="${item.RelatedId}"`
  }

  return `<li class="${line} item_list item_log" ${id}>
            <div class="inner">₵${formatNumber(item.Balance, 2)}
              <small class="grey">${formatTime(item.LogTime)}</small>
              <span class="row"><small class="time">${item.Description}</small></span>
            </div>
            <span class="tags">
              ${change}
              ${amount}
            </span>
          </li>`
}

const renderCharacterDepth = (chara) => {
  const depth = `<small class="raise">+${formatNumber(chara.Bids, 0)}</small><small class="fall">-${formatNumber(chara.Asks, 0)}</small><small class="even">${formatNumber(chara.Change, 0)}</small>`
  return depth
}

const renderCharacterTag = (chara, item) => {
  let flu = '--'
  let tclass = 'even'
  if (chara.Fluctuation > 0) {
    tclass = 'raise'
    flu = `+${formatNumber(chara.Fluctuation * 100, 2)}%`
  } else if (chara.Fluctuation < 0) {
    tclass = 'fall'
    flu = `${formatNumber(chara.Fluctuation * 100, 2)}%`
  }

  const tag = `<div class="tag ${tclass}" title="₵${formatNumber(chara.MarketValue, 0)} / ${formatNumber(chara.Total, 0)}">₵${formatNumber(chara.Current, 2)} ${flu}</div>`
  return tag
}

const renderBadge = (item, withCrown, withNew, withLevel) => {
  let badge = ''

  if (withLevel) {
    badge = `<span class="badge level lv${item.Level}">lv${item.Level}</span>`
  }
  if (item.Type === 1 && withNew) {
    badge += `<span class="badge new" title="+${formatNumber(item.Rate, 1)}新番加成剩余${item.Bonus}期">×${item.Bonus}</span>`
  }
  if (item.State > 0 && withCrown) {
    badge += `<span class="badge crown" title="获得${item.State}次萌王">×${item.State}</span>`
  }
  return badge
}

const renderCharacter = (item, type, even, showCancel) => {
  const line = even ? 'line_even' : 'line_odd'
  const amount = `<small title="固定资产">${formatNumber(item.Sacrifices, 0)}</small>`

  const tag = renderCharacterTag(item)
  const depth = renderCharacterDepth(item)
  let id = item.Id
  if (item.CharacterId && item.Id !== item.CharacterId) {
    id = item.CharacterId
    if (type === 'auction') type += '-ico'
  }
  const time = item.LastOrder
  let avatar = `<a href="/rakuen/topic/crt/${id}?trade=true" class="avatar l" target="right"><span class="avatarNeue avatarReSize32 ll" style="background-image:url('${normalizeAvatar(item.Icon)}')"></span></a>`
  let cancel = ''
  if (showCancel) {
    cancel = type.startsWith('auction')
      ? `<small data-id="${id}" class="cancel_auction" title="取消关注竞拍">[取关]</small>`
      : `<span><small data-id="${id}" class="cancel_auction">[取消]</small></span>`
  }
  let badge = renderBadge(item, true, true, true)
  let chara

  if (item.NotExist) {
    chara = `<li class="${line} item_list" data-id="${id}">${avatar}<div class="inner">
              <a href="/rakuen/topic/crt/${id}?trade=true" class="title avatar l" target="right">${item.Name}</a> <small class="grey"></small>
              <div class="row"><small class="time"></small>
              <span><small data-id="${id}" class="reload_chara" title="刷新角色信息" style="display: none;">[重新加载]</small>
                <small data-id="${id}" data-name="${item.Name}" class="begin_ico" title="开启 ICO">[开启 ICO]</small></span>
              </div></div></li>`
  } else if (type === 'auction') {
    chara = `<li class="${line} item_list" data-id="${id}">${avatar}<div class="inner">
              <a href="/rakuen/topic/crt/${id}?trade=true" class="title avatar l" target="right">${item.Name}${badge}</a> <small class="grey">(+${item.Rate.toFixed(2)})</small>
              <div class="row"><small class="time">${formatTime(time)}</small>
              <span><small data-id="${id}" class="fill_auction" title="当竞拍数量未满时补满数量" style="display: none;">[补满]</small>${cancel}</span>
              </div></div>${tag}</li>`
  } else if (type === 'temple') {
    let costs = ''
    if (item.Assets - item.Sacrifices < 0) {
      costs = `<small class="fall" title="损耗">${item.Assets - item.Sacrifices}</small>
                <span><small data-id="${id}" data-lv="${item.CharacterLevel}"  data-cost="${item.Sacrifices - item.Assets}" class="fill_costs">[补充]</small></span>`
    }
    avatar = `<a href="/rakuen/topic/crt/${id}?trade=true" class="avatar l" target="right"><span class="avatarNeue avatarReSize32 ll" style="background-image:url('${normalizeAvatar(item.Cover)}')"></span></a>`
    chara = `<li class="${line} item_list" data-id="${id}" data-lv="${item.CharacterLevel}">${avatar}<div class="inner">
              <a href="/rakuen/topic/crt/${id}?trade=true" class="title avatar l" target="right">${item.Name}<span class="badge lv${item.CharacterLevel}">lv${item.CharacterLevel}</span></a> <small class="grey">(+${item.Rate.toFixed(2)})</small>
              <div class="row"><small class="time" title="创建时间">${formatTime(item.Create)}</small><small title="固有资产 / 献祭值">${item.Assets} / ${item.Sacrifices}</small>${costs}</div></div>
              <div class="tag lv${item.Level}">${item.Level}级圣殿</div></li>`
  } else if (item.Id !== item.CharacterId) { // ico
    const pre = calculateICO(item)
    const percent = formatNumber(item.Total / pre.NextLevel.Total * 100, 0)
    const icoState = item.Users === 0
      ? `<small title="当前人数 / 当前资金">${formatNumber(item.State, 0)} / ${formatNumber(item.Total, 1)}</small>`
      : `<small title="距下级还差${formatNumber(Math.max(pre.NextLevel.Users - item.Users, 0), 0)}人 / 当前资金(占下一等级百分比) / 预计价格">${formatNumber(item.Users, 0)}人 / ${formatNumber(item.Total, 1)}(${percent}%) / ₵${formatNumber(pre.Price, 2)}</small>`
    badge = renderBadge(item, false, false, false)
    chara = `<li class="${line} item_list" data-id="${id}">${avatar}<div class="inner">
              <a href="/rakuen/topic/crt/${id}?trade=true" class="title avatar l" target="right">${item.Name}${badge}</a> <small class="grey">(ICO进行中: lv${pre.Level})</small>
              <div class="row"><small class="time">${formatTime(item.End)}</small><span>${icoState}</span>${cancel}</div></div><div class="tags tag lv${pre.Level}">ICO进行中</div></li>`
  } else {
    chara = `<li class="${line} item_list" data-id="${id}">${avatar}<div class="inner">
              <a href="/rakuen/topic/crt/${id}?trade=true" class="title avatar l" target="right">${item.Name}${badge}</a> <small class="grey">(+${item.Rate.toFixed(2)} / ${formatNumber(item.Total, 0)} / ₵${formatNumber(item.MarketValue, 0)})</small>
              <div class="row"><small class="time">${formatTime(item.LastOrder)}</small>${amount}<span title="买入 / 卖出 / 成交">${depth}</span>
              ${cancel}</div></div>${tag}</li>`
  }

  return chara
}

const listItemClicked = function () {
  const link = $(this).find('a.avatar').attr('href')
  if (link) {
    if (parent.window.innerWidth < 1200) {
      $(parent.document.body).find('#split #listFrameWrapper').animate({ left: '-450px' })
    }
    window.open(link, 'right')
  }
}

const fillCosts = (id, lv, cost) => {
  closeDialog()
  let itemsSetting = ItemsSetting.get()
  const supplyId = itemsSetting.stardust ? itemsSetting.stardust[lv] : ''
  const dialog = `<div class="title" title="用一个角色的活股或固定资产，给另一个角色的圣殿消耗进行补充，目标人物的等级要小于或等于发动攻击圣殿的人物等级">星光碎片</div>
                  <div class="desc" style="display:none"></div>
                  <table align="center" width="98%" cellspacing="0" cellpadding="5" class="settings">
                  <tr><td>能源：<input id="supplyId" type="number" style="width:60px" value="${supplyId}"></td>
                  <td>目标：<input id="toSupplyId" type="number" style="width:60px" value="${id}"></td></tr>
                  <td>类型：<select id="isTemple" style="width:60px"><option value="false">活股</option><option value="true" selected="selected">塔股</option></select></td>
                  <td>数量：<input id="amount" type="number" style="width:60px" value="${cost}"></td></tr>
                  <tr><td><input class="inputBtn" value="充能" id="submit_stardust" type="submit"></td></tr>
                  </tbody></table>`
  showDialog(dialog)

  if (!supplyId) {
    $('#TB_window .desc').text('当前等级的能源角色id未设定，补充过一次之后会记住此等级的能源角色id')
    $('#TB_window .desc').show()
  }
  $('#submit_stardust').on('click', () => {
    const supplyId = parseInt($('#supplyId').val())
    const toSupplyId = parseInt($('#toSupplyId').val())
    const isTemple = $('#isTemple').val()
    const amount = parseInt($('#amount').val())
    if (supplyId) {
      itemsSetting = ItemsSetting.get()
      if (!itemsSetting.stardust) itemsSetting.stardust = {}
      itemsSetting.stardust[lv] = supplyId
      ItemsSetting.set(itemsSetting)
      postData(`magic/stardust/${supplyId}/${toSupplyId}/${amount}/${isTemple}`, null).then((d) => {
        closeDialog()
        if (d.State === 0) alert(d.Value)
        else alert(d.Message)
      })
    } else alert('角色id不能为空')
  })
}

const loadCharacterList = (list, page, total, more, type, showCancel) => {
  $('#eden_tpc_list ul .load_more').remove()
  if (page === 1) $('#eden_tpc_list ul').html('')
  // console.log(list);
  for (let i = 0; i < list.length; i++) {
    const item = list[i]
    // console.log(item);
    if (type === 'balance') {
      const log = renderBalanceLog(item, lastEven)
      $('#eden_tpc_list ul').append(log)
    } else {
      const chara = renderCharacter(item, type, lastEven, showCancel)
      $('#eden_tpc_list ul').append(chara)
    }
    lastEven = !lastEven
  }

  $('.cancel_auction').off('click')
  $('.cancel_auction').on('click', (e) => {
    // if (!confirm('确定取消关注？')) return;
    const id = $(e.target).data('id')
    const followList = FollowList.get()
    if (type === 'chara') followList.charas.splice(followList.charas.indexOf(id), 1)
    else if (type === 'auction') followList.auctions.splice(followList.auctions.indexOf(id), 1)
    FollowList.set(followList)
    $(`#eden_tpc_list li[data-id=${id}]`).remove()
  })

  $('.fill_costs').off('click')
  $('.fill_costs').on('click', (e) => {
    const id = $(e.target).data('id')
    const lv = $(e.target).data('lv')
    const cost = $(e.target).data('cost')
    fillCosts(id, lv, cost)
    $(e.target).remove()
  })

  $('.fill_auction').off('click')
  $('.fill_auction').on('click', (e) => {
    e.stopPropagation()
    const id = $(e.target).data('id')
    const isAucDay = (new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Shanghai' }))).getDay() === 6

    getData(`chara/user/${id}/tinygrail/false`).then(d => {
      const aucInfo = {
        basePrice: d.Value.Price,
        totalAmount: d.Value.Amount,
        userCount: d.Value.AuctionUsers,
        userAmount: d.Value.AuctionTotal,
        myPrice: 0,
        myAmount: 0
      }
      postData('chara/auction/list', [id]).then(d => {
        if (d.Value[0]) {
          aucInfo.myPrice = d.Value[0].Price
          aucInfo.myAmount = d.Value[0].Amount
          // aucInfo.userCount = d.Value[0].State;
          // aucInfo.userAmount = d.Value[0].Type;
        }
        const remains = aucInfo.totalAmount - aucInfo.userAmount
        if (remains > 0) {
          let price = Math.ceil(aucInfo.basePrice * 100) / 100
          const amount = remains + aucInfo.myAmount
          if (isAucDay && price * amount < aucInfo.myPrice * aucInfo.myAmount) {
            // 竞拍日不撤资
            price = Math.ceil(aucInfo.myPrice * aucInfo.myAmount / amount * 100) / 100
          }
          postData(`chara/auction/${id}/${price}/${amount}`, null).then(d => {
            if (d.State === 0) {
              console.log(`自动补满拍卖 #${id} 耗资 ₵${price * amount}（₵${price} x ${amount}）`)
              postData('chara/auction/list', [id]).then(d => {
                loadUserAuctions(d)
              })
            } else alert(d.Message)
          })
        } else { console.log(`#${id} 已拍满`) }
      })
    })
  })

  $('.begin_ico').off('click')
  $('.begin_ico').on('click', (e) => {
    e.stopPropagation()
    const id = $(e.target).data('id')
    const name = $(e.target).data('name')
    if (confirm(`确定为 #${id}「${name}」开启 ICO？`)) {
      autoBeginICO([id])
    }
  })

  $('.reload_chara').off('click')
  $('.reload_chara').on('click', (e) => {
    e.stopPropagation()
    const id = $(e.target).data('id')
    getNonCharacter(id)
  })

  $('#eden_tpc_list .item_list').on('click', listItemClicked)
  if (page !== total && total > 0) {
    const loadMore = `<li class="load_more"><button id="loadMoreButton" class="load_more_button" data-page="${page + 1}">[加载更多]</button></li>`
    $('#eden_tpc_list ul').append(loadMore)
    $('#loadMoreButton').on('click', function () {
      const page = $(this).data('page')
      if (more) more(page)
    })
  } else {
    let noMore = '暂无数据'
    if (total > 0) { noMore = '加载完成' }

    $('#eden_tpc_list ul').append(`<li class="load_more sub">[${noMore}]</li>`)
  }
}

const updateNonCharacter = chara => {
  const $item = $(`.item_list[data-id=${chara.CharacterId}]`)
  if (chara.Icon) $item.find('span.avatarNeue').css('background-image', `url('${normalizeAvatar(chara.Icon)}')`)
  $item.find('.title.avatar.l').text(chara.Name)
  $item.find('.row .begin_ico').attr('data-name', chara.Name).data('name', chara.Name)
  if (chara.Reload) {
    $item.find('.row .reload_chara').show()
  } else {
    $item.find('.row .reload_chara').hide()
  }
}

const getNonCharacter = id => {
  getData(`/rakuen/topic/crt/${id}`).then(bgmPage => {
    const bgmInfo = bgmPage.match(/class="avatar"><img\s+src="([^"]+)"\s+class="avatar\s+ll"><\/a>\s+<a href=".*"\s+target="_parent">.*<\/a><\/span><br\s*\/>(.+)<\/h1>/)
    updateNonCharacter({
      Id: id,
      CharacterId: id,
      Icon: bgmInfo[1],
      Name: bgmInfo[2],
      NotExist: true
    })
  }).catch(e => {
    console.log(`未开启 ICO 角色 #${id} 信息加载失败`, e)
    updateNonCharacter({
      Id: id,
      CharacterId: id,
      Name: `未知角色 #${id}`,
      Reload: true,
      NotExist: true
    })
  })
  return {
    Id: id,
    CharacterId: id,
    Name: `角色 #${id} 信息加载中...`,
    NotExist: true
  }
}

const generateCharacterList = async ids => {
  const charas = await postData('chara/list', ids)
  const charasInfo = []
  if (charas.State === 0) {
    for (let i = 0; i < ids.length; i++) {
      let item = charas.Value.find(chara => chara.CharacterId === parseInt(ids[i]))
      if (!item) item = getNonCharacter(ids[i])
      charasInfo.push(item)
    }
    return charasInfo
  } else {
    console.log(charas)
  }
}

export { loadCharacterList, generateCharacterList }
