import { getData } from '../../utils/api'
import { showDialog, closeDialog } from '../../utils/dialog'

import { loadCharacterList } from './loadCharacterList'

export const loadMyICO = (page) => {
  getData(`chara/user/initial/0/${page}/50`).then((d) => {
    if (d.State === 0) {
      loadCharacterList(d.Value.Items, d.Value.CurrentPage, d.Value.TotalPages, loadMyICO, 'ico', false)
      if (d.Value.TotalItems > 0 && page === 1) {
        $('#eden_tpc_list ul').prepend('<li id="copyICO" class="line_odd item_list item_function" style="text-align: center;">[复制我的 ICO]</li>')
        $('#copyICO').on('click', function () {
          getData('chara/user/initial/0/1/1000').then(d => {
            const list_text = d.Value.Items.map(i => `https://bgm.tv/character/${i.CharacterId} ${i.Name}`).join('\n')
            closeDialog()
            const dialog = `<div class="bibeBox" style="padding:10px">
              <label>我的 ICO 列表（若复制按钮无效，请手动复制）</label>
              <textarea rows="10" class="quick" name="myICO"></textarea>
              <input class="inputBtn" value="复制" id="copy_list" type="submit" style="padding: 3px 5px;">
              </div>`
            showDialog(dialog)

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
    }
  })
}
