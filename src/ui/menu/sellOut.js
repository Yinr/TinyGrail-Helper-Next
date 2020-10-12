import { getData, postData } from '../../utils/api'

import { CharaInitPrice } from '../../config/charaInitPrice'

export const sellOut = () => {
  $('#eden_tpc_list .item_list').removeAttr('onclick')
  $('#eden_tpc_list .item_list').each((i, e) => {
    const id = $(e).data('id')
    const sell_btn = `<span><small data-id="${id}" class="sell_btn">[卖出]</small></span>`
    if (!$(e).find('.sell_btn').length) {
      $(`#eden_tpc_list li[data-id=${id}] .row`).append(sell_btn)
    }
  })
  $('.sell_btn').on('click', (e) => {
    const id = $(e.target).data('id')
    const charaInitPrice = CharaInitPrice.get()
    if (id) {
      const price_tag = $(`#eden_tpc_list li[data-id=${id}]`).find('div.tag')[0].innerText.match(/₵([0-9]*(\.[0-9]{1,2})?)/)
      const price_now = price_tag ? price_tag[1] : 0 // 获取抽奖时买价
      getData(`chara/${id}`).then((d) => {
        const initPrice = charaInitPrice[id] ? charaInitPrice[id].init_price : d.Value.Price
        const price = Math.max(parseFloat(price_now), parseFloat(initPrice).toFixed(2), d.Value.Current.toFixed(2))
        getData(`chara/user/${id}`).then((d) => {
          const amount = d.Value.Amount
          if (amount) {
            postData(`chara/ask/${id}/${price}/${amount}`, null).then((d) => {
              if (d.Message) console.log(`#${id}: ${d.Message}`)
              else console.log(`卖出委托#${id} ${price}*${amount}`)
            })
          }
        })
      })
    }
    $(`#eden_tpc_list li[data-id=${id}]`).remove()
  })
}
