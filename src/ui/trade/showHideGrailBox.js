import { Settings } from '../../config/settings'

export const showHideGrailBox = () => {
  const config = Settings.get().hide_grail
  if (config === 'on') {
    $('#grail').hide()
    setTimeout(() => { $('#pager1').hide() }, 500)
  }
}
