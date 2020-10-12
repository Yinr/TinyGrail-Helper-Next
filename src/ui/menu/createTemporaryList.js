import { postData } from '../../utils/api'
import { showDialog, closeDialog } from '../../utils/dialog'

import { loadFollowChara } from './loadFollowChara'
import { loadFollowAuction } from './loadFollowAuction'
import { loadCharacterList } from './loadCharacterList'
import { joinAuctions } from './joinAuctions'

import { autoJoinICO } from '../../trade/auction'

import { FollowList } from '../../config/followList'

const charasList = []

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
  postData('chara/list', ids).then((d) => {
    if (d.State === 0) {
      loadCharacterList(d.Value, page, totalPages, loadTemperaryList, 'chara', false)
    }
  })
}

export const createTemporaryList = (page) => {
  closeDialog()
  const dialog = `<div class="bibeBox" style="padding:10px">
    <label>在超展开左边创建角色列表 请输入角色url或id，如 https://bgm.tv/character/29282 或 29282，一行一个</label>
    <textarea rows="10" class="quick" name="urls"></textarea>
    <input class="inputBtn" value="创建列表" id="submit_list" type="submit" style="padding: 3px 5px;">
    <input class="inputBtn" value="关注角色" id="add_follow" type="submit" style="padding: 3px 5px;">
    <input class="inputBtn" value="关注竞拍" id="add_auction" type="submit" style="padding: 3px 5px;">
    <input class="inputBtn" value="参与竞拍" id="join_auction" type="submit" style="padding: 3px 5px;">
    <input class="inputBtn" value="参与ICO" id="join_ico" type="submit" style="padding: 3px 5px;">
    </div>`
  showDialog(dialog)
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
}
