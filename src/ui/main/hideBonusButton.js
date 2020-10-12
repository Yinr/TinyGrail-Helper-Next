import { getData } from '../../utils/api'

export const hideBonusButton = () => {
  if (!$('#bonusButton').length) return
  getData('event/share/bonus/test').then((d) => {
    const x = d.Value.Share / 10000
    const allowance = Math.log10(x + 1) * 30 - x
    if (d.State === 0 && allowance < 0) $('#bonusButton').remove()
    // else $('#shareBonusButton').hide();
  })
}
