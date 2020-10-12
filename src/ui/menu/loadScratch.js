import { getData, postData } from '../../utils/api'

import { loadCharacterList } from './loadCharacterList'

import { ItemsSetting } from '../../config/itemsSetting'

export const loadScratch = () => {
  $('#eden_tpc_list ul').html('')
  $('#eden_tpc_list ul').append('<li class="line_odd item_list" style="text-align: center;">[刮刮乐]</li>')
  const scratch_results = []
  const scratch_ids = []
  const chaosCube_results = []
  const chaosCube_ids = []
  const lotusland_results = []
  const lotusland_ids = []

  const scratch = () => {
    getData('event/scratch/bonus2').then((d) => {
      if (d.State === 0) {
        for (let i = 0; i < d.Value.length; i++) {
          scratch_results.push(d.Value[i])
          scratch_ids.push(d.Value[i].Id)
        }
        if (!d.Value.length) {
          scratch_results.push(d.Value)
          scratch_ids.push(d.Value.Id)
        }
        scratch()
      } else {
        postData('chara/list', scratch_ids).then((d) => {
          for (let i = 0; i < d.Value.length; i++) {
            d.Value[i].Sacrifices = scratch_results[i].Amount
            d.Value[i].Current = scratch_results[i].SellPrice
          }
          loadCharacterList(d.Value, 2, 2, loadScratch, 'chara', false)
          startChaosCube()
        })
      }
    })
  }

  const chaosCubeTempleId = ItemsSetting.get().chaosCube
  const startChaosCube = () => {
    if (chaosCubeTempleId) {
      $('#eden_tpc_list ul').append('<li class="line_odd item_list" style="text-align: center;">[混沌魔方]</li>')
      chaosCube()
    } else {
      alert('未设置施放混沌魔方的圣殿，请先在角色圣殿施放一次混沌魔方即可完成预设')
      startLotusland()
    }
  }
  const chaosCube = () => {
    postData(`magic/chaos/${chaosCubeTempleId}`, null).then((d) => {
      console.log(d)
      if (d.State === 0) {
        for (let i = 0; i < d.Value.length; i++) {
          chaosCube_results.push(d.Value[i])
          chaosCube_ids.push(d.Value[i].Id)
        }
        if (!d.Value.length) {
          chaosCube_results.push(d.Value)
          chaosCube_ids.push(d.Value.Id)
        }
        chaosCube()
      } else {
        if (d.Message !== '今日已超过使用次数限制或资产不足。') {
          alert(d.Message)
          chaosCube()
        } else {
          postData('chara/list', chaosCube_ids).then((d) => {
            for (let i = 0; i < d.Value.length; i++) {
              d.Value[i].Sacrifices = chaosCube_results[i].Amount
              d.Value[i].Current = chaosCube_results[i].SellPrice
            }
            loadCharacterList(d.Value, 2, 2, loadScratch, 'chara', false)
            startLotusland()
          })
        }
      }
    })
  }

  const lotuslandPrice = ItemsSetting.get().lotusland
  const startLotusland = () => {
    if (lotuslandPrice !== undefined) {
      $('#eden_tpc_list ul').append('<li class="line_odd item_list" style="text-align: center;" title="可在设置界面设置抽奖金额上限">[幻想乡]</li>')
      lotusland()
    } else {
      alert('未设置幻想乡自动抽奖金额上限，请在助手设置界面进行设置（设为 0 可不自动抽幻想乡）')
    }
  }
  const lotusland = () => {
    getData('event/daily/count/10').then((d) => {
      if (d.State === 0) {
        const count = d.Value * 1
        const price = Math.pow(2, count) * 2000
        if (price <= lotuslandPrice) {
          getData('event/scratch/bonus2/true').then((d) => {
            console.log(d)
            if (d.State === 0) {
              for (let i = 0; i < d.Value.length; i++) {
                lotusland_results.push(d.Value[i])
                lotusland_ids.push(d.Value[i].Id)
              }
              if (!d.Value.length) {
                lotusland_results.push(d.Value)
                lotusland_ids.push(d.Value.Id)
              }
              lotusland()
            } else {
              endLotusland()
              console.warn('小圣杯助手自动抽幻想乡未知回应', d)
            }
          })
        } else {
          endLotusland()
        }
      } else {
        endLotusland()
        console.warn('小圣杯助手获取幻想乡价格未知回应', d)
      }
    })
  }
  const endLotusland = () => {
    postData('chara/list', lotusland_ids).then((d) => {
      for (let i = 0; i < d.Value.length; i++) {
        d.Value[i].Sacrifices = lotusland_results[i].Amount
        d.Value[i].Current = lotusland_results[i].SellPrice
      }
      loadCharacterList(d.Value, 2, 2, loadScratch, 'chara', false)
    })
  }

  scratch()
}
