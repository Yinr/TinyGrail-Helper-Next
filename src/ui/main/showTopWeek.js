import { getData, postData } from '../../utils/api'
import { formatNumber } from '../../utils/formatter'

import { openAuctionDialog } from '../trade/openAuctionDialog'

export const showTopWeek = () => {
  getData('chara/topweek').then((d) => {
    let totalExtra = 0; let totalPeople = 0
    for (let i = 0; i < d.Value.length; i++) {
      totalExtra += d.Value[i].Extra
      totalPeople += d.Value[i].Type
    }
    console.log(totalExtra + '/' + totalPeople + '=' + totalExtra / totalPeople)
    $('#topWeek .auction_button').hide()
    for (let i = 0; i < d.Value.length; i++) {
      const score = d.Value[i].Extra + d.Value[i].Type * totalExtra / totalPeople
      const tag = $('#topWeek .assets .item')[i].querySelector('.tag')
      $(tag).attr('title', '综合得分:' + formatNumber(score, 2))
      const average = (d.Value[i].Extra + d.Value[i].Price * d.Value[i].Sacrifices) / d.Value[i].Assets
      const buff = $('#topWeek .assets .item')[i].querySelector('.buff')
      $(buff).attr('title', '平均拍价:' + formatNumber(average, 2))
      const charaId = d.Value[i].CharacterId
      const auction_button = $(`<div class="name auction" data-id="${charaId}">
              <span title="竞拍人数 / 竞拍数量 / 拍卖总数">${d.Value[i].Type} / ${d.Value[i].Assets} / ${d.Value[i].Sacrifices}</span></div>`)
      $($('#topWeek .assets .item')[i]).append(auction_button)
      const chara = { Id: d.Value[i].CharacterId, Name: d.Value[i].CharacterName, Price: d.Value[i].Price, State: d.Value[i].Sacrifices, Total: 0 }
      auction_button.css('cursor', 'pointer').on('click', () => {
        postData('chara/auction/list', [charaId]).then((d) => {
          openAuctionDialog(chara, d)
        })
      })
    }
  })
}
