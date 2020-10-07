const closeDialog = () => {
  $('#TB_overlay').remove()
  $('#TB_window').remove()
}

const showDialog = (innerHTML, maxWidth = '', minWidth = '') => {
  const dialog = `
    <div id="TB_overlay" class="TB_overlayBG TB_overlayActive"></div>
    <div id="TB_window" class="dialog" style="display:block;max-width:${maxWidth || '640px'};min-width:${minWidth || '400px'};">
    ${innerHTML}
    <a id="TB_closeWindowButton" title="Close">X关闭</a>
    </div>
  `
  $('body').append(dialog)
  $('#TB_closeWindowButton').on('click', closeDialog)
  $('#TB_overlay').on('click', closeDialog)
}

export { showDialog, closeDialog }
