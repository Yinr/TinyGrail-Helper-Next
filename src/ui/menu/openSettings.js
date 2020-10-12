import { showDialog, closeDialog } from '../../utils/dialog'

import { Settings } from '../../config/settings'
import { ItemsSetting } from '../../config/itemsSetting'

export const openSettings = () => { // 设置
  closeDialog()
  const settings = Settings.get()
  const dialog = `<table align="center" width="98%" cellspacing="0" cellpadding="5" class="settings">
    <tbody><tr><td valign="top" width="60%">主页显示/隐藏小圣杯</td><td valign="top">
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
    <tr><td valign="top" width="12%"><input class="inputBtn" value="保存" id="submit_setting" type="submit"></td><td valign="top"></td></tr>
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
}
