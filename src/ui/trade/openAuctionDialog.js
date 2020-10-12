import { showDialog } from '../../utils/dialog'
import { formatNumber } from '../../utils/formatter'

import { loadUserAuctions, bidAuction, cancelAuction } from '../../trade/auction'

import { Settings } from '../../config/settings'

export const openAuctionDialog = (chara, auction) => {
  let auction_num = chara.State
  if (Settings.get().auction_num === 'one') auction_num = 1
  const price = Math.ceil(chara.Price * 100) / 100
  const total = formatNumber(price * chara.State, 2)
  const dialog = `<div class="title" title="拍卖底价 / 竞拍数量 / 流通股份">股权拍卖 - #${chara.Id} 「${chara.Name}」 ₵${formatNumber(chara.Price, 2)} / ${chara.State} / ${chara.Total}</div>
                  <div class="desc">
                  <button id="fullfill_auction" class="text_button" title="当竞拍数量未满时补满数量">[补满]</button>
                  <button id="change_amount" class="text_button" title="按修改后的价格确定数量，保持总价不变">[改量]</button>
                  <button id="change_price" class="text_button" title="按修改后的数量确定价格，保持总价不变">[改价]</button>
                  </div><div class="label">
                  <span class="input">价格</span><span class="input">数量</span><span class="total">合计 -₵${total}</span>
                  </div><div class="trade auction">
                  <input class="price" type="number" style="width: 100px" min="${price}" value="${price}">
                  <input class="amount" type="number" style="width: 100px" min="1" max="${chara.State}" value="${auction_num}">
                  <button id="bidAuctionButton" class="active">确定</button><button id="cancelAuctionButton" style="display: none">取消竞拍</button></div>
                  <div class="loading" style="display:none"></div>`
  showDialog(dialog)

  $('.assets_box .auction_tip').remove()
  loadUserAuctions(auction)

  $('#cancelAuctionButton').on('click', function () {
    cancelAuction(chara)
  })
  $('#bidAuctionButton').on('click', function () {
    bidAuction(chara)
  })

  if (!auction.Value.length) {
    auction.Value = [{ Price: 0, Amount: 0, Type: 0, State: 0 }]
  }

  if (auction.Value[0].Price) {
    $('.trade.auction .price').val(auction.Value[0].Price)
    $('.trade.auction .amount').val(auction.Value[0].Amount)
    const total = formatNumber(auction.Value[0].Price * auction.Value[0].Amount, 2)
    $('#TB_window .label .total').text(`合计 -₵${total}`)
    $('#cancelAuctionButton').show()
  }

  $('#TB_window .auction input').on('keyup', () => {
    const price = $('.trade.auction .price').val()
    const amount = $('.trade.auction .amount').val()
    const total = formatNumber(price * amount, 2)
    $('#TB_window .label .total').text(`合计 -₵${total}`)
  })
  $('#fullfill_auction').on('click', function () {
    const total_auction = chara.State
    const amount = total_auction - auction.Value[0].Type + auction.Value[0].Amount
    const price = Math.ceil(chara.Price * 100) / 100
    $('.trade.auction .price').val(price)
    $('.trade.auction .amount').val(amount)
    $('#TB_window .label .total').text(`合计 -₵${formatNumber(price * amount, 2)}`)
  })
  $('#change_amount').on('click', function () {
    const price = parseFloat($('.trade.auction .price').val())
    const total = auction.Value[0].Price * auction.Value[0].Amount
    const amount = Math.ceil(total / price)
    $('.trade.auction .amount').val(amount)
    $('#TB_window .label .total').text(`合计 -₵${formatNumber(price * amount, 2)}`)
  })
  $('#change_price').on('click', function () {
    const amount = parseInt($('.trade.auction .amount').val())
    const total = auction.Value[0].Price * auction.Value[0].Amount
    const price = Math.ceil(total / amount * 100) / 100
    $('.trade.auction .price').val(price)
    $('#TB_window .label .total').text(`合计 -₵${formatNumber(price * amount, 2)}`)
  })
}
