import { getData, postData } from '../../utils/api'

import { formatNumber } from '../../utils/formatter'

export const joinAuctions = async (ids) => {
  for (let i = 0; i < ids.length; i++) {
    const Id = ids[i]
    await postData('chara/auction/list', [Id]).then((d) => {
      let myAuctionAmount = 0
      if (d.Value.length) myAuctionAmount = d.Value[0].Amount
      if (myAuctionAmount) {
        const myAuction = `<span class="my_auction auction_tip" title="出价 / 数量">₵${formatNumber(d.Value[0].Price, 2)} / ${myAuctionAmount}</span>`
        $(`.item_list[data-id=${Id}] .time`).after(myAuction)
      } else {
        getData(`chara/user/${Id}/tinygrail/false`).then((d) => {
          const price = Math.ceil(d.Value.Price * 100) / 100
          const amount = 1
          postData(`chara/auction/${Id}/${price}/${amount}`, null).then((d) => {
            if (d.State === 0) {
              const myAuction = `<span class="my_auction auction_tip" title="出价 / 数量">₵${price} / ${amount}</span>`
              $(`.item_list[data-id=${Id}] .time`).after(myAuction)
            } else {
              console.log(d.Message)
            }
          })
        })
      }
    })
  }
}
