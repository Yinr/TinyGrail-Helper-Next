import { getData, postData, getDataOrNull } from '../utils/api'
import { removeEmpty } from '../utils/formatter'
import { showDialog, closeDialog } from '../utils/dialog'

import { FollowList } from '../config/followList'
import { FillICOList } from '../config/fillICOList'

const calculateICO = (ico) => {
  let level = 0
  let price = 0
  let amount = 0
  let next = 100000
  let nextUser = 15

  // 人数等级
  const heads = ico.Users
  let headLevel = Math.floor((heads - 10) / 5)
  if (headLevel < 0) headLevel = 0

  // 资金等级
  while (ico.Total >= next && level < headLevel) {
    level += 1
    next += Math.pow(level + 1, 2) * 100000
  }
  if (level) {
    amount = 10000 + (level - 1) * 7500
    price = ico.Total / amount
  }
  nextUser = (level + 1) * 5 + 10

  return { Level: level, Next: next, Price: price, Amount: amount, Users: nextUser - ico.Users }
}

const ICOStandard = (lv) => {
  const users = lv * 5 + 10
  let total = 100000
  let level = 1
  while (lv > level) {
    level++
    total += Math.pow(level, 2) * 100000
  }
  return { Users: users, Total: total }
}

const fullfillICO = async (icoList) => {
  const dialog = `<div class="info_box">
                  <div class="title">自动补款检测中</div>
                  <div class="result" style="max-height:500px;overflow:auto;"></div>
                  </div>`
  if (!$('#TB_window').length) showDialog(dialog)

  for (let i = 0; i < icoList.length; i++) {
    const Id = icoList[i].Id
    const charaId = icoList[i].charaId
    const targetlv = icoList[i].target
    const target = ICOStandard(targetlv)
    await Promise.all([getData(`chara/${charaId}`), getDataOrNull(`chara/initial/${Id}`)]).then(([d, initial]) => {
      if (d.State === 0) {
        const predicted = calculateICO(d.Value)
        if (!(initial && initial.State === 0 && initial.Value && initial.Value.Amount > 0)) {
          // 本人尚未参与 ICO，补款后可增加一个人头
          predicted.Users -= 1
        }
        if (predicted.Level >= targetlv) {
          console.log(charaId + '总额:' + d.Value.Total + ',已达标，无需补款')
          $('.info_box .result').prepend(`<div class="row">#${charaId} 目标: lv${targetlv} 总额: ${d.Value.Total} ,已达标，无需补款</div>`)
        } else if (predicted.Users <= 0) {
          let offer = predicted.Next - d.Value.Total
          if (d.Value.Users >= target.Users) {
            offer = target.Total - d.Value.Total
          }
          offer = Math.max(offer, 5000)
          postData(`chara/join/${Id}/${offer}`, null).then((d) => {
            if (d.State === 0) {
              $('.info_box .result').prepend(`<div class="row">#${charaId} 目标: lv${targetlv} 补款: ${offer}</div>`)
              console.log(charaId + '补款:' + offer)
            } else {
              $('.info_box .result').prepend(`<div class="row">#${charaId} ${d.Message}</div>`)
              console.log(d.Message)
            }
          })
        } else {
          $('.info_box .result').prepend(`<div class="row">#${charaId} 目标: lv${targetlv} 人数: ${d.Value.Users}, 人数不足，未补款</div>`)
          console.log(charaId + '人数:' + d.Value.Users + ',人数不足，未补款')
        }
      }
    })
  }
}

const autoFillICO = () => {
  const fillICOList = FillICOList.get()
  const icoList = []
  for (let i = 0; i < fillICOList.length; i++) {
    const endTime = new Date(new Date(fillICOList[i].end) - (new Date().getTimezoneOffset() + 8 * 60) * 60 * 1000)
    const leftTime = (new Date(endTime).getTime() - new Date().getTime()) / 1000 // 剩余时间：秒
    if (leftTime < 60) {
      console.log(`ico check#${fillICOList[i].charaId} -「${fillICOList[i].name}」 目标等级:lv${fillICOList[i].target} ${leftTime}s left`)
      icoList.push(fillICOList[i])
      delete fillICOList[i]
    }
  }
  FillICOList.set(removeEmpty(fillICOList))
  if (icoList.length) fullfillICO(icoList)
}

