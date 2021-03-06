import { getData, postData } from '../../utils/api'
import { showDialog } from '../../utils/dialog'
import { formatMoney } from '../../utils/formatter'

import { loadCharacterList } from './loadCharacterList'

const loadMyICOAmount = async (charaList) => {
  for (let i = 0; i < charaList.length; i++) {
    const result = await getData(`chara/initial/${charaList[i].Id}`)
    if (result && result.State === 0) {
      const amount = formatMoney(result.Value.Amount)
      const span = $(`#eden_tpc_list li.item_list[data-id=${charaList[i].CharacterId}] .row span`)
      span.find('small.my_amount').remove()
      span.append(`<small class="my_amount" title="已注资 ${amount}">/ ${amount}</small>`)
    }
  }
}

export const loadMyICO = (page) => {
  getData(`chara/user/initial/0/${page}/50`).then(d => {
    if (d.State === 0) {
      postData('chara/list', d.Value.Items.sort((a, b) => (new Date(a.End)) - (new Date(b.End))).map(i => i.CharacterId)).then(d2 => {
        if (d2.State === 0) {
          loadCharacterList(d2.Value, d.Value.CurrentPage, d.Value.TotalPages, loadMyICO, 'ico', false)
        } else {
          loadCharacterList(d.Value.Items.sort((a, b) => (new Date(a.End)) - (new Date(b.End))),
            d.Value.CurrentPage, d.Value.TotalPages, loadMyICO, 'ico', false)
        }
        loadMyICOAmount(d.Value.Items)
        if (d.Value.TotalItems > 0 && page === 1) {
          $('#eden_tpc_list ul').prepend('<li id="copyICO" class="line_odd item_list item_function" style="text-align: center;">[复制我的 ICO]</li>')
          $('#copyICO').on('click', function () {
            getData('chara/user/initial/0/1/1000').then(async d => {
              if (d.Value.TotalItems > 1000) {
                try {
                  d = getData(`chara/user/initial/0/1/${d.Value.TotalItems}`)
                } catch (e) { console.log(`获取全部 ${d.Value.TotalItems} 个 ICO 列表出错`, e) }
              }
              const list_text = d.Value.Items.map(i => `https://bgm.tv/character/${i.CharacterId} ${i.Name}`).join('\n')
              const dialog = `<div class="bibeBox" style="padding:10px">
              <label>我的 ICO 列表（若复制按钮无效，请手动复制）</label>
              <textarea rows="10" class="quick" name="myICO"></textarea>
              <input class="inputBtn" value="复制" id="copy_list" type="submit" style="padding: 3px 5px;">
              </div>`
              showDialog(dialog, { closeBefore: true })

              $('.bibeBox textarea').val(list_text)
              $('#copy_list').on('click', () => {
                $('.bibeBox label').children().remove()
                let res_info = '复制 ICO 列表出错，请手动复制'
                $('.bibeBox textarea').select()
                try {
                  if (document.execCommand('copy')) { res_info = `已复制 ${list_text.split('\n').length} 个 ICO` }
                } catch (e) { console.log('复制 ICO 列表出错', e) }
                $('.bibeBox label').append(`<br><span>${res_info}</span>`)
              })
            })
          })
        }
      })
    }
  })
}
