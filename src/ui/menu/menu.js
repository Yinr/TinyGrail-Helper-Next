import { loadFollowChara } from './loadFollowChara'
import { loadFollowAuction } from './loadFollowAuction'
import { loadMyICO } from './loadMyICO'
import { loadMyTemple } from './loadMyTemple'
import { loadBalance } from './loadBalance'
import { loadAutoBuild } from './loadAutoBuild'
import { loadAutoFillICO } from './loadAutoFillICO'
import { createTemporaryList } from './createTemporaryList'
import { loadScratch } from './loadScratch'
import { loadMagic } from './loadMagic'
import { sellOut } from './sellOut'
import { cancelBids } from './cancelBids'
import { openSettings } from './openSettings'

const menuItemClicked = (callback) => {
  $('.timelineTabs a').removeClass('focus')
  $('.timelineTabs a').removeClass('top_focus')
  $('#helperMenu').addClass('focus')
  if (callback) callback(1)
}

export const loadHelperMenu = () => {
  const item = `<li><a href="#" id="helperMenu" class="top">助手</a><ul>
    <li><a href="#" id="temporaryList">临时列表</a></li>
    <li><a href="#" id="followChara">关注角色</a></li>
    <li><a href="#" id="followAuction">关注竞拍</a></li>
    <li><a href="#" id="myICO">我的ICO</a></li>
    <li><a href="#" id="myTemple">我的圣殿</a></li>
    <li><a href="#" id="scratch">抽奖</a></li>
    <li><a href="#" id="magic">魔法道具</a></li>
    <li><a href="#" id="balance">资金日志分类</a></li>
    <li><a href="#" id="sell" title="为当前列表角色增加一键卖出按钮">卖出</a></li>
    <li><a href="#" id="autoBuild">自动建塔</a></li>
    <li><a href="#" id="autoICO">自动补款</a></li>
    <li><a href="#" id="cancelBids">取消买单</a></li>
    <li><a href="#" id="settings">设置</a></li>
    </ul></li>`
  $('.timelineTabs').append(item)

  $('#followChara').on('click', () => menuItemClicked(loadFollowChara))
  $('#followAuction').on('click', () => menuItemClicked(loadFollowAuction))
  $('#myICO').on('click', () => menuItemClicked(loadMyICO))
  $('#myTemple').on('click', () => menuItemClicked(loadMyTemple))
  $('#balance').on('click', () => menuItemClicked(loadBalance))
  $('#autoBuild').on('click', () => menuItemClicked(loadAutoBuild))
  $('#autoICO').on('click', () => menuItemClicked(loadAutoFillICO))
  $('#temporaryList').on('click', () => menuItemClicked(createTemporaryList))
  $('#scratch').on('click', () => menuItemClicked(loadScratch))
  $('#magic').on('click', () => menuItemClicked(loadMagic))
  $('#sell').on('click', () => menuItemClicked(sellOut))
  $('#cancelBids').on('click', () => menuItemClicked(cancelBids))
  $('#settings').on('click', () => menuItemClicked(openSettings))
}