const openICODialog = (chara) => {
  const fillICOList = FillICOList.get()
  let target = 1
  const item = fillICOList.find(item => parseInt(item.Id) === chara.Id)
  if (item) {
    target = item.target
  }
  const dialog = `<div class="title">自动补款 - #${chara.CharacterId} 「${chara.Name}」 lv${target}</div>
                  <div class="desc">目标等级：<input type="number" class="target" min="1" max="10" step="1" value="${target}" style="width:50px"></div>
                  <div class="label"><div class="trade ico">
                  <button id="startfillICOButton" class="active">自动补款</button>
                  <button id="fillICOButton" style="background-color: #5fda15;">立即补款</button>
                  <button id="cancelfillICOButton">取消补款</button></div></div>
                  <div class="loading" style="display:none"></div>`
  showDialog(dialog)

  $('#cancelfillICOButton').on('click', function () {
    const fillICOList = FillICOList.get()
    const index = fillICOList.findIndex(item => parseInt(item.Id) === chara.Id)
    if (index >= 0) {
      alert(`取消自动补款${chara.Name}`)
      $(`#grailBox.chara${chara.CharacterId} #followICOButton`).text('[自动补款]')
      fillICOList.splice(index, 1)
      FillICOList.set(fillICOList)
    }
    closeDialog()
    console.log(fillICOList)
  })

  $('#startfillICOButton').on('click', function () {
    const target = parseFloat($('.desc .target').val())
    if (target <= 0 || !Number.isInteger(target)) {
      alert('请输入正整数！')
      return
    }
    const info = {}
    info.Id = parseInt(chara.Id)
    info.charaId = parseInt(chara.CharacterId)
    info.name = chara.Name
    info.target = target
    info.end = chara.End
    const fillICOList = FillICOList.get()
    const index = fillICOList.findIndex(item => parseInt(item.Id) === chara.Id)
    if (index >= 0) {
      fillICOList[index] = info
    } else fillICOList.push(info)
    FillICOList.set(fillICOList)
    alert(`启动自动补款#${chara.Id} ${chara.Name}`)
    $(`#grailBox.chara${chara.CharacterId} #followICOButton`).text('[自动补款中]')
    closeDialog()
    console.log(fillICOList)
  })

  $('#fillICOButton').on('click', function () {
    const target = parseFloat($('.desc .target').val())
    if (target <= 0 || !Number.isInteger(target)) {
      alert('请输入正整数！')
      return
    }
    const info = {}
    info.Id = chara.Id
    info.charaId = chara.CharacterId
    info.name = chara.Name
    info.target = target
    info.end = chara.End
    closeDialog()
    if (confirm(`立即补款#${chara.Id} ${chara.Name} 至 lv${target}`)) {
      fullfillICO([info])
    }
  })
}

const setFullFillICO = (chara) => { // 设置自动补款
  let button = '<button id="followICOButton" class="text_button">[自动补款]</button>'
  if (FillICOList.get().some(item => parseInt(item.charaId) === chara.CharacterId)) {
    button = '<button id="followICOButton" class="text_button">[自动补款中]</button>'
  }
  $(`#grailBox.chara${chara.CharacterId} .title .text`).after(button)
  $(`#grailBox.chara${chara.CharacterId} #followICOButton`).on('click', () => {
    openICODialog(chara)
  })
}

const autoJoinICO = async (icoList) => {
  for (let i = 0; i < icoList.length; i++) {
    const charaId = icoList[i].CharacterId
    await getData(`chara/${charaId}`).then((d) => {
      if (d.State === 0) {
        const offer = 5000
        const Id = d.Value.Id
        if (d.Value.Total < 100000 && d.Value.Users < 15) {
          getData(`chara/initial/${Id}`).then((d) => {
            if (d.State === 1 && d.Message === '尚未参加ICO。') {
              postData(`chara/join/${Id}/${offer}`, null).then((d) => {
                if (d.State === 0) {
                  console.log(`#${charaId} 追加注资成功。`)
                  $(`#eden_tpc_list li[data-id=${charaId}] .row`).append(`<small class="raise">+${offer}</small>`)
                }
              })
            }
          })
        }
      }
    })
  }
}

const autoBeginICO = async (icoList) => {
  for (let i = 0; i < icoList.length; i++) {
    const charaId = icoList[i]
    await getData(`chara/${charaId}`).then(async (d) => {
      if (d.State === 1 && d.Message === '找不到人物信息。') {
        const offer = 10000
        await postData(`chara/init/${charaId}/${offer}`, null).then((d) => {
          if (d.State === 0) {
            console.log(`#${charaId} ICO 启动成功。`)
            $(`#eden_tpc_list li[data-id=${charaId}] .row`).append(`<small class="raise">+${offer}</small>`)
          } else {
            console.log(d.Message)
          }
        })
      }
    })
  }
}

const autoJoinFollowIco = () => {
  const followList = FollowList.get()
  const joinList = []
  if (followList.charas.length) {
    postData('chara/list', followList.charas).then(d => {
      d.Value.forEach(chara => {
        if (chara.End) {
          const endTime = new Date(new Date(chara.End) - (new Date().getTimezoneOffset() + 8 * 60) * 60 * 1000)
          const leftTime = (new Date(endTime).getTime() - new Date().getTime()) / 1000 // 剩余时间：秒
          console.log(`ICO check #${chara.CharacterId} -「${chara.Name}」 ${leftTime}s left`)
          if (leftTime > 0 && leftTime <= 60 * 60) {
            joinList.push(chara)
          }
        }
      })
      autoJoinICO(joinList)
    })
  }
}

export { calculateICO, fullfillICO, autoFillICO, setFullFillICO, autoJoinICO, autoBeginICO, autoJoinFollowIco }
