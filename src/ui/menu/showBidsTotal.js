import { getData } from '../../utils/api'

import { formatNumber, formatMoney } from '../../utils/formatter'

const bindShowBidsTotal = () => {
  // bind to tinygrail menu
  $('#bidMenu').on('click', () => {
    $('#bidsTotalInfo').remove()
    $('#eden_tpc_list ul').prepend('<li id="bidsTotalInfo" class="line_odd item_list item_function" style="text-align: center;">[统计买单总额]</li>')

    const calculateBidsTotal = () => {
      $('#bidsTotalInfo').off('click').text('[买单统计中，请稍候...]')
      getAllBids().then(res => {
        if (res) {
          $('#bidsTotalInfo').text(res)
        } else {
          $('#bidsTotalInfo').text('[买单统计出错，点击重试]').on('click', calculateBidsTotal)
        }
      })
    }

    $('#bidsTotalInfo').on('click', calculateBidsTotal)
  })
}

const getAllBids = async () => {
  let bidsRes = await getData('chara/bids/0/1/50').catch(e => console.warn('统计买单总额时获取买单信息失败', e))
  if (!bidsRes) return false
  if (bidsRes.State === 0 && bidsRes.Value) {
    if (bidsRes.Value.TotalPages > 1) {
      const totalItems = bidsRes.Value.TotalItems
      bidsRes = await getData(`chara/bids/0/1/${totalItems}`).catch(e => console.warn('统计买单总额时获取买单信息失败', e))
      if (!bidsRes) return false
    }
    const bidsCharas = []
    bidsRes.Value.Items.forEach(chara => {
      if (!bidsCharas.some(i => i.CharacterId === chara.CharacterId)) bidsCharas.push(chara)
    })
    return await sumBids(bidsCharas)
  } else if (bidsRes.State !== 0) {
    console.warn(bidsRes)
    return false
  }
}

const sumBids = async (charas) => {
  let sum = 0
  let count = 0
  for (let i = 0; i < charas.length; i++) {
    const d = await getData(`chara/user/${charas[i].CharacterId}`).catch(e => console.warn(e))
    if (d.State === 0) {
      sum += d.Value.Bids.reduce((s, i) => s + i.Price * i.Amount, 0)
      count += d.Value.Bids.length
    } else {
      console.warn(d)
    }
  }
  return `共有 ${formatNumber(count, 0)} 买单，涉及 ${formatNumber(charas.length, 0)} 角色，合计 ${formatMoney(sum)}`
}

export { bindShowBidsTotal }
