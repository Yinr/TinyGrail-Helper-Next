import { postData } from '../../utils/api'
import { showDialog } from '../../utils/dialog'

import { loadFollowChara } from './loadFollowChara'
import { loadFollowAuction } from './loadFollowAuction'
import { generateCharacterList, loadCharacterList } from './loadCharacterList'
import { joinAuctions } from './joinAuctions'

import { autoJoinICO, autoBeginICO, addFillICO, fullfillICO } from '../../trade/ico'
import { addBuildTemple, autoBuildTemple } from '../../trade/temple'

import { FollowList } from '../../config/followList'

let charasList = []

const getCharasList = () => {
  const charas = $('.bibeBox textarea').val().split('\n')
  for (let i = 0; i < charas.length; i++) {
    try {
      const charaId = parseInt(charas[i].match(/(character\/|crt\/)?(\d+)/)[2])
      charasList.push(charaId)
    } catch (e) {}
  }
  return charasList
}

const loadTemperaryList = (page) => {
  const start = 50 * (page - 1)
  const ids = charasList.slice(start, start + 50)
  console.log(ids)
  const totalPages = Math.ceil(charasList.length / 50)
  generateCharacterList(ids).then(list => {
    loadCharacterList(list, page, totalPages, loadTemperaryList, 'chara', false)
  })
}

