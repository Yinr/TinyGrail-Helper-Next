const closeDialog = (name = 'main') => {
  if (name === 'main') {
    $('#TB_overlay').remove()
    $('#TB_window').remove()
  } else {
    $(`#TB_overlay[data-name=${name}]`).remove()
    $(`#TB_window[data-name=${name}]`).remove()
  }
}

const showDialog = (innerHTML, config = {}) => {
  const { name, maxWidth, minWidth, canClose, closeBefore } = {
    name: 'main',
    maxWidth: '640px',
    minWidth: '400px',
    canClose: true,
    closeBefore: false,
    ...config
  }
  const dialog = `
    <div id="TB_overlay" data-name="${name}" class="TB_overlayBG TB_overlayActive"></div>
    <div id="TB_window" data-name="${name}" class="dialog" style="display:block;max-width:${maxWidth};min-width:${minWidth};">
    ${innerHTML}
    <a id="TB_closeWindowButton" data-name="${name}" title="Close" ${canClose ? '' : 'style="display: none;"'}>X关闭</a>
    </div>
  `
  if (closeBefore) closeDialog(name)
  $('body').append(dialog)
  if (canClose) {
    $(`#TB_closeWindowButton[data-name=${name}]`).on('click', () => closeDialog(name))
    $(`#TB_overlay[data-name=${name}]`).on('click', () => closeDialog(name))
  }
  return {
    element: $(`#TB_window[data-name=${name}]`),
    closeDialog: () => { closeDialog(name) }
  }
}

export { showDialog, closeDialog }
