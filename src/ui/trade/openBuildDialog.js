import { showDialog } from '../../utils/dialog'

import { autoBuildTemple } from '../../trade/temple'

import { AutoTempleList } from '../../config/autoTempleList'

export const openBuildDialog = (chara) => {
  const autoTempleList = AutoTempleList.get()
  const charaId = chara.CharacterId || chara.Id
  let target = 500; let bidPrice = 10
  const temple = autoTempleList.find(temple => parseInt(temple.charaId) === charaId)
  if (temple !== undefined) {
    target = parseInt(temple.target)
    bidPrice = parseFloat(temple.bidPrice)
  }

  const dialog = `<div class="title" title="目标数量 / 买入价格">
                  自动建塔 - #${charaId} 「${chara.Name}」 ${target} / ₵${bidPrice}</div>
                  <div class="desc"><p>当已献祭股数+持有股数达到目标数量时将自动建塔</p>
                  输入 目标数量 / 买入价格(不超过此价格的卖单将自动买入)</div>
                  <div class="desc action"><p>便捷设定圣殿等级：
                    <span data-lv="1" class="text_button setToLv">[一级]</span>
                    <span data-lv="2" class="text_button setToLv">[二级]</span>
                    <span data-lv="3" class="text_button setToLv">[三级]</span></p></div>
                  <div class="label"><div class="trade build">
                  <input class="target" type="number" style="width:150px" title="目标数量" min="0" step="1" value="${target}">
                  <input class="bidPrice" type="number" style="width:100px" title="卖出下限" min="0" value="${bidPrice}">
                  <button id="startBuildButton" class="active">自动建塔</button><button id="cancelBuildButton">取消建塔</button></div></div>
                  <div class="loading" style="display:none"></div>`
  const { closeDialog } = showDialog(dialog)

  $('#cancelBuildButton').on('click', function () {
    const autoTempleList = AutoTempleList.get()
    const index = autoTempleList.findIndex(temple => parseInt(temple.charaId) === charaId)
    if (index >= 0) {
      autoTempleList.splice(index, 1)
      AutoTempleList.set(autoTempleList)
      alert(`取消自动建塔${chara.Name}`)
    }
    $(`#grailBox.chara${charaId} #autobuildButton`).text('[自动建塔]')
    closeDialog()
  })

  $('#startBuildButton').on('click', function () {
    const info = {
      charaId: parseInt(charaId),
      name: chara.Name,
      target: parseInt($('.trade.build .target').val()),
      bidPrice: parseFloat($('.trade.build .bidPrice').val())
    }
    const autoTempleList = AutoTempleList.get()
    const index = autoTempleList.findIndex(temple => parseInt(temple.charaId) === charaId)
    if (index >= 0) {
      autoTempleList.splice(index, 1)
      autoTempleList.unshift(info)
    } else autoTempleList.unshift(info)
    AutoTempleList.set(autoTempleList)
    alert(`启动自动建塔#${info.charaId} ${info.name}`)
    closeDialog()
    $(`#grailBox.chara${charaId} #autobuildButton`).text('[自动建塔中]')
    autoBuildTemple([info])
  })

  $('.action .setToLv').on('click', e => {
    const level = $(e.target).data('lv')
    $('.trade.build .target').val(Math.pow(5, level - 1) * 500)
  })
}
