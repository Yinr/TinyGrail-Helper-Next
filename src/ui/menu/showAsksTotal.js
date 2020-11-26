import { getData } from '../../utils/api'

import { formatNumber } from '../../utils/formatter'

const bindShowAsksTotal = () => {
  // bind to tinygrail menu
  $('#askMenu').on('click', () => {
    $('#asksTotalInfo').remove()
    $('#eden_tpc_list ul').prepend('<li id="asksTotalInfo" class="line_odd item_list item_function" style="text-align: center;">[统计卖单总数]</li>')

    const calculateAsksTotal = () => {
      $('#asksTotalInfo').off('click').text('[卖单统计中，请稍候...]')
      getAllAsks().then(res => {
        if (res) {
          $('#asksTotalInfo').text(res)
        } else {
          $('#asksTotalInfo').text('[卖单统计出错，点击重试]').on('click', calculateAsksTotal)
        }
      })
    }

    $('#asksTotalInfo').on('click', calculateAsksTotal)
  })
}

const getAllAsks = async () => {
  let asksRes = await getData('chara/asks/0/1/50').catch(e => console.warn('统计卖单总数时获取卖单信息失败', e))
  if (!asksRes) return false
  if (asksRes.State === 0 && asksRes.Value) {
    if (asksRes.Value.TotalPages > 1) {
      const totalItems = asksRes.Value.TotalItems
      asksRes = await getData(`chara/asks/0/1/${totalItems}`).catch(e => console.warn('统计卖单总数时获取卖单信息失败', e))
      if (!asksRes) return false
    }
    const asksCharas = []
    asksRes.Value.Items.forEach(chara => {
      if (!asksCharas.some(i => i.CharacterId === chara.CharacterId)) asksCharas.push(chara)
    })
    return await sumAsks(asksCharas)
  } else if (asksRes.State !== 0) {
    console.warn(asksRes)
    return false
  }
}

const sumAsks = async (charas) => {
  let sum = 0
  let count = 0
  for (let i = 0; i < charas.length; i++) {
    const d = await getData(`chara/user/${charas[i].CharacterId}`).catch(e => console.warn(e))
    if (d.State === 0) {
      sum += d.Value.Asks.reduce((s, i) => s + i.Amount, 0)
      count += d.Value.Asks.length
    } else {
      console.warn(d)
    }
  }
  return `共有 ${formatNumber(count, 0)} 卖单，涉及 ${formatNumber(charas.length, 0)} 角色，合计 ${formatNumber(sum, 0)} 股`
}

export { bindShowAsksTotal }
