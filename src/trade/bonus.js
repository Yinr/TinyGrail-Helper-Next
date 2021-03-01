import { getData } from '../utils/api'
import { isDayOfWeek } from '../utils/utils'

const getWeeklyShareBonus = () => {
  if (!confirm('已经周六了，赶紧领取股息吧？')) return

  getData('event/share/bonus').then((d) => {
    if (d.State === 0) { alert(d.Value) } else { alert(d.Message) }
  })
}

const getShareBonus = () => {
  if (isDayOfWeek(6)) {
    getData('event/share/bonus/check').then((d) => {
      if (d.State === 0) {
        getWeeklyShareBonus()
      }
    })
  }
}

export { getShareBonus }
