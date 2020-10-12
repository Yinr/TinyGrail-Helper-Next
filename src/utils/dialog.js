const closeDialog = (name = 'main') => {
  if (name === 'main') {
    $('#TB_overlay').remove()
    $('#TB_window').remove()
  } else {
    $(`#TB_overlay[data-name=${name}]`).remove()
    $(`#TB_window[data-name=${name}]`).remove()
  }
}

const showDialog = (innerHTML, name = 'main', maxWidth = '', minWidth = '') => {
  const dialog = `
    <div id="TB_overlay" data-name="${name}" class="TB_overlayBG TB_overlayActive"></div>
    <div id="TB_window" data-name="${name}" class="dialog" style="display:block;max-width:${maxWidth || '640px'};min-width:${minWidth || '400px'};">
    ${innerHTML}
    <a id="TB_closeWindowButton" data-name="${name}" title="Close">X关闭</a>
    </div>
  `
  $('body').append(dialog)
  $(`#TB_closeWindowButton[data-name=${name}]`).on('click', () => closeDialog(name))
  $(`#TB_overlay[data-name=${name}]`).on('click', () => closeDialog(name))
}

export { showDialog, closeDialog }
