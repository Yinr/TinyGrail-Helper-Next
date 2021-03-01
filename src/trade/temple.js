import { getData, postData } from '../utils/api'
import { removeEmpty, formatAskPrice } from '../utils/formatter'

import { getSacrifices } from './getSacrifices'

import { AutoTempleList } from '../config/autoTempleList'

const removeBuildTemple = (charaId) => {
  const autoTempleList = AutoTempleList.get()
  for (let i = 0; i < autoTempleList.length; i++) {
    if (parseInt(autoTempleList[i].charaId) === parseInt(charaId)) {
      autoTempleList.splice(i, 1)
      break
    }
  }
  $(`#grailBox.chara${charaId} #autobuildButton`).text('[自动建塔]')
  AutoTempleList.set(autoTempleList)
}

const autoBuildTemple = async (charas = undefined) => {
  const buildTemple = (chara, amount) => {
    postData(`chara/sacrifice/${chara.charaId}/${amount}/false`, null).then((d) => {
      if (d.State === 0) {
        console.log(`#${chara.charaId} ${chara.name} 献祭${amount} 获得金额 ₵${d.Value.Balance.toFixed(2)}`)
        $(`#grailBox.chara${chara.charaId} #autobuildButton`).text('[自动建塔]')
        removeBuildTemple(chara.charaId)
      } else {
        console.log(`${d.Message}`)
      }
    })
  }
  const postBid = (chara, price, amount, Amount, Needed) => {
    postData(`chara/bid/${chara.charaId}/${price}/${amount}`, null).then((d) => {
      if (d.Message) console.log(`#${chara.charaId} ${chara.name} ${d.Message}`)
      else {
        console.log(`买入成交 #${chara.charaId} ${chara.name} ${price}*${amount}`)
        if ((Amount + amount) >= Needed) { // 持股达到数量，建塔
          buildTemple(chara, Needed)
        }
      }
    })
  }
  const getAskin = (Asks, low_price) => { // 获取可买入的卖单价格和总数
    let [price, amount] = [0, 0]
    for (let i = 0; i < Asks.length; i++) {
      if (Asks[i].Price > 0 && Asks[i].Price <= low_price) {
        amount += Asks[i].Amount
        price = Asks[i].Price
      }
    }
    return [price, amount]
  }
  const remove_myAsks = (Asks, myAsks) => {
    for (let i = 0; i < Asks.length; i++) {
      for (let j = 0; j < myAsks.length; j++) {
        if (formatAskPrice(Asks[i].Price) === formatAskPrice(myAsks[j].Price)) Asks[i].Amount -= myAsks[j].Amount
      }
      if (Asks[i].Amount === 0) delete Asks[i]
    }
    Asks = removeEmpty(Asks)
    return Asks
  }

  if (charas === undefined) {
    charas = AutoTempleList.get()
  }

  for (let i = 0; i < charas.length; i++) {
    const chara = charas[i]
    console.log(`自动建塔 check #${chara.charaId} ${chara.name}`)
    const charaInfo = await getData(`chara/user/${chara.charaId}`)
    const myAsks = charaInfo.Value.Asks
    const Amount = charaInfo.Value.Amount
    const { Assets, Damage } = await getSacrifices(chara.charaId)
    const Needed = chara.target - Assets - Math.floor(Damage / 2)
    if (Needed <= 0) {
      removeBuildTemple(chara.charaId)
    } else if (Amount >= Needed) { // 持股达到数量，建塔
      buildTemple(chara, Needed)
    } else {
      getData(`chara/depth/${chara.charaId}`).then((d) => {
        let Asks = d.Value.Asks
        Asks = remove_myAsks(Asks, myAsks)
        const AskPrice = Asks[0] ? Asks[0].Price : 0
        if (AskPrice && AskPrice <= chara.bidPrice) { // 最低卖单低于买入上限，买入
          const [price, amount] = getAskin(Asks, chara.bidPrice)
          postBid(chara, price, Math.min(amount, Needed), Amount, Needed)
        }
      })
    }
  }
}

export { autoBuildTemple, removeBuildTemple }
