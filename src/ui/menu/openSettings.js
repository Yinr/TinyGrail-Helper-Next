import { showDialog, closeDialog } from '../../utils/dialog'

import { Settings } from '../../config/settings'

export const openSettings = () => { // 设置
  closeDialog()
  const settings = Settings.get()
  const dialog = `<table align="center" width="98%" cellspacing="0" cellpadding="5" class="settings">
    <tbody><tr><td valign="top" width="50%">主页显示/隐藏小圣杯</td><td valign="top">
    <select id="set1"><option value="off" selected="selected">显示</option><option value="on">隐藏</option></select></td></tr>
    <tr><td valign="top" width="50%">将自己圣殿或连接排到第一个显示</td><td valign="top">
    <select id="set2"><option value="on" selected="selected">是</option><option value="off">否</option></td></tr>
    <tr><td valign="top" width="50%">默认拍卖数量</td><td valign="top">
    <select id="set3"><option value="one" selected="selected">1</option><option value="all">全部</option></td></tr>
    <tr><td valign="top" width="50%" title="合并同一时间同一价格的历史订单记录">合并历史订单</td><td valign="top">
    <select id="set4"><option value="on" selected="selected">是</option><option value="off">否</option></td></tr>
    <tr><td valign="top" width="50%">周六自动提醒领取股息</td><td valign="top">
    <select id="set5"><option value="on" selected="selected">是</option><option value="off">否</option></td></tr>
    <tr><td valign="top" width="50%">圣殿画廊</td><td valign="top">
    <select id="set6"><option value="off" selected="selected">关</option><option value="on">开</option></td></tr>
    <tr><td valign="top" width="12%"><input class="inputBtn" value="保存" id="submit_setting" type="submit"></td><td valign="top"></td></tr>
    </tbody></table>`
  showDialog(dialog)

  $('#set1').val(settings.hide_grail)
  $('#set2').val(settings.pre_temple)
  $('#set3').val(settings.auction_num)
  $('#set4').val(settings.merge_order)
  $('#set5').val(settings.get_bonus)
  $('#set6').val(settings.gallery)
  $('#submit_setting').on('click', () => {
    settings.hide_grail = $('#set1').val()
    settings.pre_temple = $('#set2').val()
    settings.auction_num = $('#set3').val()
    settings.merge_order = $('#set4').val()
    settings.get_bonus = $('#set5').val()
    settings.gallery = $('#set6').val()
    Settings.set(settings)
    $('#submit_setting').val('已保存')
    setTimeout(() => { closeDialog() }, 500)
  })
}
