import { getData } from '../../utils/api'

import { loadCharacterList } from './loadCharacterList'

const loadLostTemple = (page) => {
  const lostTemples = []
  getData(`chara/user/temple/0/${page}/500`).then((d) => {
    if (d.State === 0) {
      for (let i = 0; i < d.Value.Items.length; i++) {
        if (d.Value.Items[i].Assets - d.Value.Items[i].Sacrifices < 0) lostTemples.push(d.Value.Items[i])
      }
      loadCharacterList(lostTemples, 2, 2, loadLostTemple, 'temple', false)
    }
    if (page < d.Value.TotalPages) {
      page++
      loadLostTemple(page)
    }
  })
}

export const loadMyTemple = (page) => {
  getData(`chara/user/temple/0/${page}/50`).then((d) => {
    if (d.State === 0) {
      loadCharacterList(d.Value.Items, d.Value.CurrentPage, d.Value.TotalPages, loadMyTemple, 'temple', false)
      if (page === 1) {
        $('#eden_tpc_list ul').prepend('<li id="lostTemple" class="line_odd item_list item_function" style="text-align: center;">[查看受损圣殿]</li>')
        $('#lostTemple').on('click', function () {
          $('#eden_tpc_list ul').html('')
          loadLostTemple(1)
        })
      }
    }
  })
}
