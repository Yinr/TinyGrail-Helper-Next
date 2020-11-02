import { showDialog, closeDialog } from '../../utils/dialog'

import { Settings } from '../../config/settings'
import { ItemsSetting } from '../../config/itemsSetting'
import { exportConfig, importConfig } from '../../config/export'

export const openSettings = () => { // 设置
  closeDialog()
  const settings = Settings.get()
  const dialog = `<table align="center" width="98%" cellspacing="0" cellpadding="5" class="settings">
    <tbody><tr><td valign="top" width="60%">用户主页小圣杯默认状态</td><td valign="top">
    <select id="set1"><option value="off" selected="selected">显示</option><option value="on">隐藏</option></select></td></tr>
    <tr><td valign="top" width="60%">将自己圣殿或连接排到第一个显示</td><td valign="top">
    <select id="set2"><option value="on" selected="selected">是</option><option value="off">否</option></td></tr>
    <tr><td valign="top" width="60%">默认拍卖数量</td><td valign="top">
    <select id="set3"><option value="one" selected="selected">1</option><option value="all">全部</option></td></tr>
    <tr><td valign="top" width="60%" title="合并同一时间同一价格的历史订单记录">合并历史订单</td><td valign="top">
    <select id="set4"><option value="on" selected="selected">是</option><option value="off">否</option></td></tr>
    <tr><td valign="top" width="60%">周六自动提醒领取股息</td><td valign="top">
    <select id="set5"><option value="on" selected="selected">是</option><option value="off">否</option></td></tr>
    <tr><td valign="top" width="60%">圣殿画廊</td><td valign="top">
    <select id="set6"><option value="off" selected="selected">关</option><option value="on">开</option></td></tr>
    <tr><td valign="top" width="60%">幻想乡自动抽奖金额上限</td><td valign="top">
    <input id="item_set1" type="number" min="0" step="1000" value="0"></td></tr>
    <tr valign="buttom">
      <td><span id="export_setting" style="font-size: smaller; text-decoration: underline; cursor: pointer;">[导入导出设置]</span></td>
      <td><input class="inputBtn" value="保存" id="submit_setting" type="submit"></td>
    </tr>
    </tbody></table>`
  showDialog(dialog)

  $('#set1').val(settings.hide_grail)
  $('#set2').val(settings.pre_temple)
  $('#set3').val(settings.auction_num)
  $('#set4').val(settings.merge_order)
  $('#set5').val(settings.get_bonus)
  $('#set6').val(settings.gallery)
  $('#item_set1').val(ItemsSetting.get().lotusland || 0)
  $('#item_set1').on('change', (e) => {
    const el = e.target
    if (parseInt(el.value) > 3000) {
      el.style.color = 'red'
      el.style.fontWeight = 'bold'
    } else {
      el.style.color = ''
      el.style.fontWeight = ''
    }
  })

  $('#submit_setting').on('click', () => {
    settings.hide_grail = $('#set1').val()
    settings.pre_temple = $('#set2').val()
    settings.auction_num = $('#set3').val()
    settings.merge_order = $('#set4').val()
    settings.get_bonus = $('#set5').val()
    settings.gallery = $('#set6').val()
    Settings.set(settings)
    ItemsSetting.set({ ...ItemsSetting.get(), lotusland: parseInt($('#item_set1').val()) })
    $('#submit_setting').val('已保存')
    setTimeout(() => { closeDialog() }, 500)
  })

  $('#export_setting').on('click', () => {
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
