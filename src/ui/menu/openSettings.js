import { showDialog, closeDialog } from '../../utils/dialog'

import { Settings } from '../../config/settings'
import { ItemsSetting } from '../../config/itemsSetting'
import { exportConfig, importConfig } from '../../config/export'

export const openSettings = () => { // 设置
  closeDialog()
  const settingRowBtn = `
    <tr class="setting-row-btn">
      <td><span class="txtBtn setting-btn-export">[导入导出设置]</span></td>
      <td><input class="inputBtn setting-btn-submit" value="保存" type="submit"></td>
    </tr>
  `
  const autofillItem = (level, charaid) => `
    <tr class="setting-collapse-item ${$('#autofill_collapse').hasClass('setting-collapse-close') ? 'hide-row' : ''}">
      <td title="等级">等级 lv<input class="item_set_level chara-level" type="number" min="0" step="1" value="${level}"></td>
      <td><input class="item_set_source chara-id" type="number" min="0" step="1" value="${charaid}" title="能源角色ID">
        <span class="cancel-autofill-item" title="删除该等级充能设定" style="margin-left: 1em; cursor: pointer;">删除</span></td>
    </tr>
  `
  const dialog = `
    <div class="setting-tab-titlebar">
      <div data-settingid="setting-tab-feat" class="setting-tab-title open">功能</div>
      <div data-settingid="setting-tab-ui" class="setting-tab-title">界面</div>
      <div data-settingid="setting-tab-magic" class="setting-tab-title">魔法</div>
    </div>
    <div class="setting-tab-content">
      <div id="setting-tab-feat" class="setting-tab">
        <table class="settings-tab-table"><tbody>
          <tr><td>默认拍卖数量</td>
            <td><select id="set_auction_num"><option value="one" selected="selected">1</option><option value="all">全部</option></td></tr>
          <tr><td>周六自动提醒领取股息</td>
            <td><select id="set_get_bonus"><option value="on" selected="selected">是</option><option value="off">否</option></td></tr>
          <tr><td title="小圣杯界面左右键切换查看圣殿图">圣殿画廊</td>
            <td><select id="set_gallery"><option value="off" selected="selected">关</option><option value="on">开</option></td></tr>
          <tr><td>合并历史订单</td>
            <td><select id="set_merge_order"><option value="on" selected="selected">是</option><option value="off">否</option></td></tr>
          <tr><td>幻想乡自动抽奖金额上限</td>
            <td><input id="item_set_lotus" type="number" min="0" step="1000" value="0"> cc</td></tr>
          ${settingRowBtn}
        </tbody></table>
      </div>
      <div id="setting-tab-ui" class="setting-tab" style="display: none;">
        <table class="settings-tab-table"><tbody>
          <tr><td>用户主页小圣杯默认显示状态</td>
            <td><select id="set_hide_grail"><option value="off" selected="selected">显示</option><option value="on">隐藏</option></select></td></tr>
          <tr><td>[连接] 默认显示状态</td>
            <td><select id="set_hide_link"><option value="off" selected="selected">显示</option><option value="on">隐藏</option></select></td></tr>
          <tr><td>[圣殿] 默认显示状态</td>
            <td><select id="set_hide_temple"><option value="off" selected="selected">显示</option><option value="on">隐藏</option></select></td></tr>
          <tr><td>[董事会] 默认显示状态</td>
            <td><select id="set_hide_board"><option value="off" selected="selected">显示</option><option value="on">隐藏</option></select></td></tr>
          <tr><td>将自己圣殿或连接排到第一个显示</td>
            <td><select id="set_pre_temple"><option value="on" selected="selected">是</option><option value="off">否</option></td></tr>
          ${settingRowBtn}
        </tbody></table>
      </div>
      <div id="setting-tab-magic" class="setting-tab" style="display: none;">
        <table class="settings-tab-table"><tbody>
          <tr><td>混沌魔方 - 炮塔角色ID</td>
            <td><input id="item_set_chaos" class="chara-id" type="number" min="0" step="1" value="0"></td></tr>
          <tr><td>虚空道标 - 炮塔角色ID</td>
            <td><input id="item_set_guidepost" class="chara-id" type="number" min="0" step="1" value="0"></td></tr>
          <tr><td>虚空道标 - 目标角色ID</td>
            <td><input id="item_set_guidepost_to" class="chara-id" type="number" min="0" step="1" value="0"></td></tr>
          <tr><td title="根据设置自动使用星光碎片为受损 100 股以上的塔进行充能">自动补塔</td>
            <td><select id="item_set_autofill"><option value="on">开</option><option value="off" selected="selected">关</option></td></tr>
          <tr id="autofill_collapse" class="setting-collapse setting-collapse-close"><td title="设置各等级自动充能的能源角色" colspan="2">自动补塔详细设置</td></tr>
          <tr id="add_autofill_item" class="hide-row"><td style="text-align: center; cursor: pointer;" colspan="2">添加补塔等级</td></tr>
          ${settingRowBtn}
        </tbody></table>
      </div>
    </div>
  `
  showDialog(dialog)

  $('.setting-tab-title').on('click', e => {
    $('.setting-tab').hide()
    $(`#${e.target.dataset.settingid}`).show()
    $('.setting-tab-title').removeClass('open')
    $(e.target).addClass('open')
  })

  const settings = Settings.get()
  const itemSetting = ItemsSetting.get()
  $('#set_hide_grail').val(settings.hide_grail)
  $('#set_hide_link').val(settings.hide_link)
  $('#set_hide_temple').val(settings.hide_temple)
  $('#set_hide_board').val(settings.hide_board)
  $('#set_pre_temple').val(settings.pre_temple)
  $('#set_auction_num').val(settings.auction_num)
  $('#set_merge_order').val(settings.merge_order)
  $('#set_get_bonus').val(settings.get_bonus)
  $('#set_gallery').val(settings.gallery)

  // 魔法道具设置
  $('#item_set_lotus').val(itemSetting.lotusland || 0)
  $('#item_set_chaos').val(itemSetting.chaosCube || 0)
  if (itemSetting.guidepost) {
    $('#item_set_guidepost').val(itemSetting.guidepost.monoId || 0)
    $('#item_set_guidepost_to').val(itemSetting.guidepost.toMonoId || 0)
  }
  $('#item_set_autofill').val(itemSetting.autoFill === true ? 'on' : 'off')
  if (itemSetting.stardust) {
    const prePos = $('#add_autofill_item')
    Object.keys(itemSetting.stardust).forEach(i => {
      prePos.before(autofillItem(i, itemSetting.stardust[i]))
    })
  }

  // 幻想乡刮刮乐金额过高提示
  $('#item_set_lotus').on('change', (e) => {
    const el = e.target
    if (parseInt(el.value) > 3000) {
      el.style.color = 'red'
      el.style.fontWeight = 'bold'
    } else {
      el.style.color = ''
      el.style.fontWeight = ''
    }
  })

  // 自动补塔详细设置
  const getAutofill = () => {
    const items = $('#setting-tab-magic tr.setting-collapse-item').toArray()
      .map(el => ({ level: $(el).find('input.item_set_level').val(), charaId: parseInt($(el).find('input.item_set_source').val()) }))
      .filter(item => parseInt(item.level) > 0 && item.charaId > 0)
    const stardust = {}
    items.forEach(item => { stardust[item.level.toString()] = item.charaId })
    return stardust
  }
  $('#autofill_collapse').on('click', () => {
    const self = $('#autofill_collapse')
    if (self.hasClass('setting-collapse-close')) {
      self.removeClass('setting-collapse-close')
      $('tr.setting-collapse-item').removeClass('hide-row')
      $('#add_autofill_item').removeClass('hide-row')
    } else {
      self.addClass('setting-collapse-close')
      $('tr.setting-collapse-item').addClass('hide-row')
      $('#add_autofill_item').addClass('hide-row')
    }
  })
  $('#add_autofill_item').on('click', () => {
    $('#setting-tab-magic tr.setting-collapse-item input.item_set_source[value=0]').closest('tr').remove()
    const levels = $('#setting-tab-magic tr.setting-collapse-item input.item_set_level').toArray().map(el => el.value)
    for (let i = 1; i <= levels.length; i++) {
      if (!levels.includes(i.toString())) {
        $('#add_autofill_item').before(autofillItem(i, 0))
        return
      }
    }
    $('#add_autofill_item').before(autofillItem(levels.length + 1, 0))
  })
  $('#setting-tab-magic').on('click', '.cancel-autofill-item', (e) => $(e.currentTarget).closest('tr').remove())

  // 保存按钮
  $('.setting-btn-submit').on('click', () => {
    settings.hide_grail = $('#set_hide_grail').val()
    settings.hide_link = $('#set_hide_link').val()
    settings.hide_temple = $('#set_hide_temple').val()
    settings.hide_board = $('#set_hide_board').val()
    settings.pre_temple = $('#set_pre_temple').val()
    settings.auction_num = $('#set_auction_num').val()
    settings.merge_order = $('#set_merge_order').val()
    settings.get_bonus = $('#set_get_bonus').val()
    settings.gallery = $('#set_gallery').val()
    Settings.set(settings)
    ItemsSetting.set({
      lotusland: parseInt($('#item_set_lotus').val()),
      autoFill: $('#item_set_autofill').val() === 'on',
      chaosCube: parseInt($('#item_set_chaos').val()),
      guidepost: {
        monoId: parseInt($('#item_set_guidepost').val()),
        toMonoId: parseInt($('#item_set_guidepost_to').val())
      },
      stardust: getAutofill()
    })
    $('#submit_setting').val('已保存')
    setTimeout(() => { closeDialog() }, 500)
  })

  // 导出按钮
  $('.setting-btn-export').on('click', () => {
    const dialog = `<div class="bibeBox" style="padding:10px">
      <label>设置导入/导出</label>
      <p><b>导入方式：</b>将之前导出的设置文本粘贴到下方输入框后点击导入按钮</p>
      <p><b>导出方式：</b>复制下方输入框中内容并妥善保存（若复制按钮无效，请手动复制）</p>
      <textarea rows="10" class="quick" name="setting_value"></textarea>
      <label id="info"></label>
      <input class="inputBtn" value="导入" id="import_setting" type="submit" style="padding: 3px 5px;">
      <input class="inputBtn" value="复制" id="copy_setting" type="submit" style="padding: 3px 5px;">
      </div>`
    closeDialog()
    showDialog(dialog)

    const configValue = exportConfig()
    $('.bibeBox textarea').val(configValue)

    $('#copy_setting').on('click', () => {
      $('.bibeBox label#info').children().remove()
      let resInfo = '复制设置出错，请手动复制'
      $('.bibeBox textarea').select()
      try {
        if (document.execCommand('copy')) { resInfo = '设置已复制，请自行保存以便后续导入' }
      } catch (e) { console.log('复制设置出错', e) }
      $('.bibeBox label#info').append(`<span>${resInfo}</span><br>`)
    })

    $('#import_setting').on('click', () => {
      if (!confirm('导入设置将会覆盖原有设置，确定操作后将无法恢复，是否确定继续？')) return

      $('.bibeBox label#info').children().remove()
      let resInfo = '导入设置出错，请重新检查导入文本'
      const importString = $('.bibeBox textarea').val()
      try {
        const importErrors = importConfig(importString)
        if (importErrors.length === 0) {
          resInfo = '导入成功'
        } else {
          resInfo = `以下设置导入出错，请重新检查导入文本：\n${importErrors.join(', ')}`
          console.warn(resInfo)
        }
        $('.bibeBox label#info').append(`<span>${resInfo}</span><br>`)
      } catch (e) { console.log('导入设置出错', e) }
    })
  })
}
