import { postData } from '../../utils/api'
import { showDialog } from '../../utils/dialog'

import { loadCharacterList } from './loadCharacterList'
import { loadScratch } from './loadScratch'

import { ItemsSetting } from '../../config/itemsSetting'

export const loadMagic = () => {
  const itemsSetting = ItemsSetting.get()
  const templeId = itemsSetting.chaosCube || ''
  const monoId = itemsSetting.guidepost ? itemsSetting.guidepost.monoId : ''
  const toMonoId = itemsSetting.guidepost ? itemsSetting.guidepost.toMonoId : ''
  const attackId = itemsSetting.starbreak ? itemsSetting.starbreak.attackId : ''
  const toAttackId = itemsSetting.starbreak ? itemsSetting.starbreak.toAttackId : ''
  const dialog = `<table align="center" width="98%" cellspacing="0" cellpadding="5" class="settings">
    <tr><td title="消耗圣殿10点固定资产，获取随机角色20-200股随机数量">混沌魔方</td>
      <td>炮塔：<input id="chaosCube" type="number" style="width:60px" value="${templeId}"></td><td></td>
      <td><input class="inputBtn" value="发射" id="submit_chaosCube" type="submit"></td></tr>
    <tr><td title="消耗圣殿100点固定资产，获取指定股票10-100股随机数量，目标人物的等级要小于或等于发动攻击圣殿的人物等级">虚空道标</td>
      <td>炮塔：<input id="monoId" type="number" style="width:60px" value="${monoId}"></td>
      <td>目标：<input id="toMonoId" type="number" style="width:60px" value="${toMonoId}"></td>
      <td><input class="inputBtn" value="发射" id="submit_guidepost" type="submit"></td></tr>
    <tr><td title="消耗圣殿100点固定资产，获取指定角色星之力造成一定数量随机伤害，伤害随机范围与二者人物等级差有关">闪光结晶</td>
      <td>炮塔：<input id="attackId" type="number" style="width:60px" value="${attackId}"></td>
      <td>目标：<input id="toAttackId" type="number" style="width:60px" value="${toAttackId}"></td>
      <td><input class="inputBtn" value="发射" id="submit_starbreak" type="submit"></td></tr>
    <tr><td title="用一个角色的活股或固定资产，给另一个角色的圣殿消耗进行补充，补充数量与二者人物等级差有关">星光碎片</td>
      <td>能源：<input id="supplyId" type="number" style="width:60px"></td>
      <td>目标：<input id="toSupplyId" type="number" style="width:60px"></td></tr>
      <td></td><td>类型：<input id="isCirculating" type="checkbox" style="margin: 0 5px;" title="当前版本小圣杯已不支持圣殿股进行充能，勾选以确认使用活股充能">活股</input></td>
      <td>数量：<input id="amount" type="number" style="width:60px" value="100"></td>
      <td><input class="inputBtn" value="充能" id="submit_stardust" type="submit" title="当前版本小圣杯已不支持圣殿股进行充能，勾选活股类型以确认使用活股充能"></td></tr>
    </tbody></table>`
  const { closeDialog } = showDialog(dialog, { closeBefore: true })

  $('#submit_chaosCube').on('click', () => {
    const templeId = parseInt($('#chaosCube').val())
    ItemsSetting.set({ ...ItemsSetting.get(), chaosCube: templeId })
    if (templeId === 0) return
    postData(`magic/chaos/${templeId}`, null).then((d) => {
      closeDialog()
      console.log(d)
      if (d.State === 0) {
        $('#eden_tpc_list ul').html('')
        $('#eden_tpc_list ul').append('<li class="line_odd item_list" style="text-align: center;">[混沌魔方]</li>')
        const Id = d.Value.Id
        const Amount = d.Value.Amount
        const SellPrice = d.Value.SellPrice
        postData('chara/list', [Id]).then((d) => {
          for (let i = 0; i < d.Value.length; i++) {
            d.Value[i].Sacrifices = Amount
            d.Value[i].Current = SellPrice
          }
          loadCharacterList(d.Value, 2, 2, loadScratch, 'chara', false)
        })
      } else alert(d.Message)
    })
  })
  $('#submit_guidepost').on('click', () => {
    const monoId = parseInt($('#monoId').val())
    const toMonoId = parseInt($('#toMonoId').val())
    ItemsSetting.set({ ...ItemsSetting.get(), guidepost: { monoId: monoId, toMonoId: toMonoId } })
    if (monoId === 0 || toMonoId === 0) return
    postData(`magic/guidepost/${monoId}/${toMonoId}`, null).then((d) => {
      closeDialog()
      console.log(d)
      if (d.State === 0) {
        $('#eden_tpc_list ul').html('')
        $('#eden_tpc_list ul').append('<li class="line_odd item_list" style="text-align: center;">[虚空道标]</li>')
        const Id = d.Value.Id
        const Amount = d.Value.Amount
        const SellPrice = d.Value.SellPrice
        postData('chara/list', [Id]).then((d) => {
          for (let i = 0; i < d.Value.length; i++) {
            d.Value[i].Sacrifices = Amount
            d.Value[i].Current = SellPrice
          }
          loadCharacterList(d.Value, 2, 2, loadScratch, 'chara', false)
        })
      } else alert(d.Message)
    })
  })
  $('#submit_starbreak').on('click', () => {
    const attackId = parseInt($('#attackId').val())
    const toAttackId = parseInt($('#toAttackId').val())
    ItemsSetting.set({ ...ItemsSetting.get(), starbreak: { attackId, toAttackId } })
    if (attackId === 0 || toAttackId === 0) return
    postData(`magic/starbreak/${attackId}/${toAttackId}`, null).then((d) => {
      closeDialog()
      console.log(d)
      if (d.State === 0) {
        alert(d.Value)
        $('#eden_tpc_list ul').html('')
        $('#eden_tpc_list ul').append('<li class="line_odd item_list" style="text-align: center;">[闪光结晶]</li>')
        const Amount = d.Value.match(/造成([0-9]+)点伤害/)[1]
        postData('chara/list', [attackId, toAttackId]).then((d) => {
          d.Value[1].Sacrifices = Amount
          loadCharacterList(d.Value, 2, 2, null, 'chara', false)
        })
      } else alert(d.Message)
    })
  })
  $('#submit_stardust').on('click', () => {
    const supplyId = $('#supplyId').val()
    const toSupplyId = $('#toSupplyId').val()
    const isTemple = !$('#isCirculating').is(':checked')
    const amount = $('#amount').val()
    if (supplyId === 0 || toSupplyId === 0 || amount === 0) return
    if (isTemple) {
      alert('当前版本小圣杯已不支持圣殿股进行充能，请在[类型]中勾选[活股]以确认使用活股充能')
      return
    }
    postData(`magic/stardust/${supplyId}/${toSupplyId}/${amount}/${isTemple}`, null).then((d) => {
      closeDialog()
      console.log(d)
      if (d.State === 0) {
        alert(d.Value)
        $('#eden_tpc_list ul').html('')
        $('#eden_tpc_list ul').append('<li class="line_odd item_list" style="text-align: center;">[星光碎片]</li>')
        postData('chara/list', [supplyId, toSupplyId]).then((d) => {
          loadCharacterList(d.Value, 2, 2, loadScratch, 'chara', false)
        })
      } else alert(d.Message)
    })
  })
}
