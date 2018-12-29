const Tools = { brush: 'brush', eraser: 'eraser' }
const Colors = ['#000000', '#808080', '#d9d9d9', '#268ffb', '#fc2146', '#38d76a', '#fedb47']
const Thicknesses = [2, 4, 6, 8, 10, 12]
let canvas = document.getElementById('canvas')


autoSetCanvasSize(canvas)
let tools = initTools(Tools, canvas)
initThicknesses(Thicknesses, tools.getTool(Tools.brush))
initColors(Colors, tools.getTool(Tools.brush))
bindMouseEvent(canvas, tools)
bindTouchEvent(canvas, tools)
bindActions(canvas)

function bindTouchEvent(canvas, tools) {
  canvas.ontouchstart = function (e) {
    Actions.start(e.touches[0].clientX, e.touches[0].clientY, tools)
  }
  canvas.ontouchmove = function (e) {
    Actions.move(e.touches[0].clientX, e.touches[0].clientY, tools)
  }
  canvas.ontouchend = function () {
    Actions.end(tools)
  }
}

function bindMouseEvent(canvas, tools) {
  canvas.onmousedown = function (e) {
    Actions.start(e.layerX, e.layerY, tools)
  }
  canvas.onmousemove = function (e) {
    Actions.move(e.layerX, e.layerY, tools)
  }
  canvas.onmouseup = function () {
    Actions.end(tools)
  }
}

const Actions = {
  start: function (x, y, tools) {
    let using = tools.getUsing()
    let Tools = tools.getNameList()
    switch (using) {
      case Tools.brush:
        tools.getTool(Tools.brush).startDraw(x, y)
        break
      case Tools.eraser:
        tools.getTool(Tools.eraser).startClear(x, y)
        break
      default:
        tools.getTool(Tools.brush).startDraw(x, y)
    }
  },
  move: function (x, y, tools) {
    let using = tools.getUsing()
    let Tools = tools.getNameList()
    switch (using) {
      case Tools.brush:
        tools.getTool(Tools.brush).draw(x, y)
        break
      case Tools.eraser:
        tools.getTool(Tools.eraser).clear(x, y)
        break
      default:
        tools.getTool(Tools.brush).draw(x, y)
    }
  },
  end: function (tools) {
    let using = tools.getUsing()
    let Tools = tools.getNameList()
    switch (using) {
      case Tools.brush:
        tools.getTool(Tools.brush).endDraw()
        break
      case Tools.eraser:
        tools.getTool(Tools.eraser).endClear()
        break
      default:
        tools.getTool(Tools.brush).endDraw()
    }
  },
  clear: function (canvas) {
    let context = canvas.getContext('2d')
    context.clearRect(0, 0, canvas.width, canvas.height);
  },
  download: function (canvas) {
    let url = canvas.toDataURL("image/png")
    let a = document.createElement('a')
    document.body.appendChild(a)
    a.href = url
    a.download = 'draw'
    a.click()
    document.body.removeChild(a)
  },
  preview: function (canvas) {
    let url = canvas.toDataURL("image/png")
    window.open(url, '_blank')
  }
}

function bindActions(canvas) {
  let download = document.getElementById('download')
  let clear = document.getElementById('clear')
  let preview = document.getElementById('preview')
  download.onclick = function () {
    Actions.download(canvas)
  }
  clear.onclick = function () {
    Actions.clear(canvas)
  }
  preview.onclick = function () {
    Actions.preview(canvas)
  }
}

function initTools(Tools, canvas, _default = 'brush') {
  let tools = document.getElementById('tools')
  let tool = null
  let toolName = null
  let toolsList = {}
  for (let i in Tools) {
    let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.classList.add('icon')
    if (i === String(_default)) {
      svg.classList.add('active')
      tool = svg
      toolName = Tools[i]
    }
    let use = document.createElementNS('http://www.w3.org/2000/svg', 'use')
    use.setAttributeNS('http://www.w3.org/1999/xlink', 'href', `#icon-${Tools[i]}`)
    svg.appendChild(use)
    svg.onclick = function () {
      tool.classList.remove('active')
      this.classList.add('active')
      tool = this
      toolName = Tools[i]
    }
    tools.appendChild(svg)
  }
  return {
    getUsing: function () {
      return toolName
    },
    getTool: function (name) {
      return getTool(name, canvas)
    },
    getNameList: function () {
      return Tools
    }
  }
  function getTool(name, canvas, option) {
    let tools = toolsList
    switch (name) {
      case Tools.eraser:
        return tools.eraser || (tools.eraser = getEraser(canvas, option))
      case Tools.brush:
        return tools.brush || (tools.brush = getBrush(canvas, option))
      default:
        return null
    }
    function getEraser(canvas, size = { width: 20, height: 20 }) {
      let _using = false
      let context = canvas.getContext('2d')
      return {
        startClear: function (x, y) {
          _using = true
          this.clear(x, y)
          console.log(_using)
        },
        clear: function (x, y) {
          if (_using) {
            context.clearRect(x - (size.width >> 1), y - (size.height >> 2), size.width, size.height)
          }
        },
        endClear: function () {
          _using = false
        },
        clearAll: function () {
          context.clearRect(0, 0, c)
        }
      }
    }
    function getBrush(canvas, option = {}) {
      const _defaultOption = { lineCap: 'round', lineWidth: 1, lineJoin: 'round' }
      let _option = Object.assign(_defaultOption, option)
      let _using = false
      let context = canvas.getContext('2d')
      return {
        startDraw: function (x, y) {
          context.beginPath()
          Object.assign(context, _option)
          context.moveTo(x, y)
          _using = true
        },
        draw: function (x, y) {
          if (_using) {
            context.lineTo(x, y)
            context.stroke()
          }
        },
        endDraw: function () {
          context.stroke()
          _using = false
        },
        setOption: function (option = {}) {
          Object.assign(_option, option)
        }
      }
    }
  }
}

function initThicknesses(Thicknesses, brush, _default = 0) {
  let t = null
  let thicknesses = document.getElementById('thicknesses')
  for (let i in Thicknesses) {
    let li = document.createElement('li')
    li.classList.add('t')
    if (i === String(_default)) {
      li.classList.add('active')
      t = li
    }
    li.onclick = function () {
      t.classList.remove('active')
      this.classList.add('active')
      brush.setOption({ lineWidth: Thicknesses[i] })
      t = this
    }
    let span = document.createElement('span')
    span.style = `width:${Thicknesses[i]}px; height:${Thicknesses[i]}px`
    li.appendChild(span)
    thicknesses.appendChild(li)
  }
}

function initColors(Colors, brush, _default = 0) {
  let color = null
  let colors = document.getElementById('colors')
  for (let i in Colors) {
    let li = document.createElement('li')
    li.classList.add('color')
    if (i === String(_default)) {
      li.classList.add('active')
      color = li
    }
    li.style = `background-color: ${Colors[i]}`
    li.onclick = function () {
      color.classList.remove('active')
      this.classList.add('active')
      brush.setOption({ strokeStyle: Colors[i] })
      color = this
    }
    colors.appendChild(li)
  }
}

function autoSetCanvasSize(canvas) {
  setCanvasSize()
  window.onresize = setCanvasSize
  function setCanvasSize() {
    let height = document.documentElement.clientHeight
    let width = document.documentElement.clientWidth
    if (window.devicePixelRatio) {
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      canvas.height = height * window.devicePixelRatio * 2;
      canvas.width = width * window.devicePixelRatio * 2;
      canvas.getContext('2d').scale(window.devicePixelRatio * 2, window.devicePixelRatio * 2);
    } else {
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d').scale(2, 2)
    }
  }
}