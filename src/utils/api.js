const api = 'https://tinygrail.com/api/'

const getData = (url) => {
  if (!url.startsWith('http') && !url.startsWith('/')) url = api + url
  return new Promise((resolve, reject) => {
    $.ajax({
      url: url,
      type: 'GET',
      xhrFields: { withCredentials: true },
      success: res => { resolve(res) },
      error: err => { reject(err) }
    })
  })
}

const postData = (url, data) => {
  const d = JSON.stringify(data)
  if (!url.startsWith('http') && !url.startsWith('/')) url = api + url
  return new Promise((resolve, reject) => {
    $.ajax({
      url: url,
      type: 'POST',
      contentType: 'application/json',
      data: d,
      xhrFields: { withCredentials: true },
      success: res => { resolve(res) },
      error: err => { reject(err) }
    })
  })
}

const getDataOrNull = (url) => getData(url).catch((e) => { console.warn(e); return null })

export { getData, postData, getDataOrNull }
