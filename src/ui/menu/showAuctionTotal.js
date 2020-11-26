import { getData } from '../../utils/api'

import { formatNumber, formatMoney } from '../../utils/formatter'

const bindShowAuctionTotal = () => {
  // bind to tinygrail menu
  $('#auctionMenu').on('click', () => {
    $('#auctionTotalInfo').remove()
    $('#eden_tpc_list ul').prepend('<li id="auctionTotalInfo" class="line_odd item_list item_function" style="text-align: center;">[统计拍卖总额]</li>')

    const calculateAuctionTotal = () => {
      $('#auctionTotalInfo').off('click').text('[拍卖统计中，请稍候...]')
      getAllAuction().then(res => {
        if (res) {
          $('#auctionTotalInfo').text(res)
        } else {
          $('#auctionTotalInfo').text('[拍卖统计出错，点击重试]').on('click', calculateAuctionTotal)
        }
      })
    }

    $('#auctionTotalInfo').on('click', calculateAuctionTotal)
  })
}

const getAllAuction = async () => {
  let page = 0
  const auctionCharas = []
  let retry = false
  do {
    if (!retry) page++
    const auctionRes = await getData(`chara/user/auction/${page}/50`).catch(e => console.warn(`统计拍卖总额时获取第${page}页拍卖信息失败`, e))
    if (auctionRes) {
      retry = false
      if (auctionRes.State === 0 && auctionRes.Value) {
        auctionCharas.push(...auctionRes.Value.Items.filter(i => i.State === 0))
      } else if (auctionRes.State !== 0) {
        console.warn(auctionRes)
      }
    } else { retry = true }
  } while (retry || auctionCharas.length >= 50 * page)
  const sum = auctionCharas.reduce((s, i) => s + i.Price * i.Amount, 0)
  return `共参与 ${formatNumber(auctionCharas.length, 0)} 角色竞拍，合计 ${formatMoney(sum)}`
}

export { bindShowAuctionTotal }
