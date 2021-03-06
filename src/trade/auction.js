import { getData, postData } from '../utils/api'

import { formatNumber } from '../utils/formatter'
import { isDayOfWeek } from '../utils/utils'

const loadUserAuctions = (d) => {
  d.Value.forEach((a) => {
    $(`.item_list[data-id=${a.CharacterId}] .user_auction`).remove()
    $(`.item_list[data-id=${a.CharacterId}] .my_auction`).remove()
    if (a.State !== 0) {
      const userAuction = `<span class="user_auction auction_tip" title="竞拍人数 / 竞拍数量">${formatNumber(a.State, 0)} / ${formatNumber(a.Type, 0)}</span>`
      $(`.item_list[data-id=${a.CharacterId}] .time`).after(userAuction)
      $(`#grailBox.chara${a.CharacterId} #auctionHistoryButton`).before(userAuction)
      $('#TB_window.dialog .desc').append(userAuction)
    }
    if (a.Price !== 0) {
      const myAuction = `<span class="my_auction auction_tip" title="出价 / 数量">₵${formatNumber(a.Price, 2)} / ${formatNumber(a.Amount, 0)}</span>`
      $(`.item_list[data-id=${a.CharacterId}] .time`).after(myAuction)
      $(`#grailBox.chara${a.CharacterId} #auctionHistoryButton`).before(myAuction)
      $('#TB_window.dialog .desc').append(myAuction)
    }
  })
}

const loadValhalla = async (ids) => {
  for (let i = 0; i < ids.length; i++) {
    const Id = ids[i]
    await getData(`chara/user/${Id}/tinygrail/false`).then((d) => {
      $(`.item_list[data-id=${Id}] .valhalla`).remove()
      const valhalla = `<small class="even valhalla" title="拍卖底价 / 拍卖数量">₵${formatNumber(d.Value.Price, 2)} / ${d.Value.Amount}</small>`
      $(`.fill_auction[data-id=${Id}]`).before(valhalla)
      if (d.Value.Amount > d.Value.AuctionTotal) {
        const $fillAuc = $(`.fill_auction[data-id=${Id}]`)
        $fillAuc.show()
        $fillAuc.attr('title', $fillAuc.attr('title').replace(/(\(₵\d+\))?$/, `(₵${formatNumber(d.Value.Price * (d.Value.Amount - d.Value.AuctionTotal))})`))
      }
    })
  }
}

const bidAuction = (chara) => {
  $('#TB_window .loading').show()
  $('#TB_window .label').hide()
  $('#TB_window .desc').hide()
  $('#TB_window .trade').hide()
  const price = $('.trade.auction .price').val()
  const amount = $('.trade.auction .amount').val()
  postData(`chara/auction/${chara.Id}/${price}/${amount}`, null).then((d) => {
    $('#TB_window .loading').hide()
    $('#TB_window .label').show()
    $('#TB_window .desc').show()
    $('#TB_window .trade').show()
    if (d.State === 0) {
      const message = d.Value
      $('#TB_window .trade').hide()
      $('#TB_window .label').hide()
      $('#TB_window .desc').text(message)
    } else {
      alert(d.Message)
    }
  })
}

const cancelAuction = (chara) => {
  let message = '确定取消竞拍？'
  if (isDayOfWeek(6)) message = '周六取消竞拍将收取20%税，确定取消竞拍？'
  if (!confirm(message)) return
  $('#TB_window .loading').show()
  $('#TB_window .label').hide()
  $('#TB_window .desc').hide()
  $('#TB_window .trade').hide()
  getData('chara/user/auction/1/100').then((d) => {
    let id = 0
    for (let i = 0; i < d.Value.Items.length; i++) {
      if (chara.Id === d.Value.Items[i].CharacterId) {
        id = d.Value.Items[i].Id
        break
      }
    }
    if (id) {
      postData(`chara/auction/cancel/${id}`, null).then((d) => {
        $('#TB_window .loading').hide()
        $('#TB_window .label').show()
        $('#TB_window .desc').show()
        $('#TB_window .trade').show()
        if (d.State === 0) {
          $('#TB_window .trade').hide()
          $('#TB_window .label').hide()
          $('#TB_window .desc').text('取消竞拍成功')
        } else alert(d.Message)
      })
    } else {
      $('#TB_window .loading').hide()
      $('#TB_window .desc').text('未找到竞拍角色')
    }
  })
}

export { loadUserAuctions, loadValhalla, bidAuction, cancelAuction }