export const createTemporaryList = () => {
  charasList = []

  const batchElement = {
    basic: (text, desc, example) => `<span class="batch-element" title="${desc}, 例如：\n${example}">${text}</span>`,
    int: (text, desc, example = '1\n20') => batchElement.basic(text, desc, example),
    float: (text, desc, example = '1\n0.1\n3.14') => batchElement.basic(text, desc, example),
    boolean: (text, desc, example = '1（是）\nY（是）\n0（否）\nN（否）') => batchElement.basic(text, desc, example)
  }
  batchElement.splitor = batchElement.basic(',', '分隔符', ',（逗号）\n （空格）\n\t（制表符）')
  batchElement.id = batchElement.basic('ID', '角色 ID 或网址', '29282\nhttps://bgm.tv/character/29282')

  const dialog = `
    <div class="batch-tab-titlebar dialog-tab-titlebar">
      <div data-tabid="batch-tab-temp" class="batch-tab-title dialog-tab-title open">临时列表</div>
      <div data-tabid="batch-tab-onekey" class="batch-tab-title dialog-tab-title">一键操作</div>
      <div data-tabid="batch-tab-trade" class="batch-tab-title dialog-tab-title">批量交易</div>
    </div>
    <div class="batch-tab-content">
      <div class="bibeBox" style="padding:10px">
        <label class="batch-tab-temp dialog-tab-content">
          在超展开左边创建角色列表 请输入角色url或id，如 https://bgm.tv/character/29282 或 29282，一行一个
        </label>
        <label class="batch-tab-onekey dialog-tab-content" style="display: none;">
          一键参与凑人头或开启ICO 请输入角色url或id，如 https://bgm.tv/character/29282 或 29282，一行一个
        </label>
        <label class="batch-tab-trade dialog-tab-content" style="display: none;">
          按照以下格式录入数据后进行批量操作<small>(鼠标移入下方元素显示示例)</small><br>
          -<span title="批量设置自动建塔, 格式如下\n29282, 520.00, 12500\n29282, 10, 500">批量自动建塔</span>：<br>
            &nbsp;${batchElement.id} ${batchElement.splitor}
            ${batchElement.float('价格', '自动建塔买入时最低价格', '10\n520.00')} ${batchElement.splitor}
            ${batchElement.int('目标献祭值', '目标建塔数量', '500\n2500')}<br>
          -<span title="批量设置自动补款, 格式如下\n29282, 11, L, 0\n29282, 11, H, 1">批量自动补款</span>：<br>
            &nbsp;${batchElement.id} ${batchElement.splitor}
            ${batchElement.int('目标等级', '自动补款目标等级', '0（取消自动补款）\n1\n2')} ${batchElement.splitor}
            ${batchElement.basic('补款类型', '自动补款类型（详见自动补款界面）', 'L：按不爆注的最低等级补款\nH：按能达到的最高等级补款')} ${batchElement.splitor}
            ${batchElement.boolean('立即补款', '是否立即补款')}
        </label>
        <textarea rows="10" class="quick" name="urls"></textarea>
        <div class="batch-tab-temp dialog-tab-content">
          <input class="inputBtn" value="创建列表" id="submit_list" type="submit" style="padding: 3px 5px;">
          <input class="inputBtn" value="关注角色" id="add_follow" type="submit" style="padding: 3px 5px;">
          <input class="inputBtn" value="关注竞拍" id="add_auction" type="submit" style="padding: 3px 5px;">
        </div>
        <div class="batch-tab-onekey dialog-tab-content" style="display: none;">
          <input class="inputBtn" value="参与竞拍" id="join_auction" type="submit" style="padding: 3px 5px;">
          <input class="inputBtn" value="参与 ICO" id="join_ico" type="submit" style="padding: 3px 5px;">
          <input class="inputBtn" value="启动 ICO" id="begin_ico" type="submit" style="padding: 3px 5px;">
        </div>
        <div class="batch-tab-trade dialog-tab-content" style="display: none;">
          <input class="inputBtn" value="批量建塔" id="trade_auto_temple" type="submit" style="padding: 3px 5px;">
          <input class="inputBtn" value="批量补款" id="trade_auto_fill_ico" type="submit" style="padding: 3px 5px;">
        </div>
      </div>
    </div>`
  const { closeDialog } = showDialog(dialog, { closeBefore: true })

  $('.dialog-tab-title').on('click', e => {
    $('.dialog-tab-content').hide()
    $(`.dialog-tab-content.${e.target.dataset.tabid}`).show()
    $('.dialog-tab-title').removeClass('open')
    $(e.target).addClass('open')
  })

  // 临时列表
  $('#submit_list').on('click', () => {
    getCharasList()
    loadTemperaryList(1)
    closeDialog()
  })
  $('#add_follow').on('click', () => {
    getCharasList()
    const followList = FollowList.get()
    for (let i = 0; i < charasList.length; i++) {
      const charaId = charasList[i]
      if (followList.charas.includes(charaId)) {
        followList.charas.splice(followList.charas.indexOf(charaId), 1)
        followList.charas.unshift(charaId)
      } else {
        followList.charas.unshift(charaId)
      }
      FollowList.set(followList)
    }
    loadFollowChara(1)
    closeDialog()
  })
  $('#add_auction').on('click', () => {
    getCharasList()
    const followList = FollowList.get()
    for (let i = 0; i < charasList.length; i++) {
      const charaId = charasList[i]
      if (followList.auctions.includes(charaId)) {
        followList.auctions.splice(followList.auctions.indexOf(charaId), 1)
        followList.auctions.unshift(charaId)
      } else {
        followList.auctions.unshift(charaId)
      }
      FollowList.set(followList)
    }
    loadFollowAuction(1)
    closeDialog()
  })

  // 一键操作
  $('#join_auction').on('click', () => {
    getCharasList()
    $('#eden_tpc_list ul').html('')
    loadTemperaryList(1)
    joinAuctions(charasList)
    closeDialog()
  })
  $('#join_ico').on('click', () => {
    getCharasList()
    postData('chara/list', charasList).then((d) => {
      autoJoinICO(d.Value)
      loadTemperaryList(1)
      closeDialog()
    })
  })
  $('#begin_ico').on('click', () => {
    getCharasList()
    $('#begin_ico').attr('value', '正在开启 ICO...').closest('.bibeBox').find('.inputBtn').attr('disabled', true)
    autoBeginICO(charasList).then(() => {
      loadTemperaryList(1)
      closeDialog()
    })
  })

  // 批量交易
  const regElement = {
    int: '(\\d+)',
    float: '(\\d+(?:\\.\\d+)?)',
    boolean: '([01ynYNtTfF])',
    splitor: '[, \\t，|]+',
    id: '(?:character\\/|crt\\/|#)?(\\d+)'
  }
  $('#trade_auto_temple').on('click', () => {
    // 格式：id price count
    $('#trade_auto_temple').attr('value', '正在批量设置自动建塔...').closest('.bibeBox').find('.inputBtn').attr('disabled', true)
    const items = $('.bibeBox textarea').val().split('\n')
    const regAutoTemple = new RegExp(`${regElement.id}${regElement.splitor}${regElement.float}${regElement.splitor}${regElement.int}`, 'i')
    const tradeAutoTempleList = []
    for (let i = 0; i < items.length; i++) {
      try {
        const [, charaId, price, target] = items[i].match(regAutoTemple)
        charasList.push(parseInt(charaId))
        tradeAutoTempleList.push({
          charaId: parseInt(charaId),
          name: '',
          target: parseInt(target),
          bidPrice: parseFloat(price)
        })
      } catch (e) {
        console.debug(`批量建塔第 ${i + 1} 行解析出错: ${items[i]}`)
      }
    }
    postData('chara/list', charasList).then((d) => {
      const list = tradeAutoTempleList.map(item => {
        const chara = d.Value.find(i => i.CharacterId === item.charaId)
        if (chara !== undefined) {
          item.name = chara.Name
        }
        addBuildTemple(item)
        return item
      })
      console.log('批量建塔', list)
      autoBuildTemple(list)
      loadTemperaryList(1)
      closeDialog()
    })
  })
  $('#trade_auto_fill_ico').on('click', () => {
    // 格式：id level type now
    $('#trade_auto_fill_ico').attr('value', '正在批量设置自动补款...').closest('.bibeBox').find('.inputBtn').attr('disabled', true)
    const items = $('.bibeBox textarea').val().split('\n')
    const regAutoICO = new RegExp(`${regElement.id}${regElement.splitor}${regElement.int}${regElement.splitor}([lhLH])${regElement.splitor}${regElement.boolean}`, 'i')
    const tradeAutoICOList = []
    for (let i = 0; i < items.length; i++) {
      try {
        const [, charaId, target, type, now] = items[i].match(regAutoICO)
        charasList.push(parseInt(charaId))
        tradeAutoICOList.push({
          Id: undefined,
          charaId: parseInt(charaId),
          name: '',
          target: parseInt(target),
          fillMin: type.toLowerCase() !== 'h',
          end: undefined,
          now: /[1yt]/i.test(now)
        })
      } catch (e) {
        console.debug(`批量补款第 ${i + 1} 行解析出错: ${items[i]}`)
      }
    }
    console.log('批量补款', tradeAutoICOList)
    postData('chara/list', charasList).then((d) => {
      const charas = d.Value.filter(i => i.Current === undefined)
      const list = []
      tradeAutoICOList.filter(i => charas.some(c => c.CharacterId === i.charaId)).forEach(item => {
        const chara = charas.find(i => i.CharacterId === item.charaId)
        if (chara !== undefined) {
          item.Id = chara.Id
          item.name = chara.Name
          item.end = chara.End
        }
        if (item.target > 0 && item.now) {
          list.push(item)
        } else {
          delete item.now
          addFillICO(item)
        }
      })
      closeDialog()
      if (list.length > 0) {
        console.log('立即批量补款', list)
        fullfillICO(list)
      }
      loadTemperaryList(1)
    })
  })
}
