import { getData, postData } from '../utils/api'
import { removeEmpty } from '../utils/formatter'
import { showDialog } from '../utils/dialog'

import { FollowList } from '../config/followList'
import { FillICOList } from '../config/fillICOList'

const ICOStandardList = []

const calculateICO = (ico, targetLevel, fillMin, joined, balance) => {
  // 人数最高等级
  const heads = ico.Users + (targetLevel === undefined || joined ? 0 : 1)
  const headLevel = Math.max(Math.floor((heads - 10) / 5), 0)
  ICOStandard((targetLevel || headLevel) + 1)

  // 资金最高等级
  const moneyTotal = ico.Total + (balance || 0)
  const moneyLevel = ICOStandardList.filter(i => i.Total <= moneyTotal).length
  let icoMoneyLevel = Infinity

  // 预期等级
  let level = 0
  if (fillMin) { // 补至最低等级
    // 当前注资等级，不加等号避免资金刚好满足时补至下一等级
    icoMoneyLevel = ICOStandardList.filter(i => i.Total < /* No Equal */ ico.Total).length
    // 当前注资可升等级
    if (balance === undefined || moneyLevel > icoMoneyLevel) icoMoneyLevel++
    level = Math.min(headLevel, icoMoneyLevel, targetLevel)
  } else if (targetLevel === undefined) {
    level = Math.min(headLevel, moneyLevel)
  } else if (balance === undefined) {
    level = Math.min(targetLevel, headLevel)
  } else {
    level = Math.min(targetLevel, headLevel, moneyLevel)
  }
  const levelInfo = ICOStandard(level)

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
    message = fillMin ? '人数最低等级' : '人数最高等级'
  } else if (level === icoMoneyLevel) {
    message = '当前注资最低等级'
    if (levelInfo.Total < ico.Total) message += '(余额不足补至下一等级)'
  } else if (level === moneyLevel) {
    message = '余额最高等级'
  }

  return {
    Level: level,
    Total: levelInfo.Total,
    Price: price,
    Amount: levelInfo.Amount,
    Users: levelInfo.Users,
    NeedMoney: needMoney,
    Message: message,
    NextLevel: ICOStandard(level + 1)
  }
}

const ICOStandard = (lv) => {
  if (lv === Infinity) return ICOStandard(ICOStandardList.length)
  lv = parseInt(lv < 1 ? 1 : lv)
  if (lv > ICOStandardList.length) {
    for (let level = ICOStandardList.length + 1; level <= lv; level++) {
      ICOStandardList.push({
        Level: level,
        Users: level * 5 + 10,
        Amount: 10000 + (level - 1) * 7500,
        Total: level === 1 ? 100000 : (Math.pow(level, 2) * 100000 + ICOStandardList[level - 1 - 1].Total)
      })
    }
  }
  return ICOStandardList[lv - 1]
}

const fullfillICO = async (icoList) => {
  const dialog = `<div class="info_box">
                  <div class="title">自动补款检测中</div>
                  <div class="result" style="max-height:500px;overflow:auto;"></div>
                  </div>`
  if (!$('#TB_window').length) showDialog(dialog)
  const failedICOList = []

  let balance = await getData('chara/user/assets').then(d => d.Value ? d.Value.Balance : undefined).catch((e) => { console.log('获取余额失败', e); return undefined })
  for (let i = 0; i < icoList.length; i++) {
    const Id = icoList[i].Id
    const charaId = icoList[i].charaId
    const targetlv = icoList[i].target
    const fillMin = icoList[i].fillMin
    const [icoInfo, myInitial] = await Promise.all([
      getData(`chara/${charaId}`).then(d => d.State === 0 ? d.Value : undefined).catch((e) => { console.log(`获取 #${charaId} ICO信息失败`, e); return undefined }),
      getData(`chara/initial/${Id}`).then(d => d.Value).catch((e) => { console.log(`获取 #${charaId} ICO信息失败`, e); return null }) // undefined 代表未参与
    ])
    if (icoInfo) {
      const joined = myInitial !== undefined // 本人已参与 ICO
      const predicted = calculateICO(icoInfo, targetlv, fillMin, joined, balance)

      if (!predicted.Level) {
        $('.info_box .result').prepend(`<div class="row">#${charaId} 目标: lv${targetlv} 人数: ${icoInfo.Users}, ${predicted.Message}, 未补款</div>`)
        console.log(`#${charaId},目标:lv${targetlv},人数:${icoInfo.Users},${predicted.Message},未补款`)
      } else if (predicted.NeedMoney > 0) {
        const offer = Math.max(predicted.NeedMoney, 5000)
        const joinRes = await postData(`chara/join/${Id}/${offer}`, null)
        if (joinRes.State === 0) {
          $('.info_box .result').prepend(`<div class="row">#${charaId} 目标: lv${targetlv}, 自动补款至${predicted.Message} lv${predicted.Level}, 补款: ${offer}cc</div>`)
          console.log(`#${charaId},目标:lv${targetlv},自动补款至${predicted.Message}lv${predicted.Level},补款:${offer}cc`)
          if (balance) balance -= offer
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
    } else {
      $('.info_box .result').prepend(`<div class="row">#${charaId} 目标: lv${targetlv}, 获取角色 ICO 信息失败, 稍后重试</div>`)
      console.log(`#${charaId},目标:lv${targetlv},获取角色ICO信息失败,稍后重试`)
      failedICOList.push(icoList[i])
    }
  }
  if (failedICOList.length) fullfillICO(failedICOList)
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
                  <div class="desc">
                    最高目标等级：<input type="number" class="target" min="1" max="20" step="1" value="${target}" style="width:50px">
                  </div>
                  <div class="option">
                    <button id="fillMinButton" class="checkbox">
                      按不爆注的最低等级补款<span class="slider"><span class="button"></span></span>
                    </button>
                  </div>
                  <div class="label" style="margin-bottom: 7px;"><span id="fillMinInfo" class="info"></span></div>
                  <div class="label"><div class="trade ico">
                    <button id="startfillICOButton" class="active">自动补款</button>
                    <button id="fillICOButton" style="background-color: #5fda15;">立即补款</button>
                    <button id="cancelfillICOButton">取消补款</button>
                  </div></div>
                  <div class="loading" style="display:none"></div>`
  const { closeDialog } = showDialog(dialog)

  $('#fillMinButton').on('click', (e) => {
    if ($('#fillMinButton').hasClass('on')) {
      $('#fillMinButton').removeClass('on')
      $('#fillMinButton .button').animate({ 'margin-left': '0px' })
      $('#fillMinButton .button').css('background-color', '#ccc')
      $('#fillMinInfo').html('根据参与者人数、已筹集资金、个人资金余额，<br/>补款至不超过设定等级的<b>最高等级</b>。')
    } else {
      $('#fillMinButton').addClass('on')
      $('#fillMinButton .button').animate({ 'margin-left': '20px' })
      $('#fillMinButton .button').css('background-color', '#7fc3ff')
      $('#fillMinInfo').html('根据参与者人数、已筹集资金、个人资金余额，<br/>补款至不爆注的<b>最低等级</b>。')
    }
  }).trigger('click')

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
    info.fillMin = $('#fillMinButton').hasClass('on')
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
    info.fillMin = $('#fillMinButton').hasClass('on')
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

export { calculateICO, fullfillICO, autoFillICO, setFullFillICO, autoJoinICO, autoBeginICO, autoJoinFollowIco, openICODialog }
