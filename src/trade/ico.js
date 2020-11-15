import { getData, postData } from '../utils/api'
import { removeEmpty } from '../utils/formatter'
import { showDialog, closeDialog } from '../utils/dialog'

import { FollowList } from '../config/followList'
import { FillICOList } from '../config/fillICOList'

const ICOStandardList = []

const calculateICO = (ico, targetLevel, joined, balance) => {
  ICOStandard(targetLevel)
  // 人数最高等级
  const heads = ico.Users + (joined ? 0 : 1)
  const headLevel = Math.max(Math.floor((heads - 10) / 5), 0)

  // 资金最高等级
  const moneyTotal = ico.Total + (balance || 0)
  const moneyLevel = ICOStandardList.filter(i => i.Total <= moneyTotal).length

  // 最高等级
  const level = balance === undefined ? Math.min(targetLevel, headLevel) : Math.min(targetLevel, headLevel, moneyLevel)
  const levelInfo = level ? ICOStandard(level) : { Amount: 0, Total: 0, Users: 0 }

  const price = Math.max(ico.Total, levelInfo.Total) / levelInfo.Amount
  const needMoney = Math.max(levelInfo.Total - ico.Total, 0)

  let message = ''
  if (headLevel === 0) {
    message = '人数不足'
  } else if (level === 0 && moneyLevel === 0) {
    message = '余额不足'
  } else if (level === targetLevel) {
    message = '设定目标等级'
  } else if (level === headLevel) {
    message = '人数最高等级'
  } else if (level === moneyLevel) {
    message = '余额最高等级'
  }

  return { Level: level, Total: levelInfo.Total, Price: price, Amount: levelInfo.Amount, Users: levelInfo.Users, NeedMoney: needMoney, Message: message }
}

const ICOStandard = (lv) => {
  for (let level = ICOStandardList.length + 1; level <= lv; level++) {
    ICOStandardList.push({
      Level: level,
      Users: level * 5 + 10,
      Amount: (level - 1) * 5 + 10,
      Total: level === 1 ? 100000 : (Math.pow(level, 2) * 100000 + ICOStandardList[level - 1 - 1].Total)
    })
  }
  return ICOStandardList[lv - 1]
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
    const icoInfo = await getData(`chara/${charaId}`).then(d => d.State === 0 ? d.Value : undefined).catch(() => undefined)
    if (icoInfo) {
      const myInitial = await getData(`chara/initial/${Id}`).then(d => d.Value).catch(() => null) // undefined 代表未参与
      const joined = myInitial !== undefined // 本人已参与 ICO
      const balance = await getData('chara/user/assets').then(d => d.Value ? d.Value.Balance : undefined).catch(() => undefined)
      const predicted = calculateICO(icoInfo, targetlv, joined, balance)

      if (!predicted.Level) {
        $('.info_box .result').prepend(`<div class="row">#${charaId} 目标: lv${targetlv} 人数: ${icoInfo.Users}, ${predicted.Message}, 未补款</div>`)
        console.log(`#${charaId},目标:lv${targetlv},人数:${icoInfo.Users},${predicted.Message},未补款`)
      } else if (predicted.NeedMoney > 0) {
        const offer = Math.max(predicted.NeedMoney, 5000)
        const joinRes = await postData(`chara/join/${Id}/${offer}`, null)
        if (joinRes.State === 0) {
          $('.info_box .result').prepend(`<div class="row">#${charaId} 目标: lv${targetlv}, 自动补款至${predicted.Message} lv${predicted.Level}, 补款: ${offer}cc</div>`)
          console.log(`#${charaId},目标:lv${targetlv},自动补款至${predicted.Message}lv${predicted.Level},补款:${offer}cc`)
        } else {
          $('.info_box .result').prepend(`<div class="row">#${charaId} ${joinRes.Message}</div>`)
          console.log(joinRes.Message)
        }
      } else if (predicted.Level === targetlv) {
        $('.info_box .result').prepend(`<div class="row">#${charaId} 目标: lv${targetlv} 总额: ${icoInfo.Total}, 已达标, 无需补款</div>`)
        console.log(`#${charaId},目标:lv${targetlv},总额:${icoInfo.Total},已达标,无需补款`)
      } else {
        $('.info_box .result').prepend(`<div class="row">#${charaId} 目标: lv${targetlv} 总额: ${icoInfo.Total}, 已达到${predicted.Message} lv${predicted.Level}, 未补款</div>`)
        console.log(`#${charaId},目标:lv${targetlv},总额:${icoInfo.Total},已达到${predicted.Message}lv${predicted.Level},未补款`)
      }
    }
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
                  <div class="desc">最高目标等级：<input type="number" class="target" min="1" max="20" step="1" value="${target}" style="width:50px"></div>
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
