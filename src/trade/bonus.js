import { getData } from '../utils/api'

const getWeeklyShareBonus = (callback) => {
  if (!confirm('已经周六了，赶紧领取股息吧？')) return

  getData('event/share/bonus', (d) => {
    if (d.State === 0) { alert(d.Value) } else { alert(d.Message) }

    callback()
  })
}

const getShareBonus = () => {
  let asiaTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Shanghai' })
  asiaTime = new Date(asiaTime)
  const Day = asiaTime.getDay()
  if (Day === 6) {
    getData('event/share/bonus/check').then((d) => {
      if (d.State === 0) {
        getWeeklyShareBonus()
      }
    })
  }
}

export { getShareBonus }
