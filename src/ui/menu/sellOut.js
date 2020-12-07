import { getData, postData } from '../../utils/api'

import { CharaInitPrice } from '../../config/charaInitPrice'

export const sellOut = () => {
  $('#eden_tpc_list .item_list').removeAttr('onclick')
  $('#eden_tpc_list .item_list').each((_, e) => {
    let id = $(e).data('id')
    if (!id) {
      const result = $(e).find('small.time').text().match(/#(\d+)/)
      if (result && result.length > 0) {
        id = result[1]
        $(e).attr('data-id', id).data('id', id)
      }
    }

    if (!id || $(e).find('.sell_btn').length > 0) return

    $(`.sell_btn[data-id=${id}]`).remove()
    $(`#eden_tpc_list li[data-id=${id}] .row`).append(`<span><small data-id="${id}" class="sell_btn">[卖出]</small></span>`)
  })

  $('.sell_btn').off('click').on('click', (e) => {
    const id = $(e.target).data('id')
    if (id) {
      const charaInitPrice = CharaInitPrice.get()
      const priceTagEl = $(`#eden_tpc_list li[data-id=${id}]`).find('div.tag')[0]
      const priceTag = priceTagEl ? priceTagEl.innerText.match(/₵([0-9]*(\.[0-9]{1,2})?)/) : null
      const priceNow = priceTag ? priceTag[1] : 0 // 获取抽奖时买价
      getData(`chara/user/${id}`).then((d) => {
        const amount = d.Value.Amount
        if (amount) {
          getData(`chara/${id}`).then((d) => {
            const initPrice = charaInitPrice[id] ? charaInitPrice[id].init_price : d.Value.Price
            const price = Math.max(parseFloat(priceNow), parseFloat(initPrice).toFixed(2), d.Value.Current.toFixed(2))
            postData(`chara/ask/${id}/${price}/${amount}`, null).then((d) => {
              if (d.Message) console.log(`#${id}: ${d.Message}`)
              else console.log(`卖出委托#${id} ${price}*${amount}`)
            })
          })
        }
      })
    }
    $(`.sell_btn[data-id=${id}]`).remove()
  })
}
