import React, { Component } from 'react'
import * as PIXI from 'pixi.js'

import AutoCompleteComponent from './AutoCompleteComponent'
import HttpService from '../services/HttpService'
import { l, auth, rand } from '../helpers/common'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes, faCheck } from '@fortawesome/free-solid-svg-icons'

PIXI.Graphics.prototype.drawDashedBorder = function(points, dash, gap){
  let p1, p2, dashLeft = 0, gapLeft = 0, x = 0, y = 0
  for(let i = 0; i < points.length; i++){
    p1 = points[i]
    if(i === points.length-1) p2 = points[0]
    else p2 = points[i+1]

    let dx = p2.x - p1.x
    , dy = p2.y - p1.y
    , len = Math.sqrt(dx*dx + dy*dy)
    , normal = { x:dx/len, y:dy/len }
    , progressOnLine = 0

    this.moveTo(x + p1.x + gapLeft*normal.x, y + p1.y + gapLeft*normal.y)

    while(progressOnLine <= len){
      progressOnLine+= gapLeft
      if(dashLeft > 0) progressOnLine += dashLeft
      else progressOnLine+= dash
      if(progressOnLine > len){
        dashLeft = progressOnLine - len
        progressOnLine = len
      }else{
        dashLeft = 0
      }
      this.lineTo(x + p1.x + progressOnLine*normal.x, y + p1.y + progressOnLine*normal.y)
      progressOnLine+= gap
      if(progressOnLine > len && dashLeft === 0){
        gapLeft = progressOnLine-len
        // l(progressOnLine, len, gap)
      }else{
        gapLeft = 0
        this.moveTo(x + p1.x + progressOnLine*normal.x, y + p1.y + progressOnLine*normal.y)
      }
    }
  }
}

PIXI.Graphics.prototype.getCenter = function() {
  let b = this.getBounds()
  return {
    x: b.x + b.width/2,
    y: b.y + b.height/2,
  }
}

class Polygon extends PIXI.Graphics {
  constructor(params) {
    super()
    this.fo = params.opacity || 0
    this.co = params.color || 0x000000
    this.lw = params.edgeSize || 1
    this.points = params.points
    this.draw()
  }

  draw = () => {
    let points = [], i = 0    
    this.points.forEach(s => {
      points[i] = s.x
      points[i+1] = s.y
      i+=2
    })

    this
    .clear()
    .beginFill(this.co, this.fo)
    .drawPolygon(points)
    .endFill()
    .closePath()
    .lineStyle(this.lw, this.co, 1)
    .drawDashedBorder(this.points, 8, 7)
  }
}

class Square extends PIXI.Graphics {
  constructor(s, c, o) {
    super()
    this.s = s || 1
    this.c = c || 0x000000
    this.o = typeof o !== "undefined" ? o : 1
    this.draw()
  }  

  draw = () => {
    this
    .clear()
    .lineStyle(1, 0x979797, 1)    
    .beginFill(this.c, this.o)
    .drawRect(0, 0, this.s, this.s)
    .endFill()
  }
}

class Circle extends PIXI.Graphics {
  constructor(params) {
    super()
    // this.r = params.circleData.r || 1
    this.c = {}
    this.lw = params.edgeSize || 1
    this.co = params.color || 0x000000
    this.fo = params.opacity || 1
    this.points = params.points  
    this.draw()
  }  
  
  draw = () => {
    // Get dummy outer square
    let tempPoly = new Polygon({
      points: this.points
    })
    , bounds = tempPoly.getBounds()
    , center = tempPoly.getCenter()
    // l(bounds, center)

    this.r = bounds.width / 2
    this.c.x = center.x// - this.s / 2
    this.c.y = center.y// - this.s / 2

    let points = [], i = 0
    , noPoints = this.r / 2
    , angle = 2 * Math.PI / noPoints

    for (i = 0; i < noPoints; i++) {
      points.push({
        x: this.c.x + this.r * Math.cos(angle * i),
        y: this.c.y + this.r * Math.sin(angle * i)
      })
    }

    this
    .clear()
    .beginFill(this.co, this.fo)
    .drawCircle(this.c.x, this.c.y, this.r)
    .endFill()
    .closePath()
    .lineStyle(this.lw, this.co, 1)
    .drawDashedBorder(points, 8, 7)
    // if (bounds.width > 50 && bounds.width === bounds.height){
    // }
  }
}

class NumberCircle extends PIXI.Graphics {
  constructor(params) {
    super()
    this.c = params.c
    this.r = params.r || 1
    this.es = params.edgeSize || 1
    this.fc = params.fillColor || 0x000000
    this.fo = params.opacity || 1
    this.draw()
  }

  draw = () => {
    this
    .clear()
    .beginFill(this.fc, this.fo)
    .drawCircle(this.c.x, this.c.y, this.r)
    .endFill()
    .closePath()
  }
}

let randHex = () => {
  return "0x" + "000000".replace(/0/g, () => {
    return (~~(Math.random()*16)).toString(16)
  })
}
, hexJStoCSS = str => '#' + str.substring(2, str.length)
, getCoords = (data, type, subtype) => {
  let height = imgInnerRef.current.clientHeight
  , width = imgInnerRef.current.clientWidth
  , returnVar = []
  , coords

  switch(type){
    case 'rectangle':
    case 'circle':
      switch(subtype){
        case 'percent':
          coords = data.object_coords.map(c => parseFloat(parseFloat(c).toFixed(2))) 
          returnVar.push({
            x: coords[0] * width, y: coords[1] * height
          },{
            x: coords[2] * width, y: coords[1] * height
          },{
            x: coords[2]*width, y: coords[3]*height
          },{
            x: coords[0]*width, y: coords[3]*height
          })
        break
          
        default:
          returnVar.push({
            x: data.tl.x, y: data.tl.y
          },{
            x: data.br.x, y: data.tl.y
          },{
            x: data.br.x, y: data.br.y
          },{
            x: data.tl.x, y: data.br.y
          })    
        break
      }  
    break
    
    default: // Polygon
      coords = data.object_coords.map(c => parseFloat(parseFloat(c).toFixed(2)))
      for(let i = 0; i < coords.length - 1; i+=2){
        returnVar.push({
          x: coords[i]*width,
          y: coords[i+1]*height
        })
      }
    break
  }

  return returnVar
}
, ctnArr = []
, imgInnerRef
, imgRef, bg
, tempPointArr = []
, tempColor
, tempCtn = { 
  id: rand(7),
  lastSqPosArr: [],
  labelData: { active: true } 
}
, rectangleCoords = {}
, polyParams = {
  opacity: .4,
  edgeSize: 5,
  pointSize: 10,
}
, currCtnObj = null
, inBounds = true
, dummyLabels = [
  {
    form: "Rectangle",
    id: 396,
    label: {
      id: 7738,
      name: "fashion accessory",
      tag: null,
    },
    object_coords: [
      "0.3132956922054291",
      "0.27638623118400574",
      "0.9963658452033997",
      "0.8171226382255554",
    ]
  },
  {
    form: "Circle",
    id: 39601,
    label: {
      id: 77381,
      name: "circle",
      tag: null,
    },
    object_coords: [
      "0.2660536421530819",
      "0.03249433527307487",
      "0.6242626535534694",
      "0.7778712830904767"
    ]
  },
  {
    form: "Polygon",
    id: 396012,
    label: {
      id: 773812,
      name: "poly",
      tag: null,
    },
    object_coords: [
      "0.050795250896057347", 
      "0.1671309192200557", 
      "0.06334005376344086", 
      "0.7158774373259053", 
      "0.25509632616487454", 
      "0.8579387186629527", 
      "0.32857302867383514", 
      "0.6295264623955432", 
      "0.28377016129032256", 
      "0.21727019498607242", 
      "0.19058019713261648", 
      "0.03064066852367688"
    ]
  }
]
, suggestions = []
, fromOptions = false

export default class ImageComponent extends Component {
  constructor(props) {
    super(props)
    imgRef = React.createRef()
    imgInnerRef = React.createRef()
    this.http = new HttpService()
    this.state = {
      currCat: "",
      tempLblName: "",
      adding: "",
      imgOrientation: "",
      deleteOnBackspace: false
    }
  }

  componentDidMount(){
    this.props.onRef(this)
    window.addEventListener('resize', this.resizeObjects)
  }

  componentWillReceiveProps = nextProps => {
    // l("Next Props")
    if(!nextProps.image.labelsChanged)
      this.setState({ imgOrientation: "" })

    if(nextProps.image.category){
      let currCat = nextProps.image.category.name
      this.setState({ currCat })
    }
  }

  imageLoaded = img => {
    // console.clear()
    // l("Image loaded: ", img.width, img.height)
    
    let ctnWidth = imgRef.current.clientWidth
    , ctnHeight = imgRef.current.clientHeight
    , ratio = img.height / img.width
    , tempWidth = ctnWidth
    , tempHeight = ratio * tempWidth

    // l("After height matched: ", tempWidth, tempHeight)

    if (tempHeight > ctnHeight) this.setState({ imgOrientation: "portrait" })
    else this.setState({ imgOrientation: "landscape" })
    
    setTimeout(this.createCanvas, 10)
  }
  
  destroyCanvas = () => {
    ctnArr.length = 0
    if(this.app){
      imgInnerRef.current.removeChild(this.app.view)
      this.app.destroy()
      this.app = null
    }
  }

  createCanvas = () => {
    this.destroyCanvas()    
    
    this.app = new PIXI.Application(
      imgInnerRef.current.clientWidth, 
      imgInnerRef.current.clientHeight, {
      transparent: true,
      antialias: true
    })
    this.ctn = new PIXI.Container()
    this.ctn.sortableChildren = true
    this.app.stage.addChild(this.ctn)

    let view = this.app.view
    view.style.position = "absolute"
    // view.style.outline = "5px solid green"
    view.style.top = view.style.left = 0
    imgInnerRef.current.appendChild(view)
    
    // Blank rectangle for click events for adding shapes
    this.addBackground()

    // Draw objects if existing in image
    this.drawObjects()
  }

  addBackground = () => {
    let params, tempPoly
    bg = new PIXI.Graphics()
    bg
    .beginFill(0x000000, 0)
    .lineStyle(0, 0x000000)
    .drawRect(0, 0, imgInnerRef.current.clientWidth, imgInnerRef.current.clientHeight)
    this.ctn.addChild(bg)

    bg.interactive = true
    bg.visible = false

    bg.on('pointerdown', e => {
      let c = {...e.data.global}

      if(tempCtn){
        this.clearTempCtn()
      }

      switch(this.state.adding){
        case 'rectangle':
          this.data = e.data
          this.drawingRect = true
          rectangleCoords.tl = { x: c.x, y: c.y }
        break
        
        case 'polygon':
          tempPointArr.push(c)
          params = {
            ...polyParams,
            type: 'polygon',
            color: tempColor,
            points: tempPointArr,
          }

          tempPoly = this.drawShape(params)
          tempCtn.shape = tempPoly
          tempCtn.boundingBox = this.drawBoundingBox(tempPoly)
          tempCtn.controlPoints = this.drawControlPoints(params.points, 'polygon')
          tempCtn.numberCtn = this.drawNumberLabel(tempPoly, tempColor)
          tempCtn.deleteBtn = this.drawDeleteButton(tempPoly)
          currCtnObj = tempCtn

        break
        
        default:
          this.data = e.data
          this.drawingCirc = true
          rectangleCoords.tl = { x: c.x, y: c.y }
        break
      }
    })

    bg.on('pointerup', e => {
      // l("Done Creating")
      if(this.drawingCirc){
        tempCtn.boundingBox = this.drawBoundingBox(tempPoly)
        let bb = tempPoly.getBounds()
        , points = [
          { x: bb.x, y: bb.y },
          { x: bb.x + bb.width, y: bb.y },
          { x: bb.x + bb.width, y: bb.y + bb.height },
          { x: bb.x, y: bb.y + bb.height },
        ]
        tempCtn.controlPoints = this.drawControlPoints(points, 'circle')
        tempCtn.numberCtn = this.drawNumberLabel(tempPoly, tempColor)
        tempCtn.deleteBtn = this.drawDeleteButton(tempPoly)

        let height = imgInnerRef.current.clientHeight
        , width = imgInnerRef.current.clientWidth
        , size = polyParams.pointSize
        , newPos = tempCtn.controlPoints.map(s => {
          return { x: s.x, y: s.y }
        })
        
        tempCtn.labelData.object_coords = [
          (newPos[0].x + size / 2) / width,
          (newPos[0].y + size / 2) / height,
          (newPos[2].x + size / 2) / width,
          (newPos[2].y + size / 2) / height,
        ].map(x => x.toString())  

        currCtnObj = tempCtn
      }
      this.data = null
      this.drawingRect = false
      this.drawingCirc = false      
    })
    
    bg.on('pointermove', () => {
      if(this.data){
        let p = this.data.global

        if(tempCtn){
          this.clearTempCtn()
        }

        if(this.drawingRect){
          rectangleCoords.br = { x: p.x, y: p.y }
          params = {
            ...polyParams,
            type: 'rectangle',
            color: tempColor,
            points: getCoords(rectangleCoords, 'rectangle', ''),
          }

          tempPoly = this.drawShape(params)
          tempCtn.shape = tempPoly
          tempCtn.boundingBox = this.drawBoundingBox(tempPoly)
          tempCtn.controlPoints = this.drawControlPoints(params.points, 'rectangle')
          tempCtn.numberCtn = this.drawNumberLabel(tempPoly, tempColor)
          tempCtn.deleteBtn = this.drawDeleteButton(tempPoly)
          currCtnObj = tempCtn

        }else if(this.drawingCirc){
          rectangleCoords.br = { x: p.x, y: p.y }
          params = {
            ...polyParams,
            type: 'circle',
            color: tempColor,
            points: getCoords(rectangleCoords, 'rectangle', ''),
          }

          tempPoly = this.drawShape(params)
          tempCtn.shape = tempPoly
        }
      }
    })
  }

  clearTempCtn = () => {
    Object.keys(tempCtn).forEach(key => {
      if(key === "controlPoints") tempCtn[key].forEach(obj => this.ctn.removeChild(obj))
      else this.ctn.removeChild(tempCtn[key])
    })
    tempCtn = { 
      id: rand(7),
      lastSqPosArr: [],
      labelData: { active: true } 
    }
  }

  resetForAdding = e => {
    typeof e !== "undefined" && e.stopPropagation()
    bg.visible = false
    tempPointArr.length = 0
    this.clearTempCtn()
    this.setState({ adding: "" })
    this.props.editing(false)
  }

  startAdding = type => {
    bg.visible = true
    tempColor = randHex()
    this.hideObjects(true)
    this.clearTempCtn()
    this.setState({ adding: type })
    this.props.editing(true)
  }

  doneAdding = (e, type) => {
    typeof e !== "undefined" && e.stopPropagation()
    let ld = currCtnObj.labelData
    ld.active = false
    ld.edit = false
    ld.form = type
    ld.id = 0
    ld.label = {
      id: 0,
      name: "new label",
      tag: null
    }
    this.addLabel()
  }

  drawObjects = () => {
    // let labels = dummyLabels
    let labels = this.props.image.labels
    
    labels.forEach((lbl, idx) => {
      tempCtn = { id: rand(7), lastSqPosArr: [] }

      let form = lbl.form.toLowerCase()
      , tempPoly
      , params = {
        ...polyParams,
        type: form,
        color: randHex(),
      }

      params.points = getCoords(lbl, form, 'percent')
      tempPoly = this.drawShape(params)
      tempCtn.shape = tempPoly
      tempCtn.boundingBox = this.drawBoundingBox(tempPoly)

      switch(form){
        case 'rectangle':
        case 'polygon':
          tempCtn.controlPoints = this.drawControlPoints(params.points, form)
        break   

        default:
          let bb = tempPoly.getBounds()
          , points = [
            { x: bb.x, y: bb.y },
            { x: bb.x + bb.width, y: bb.y },
            { x: bb.x + bb.width, y: bb.y + bb.height },
            { x: bb.x, y: bb.y + bb.height },
          ]
          tempCtn.controlPoints = this.drawControlPoints(points, 'circle')
        break
      }

      tempCtn.numberCtn = this.drawNumberLabel(tempPoly, params.color, idx + 1)
      tempCtn.deleteBtn = this.drawDeleteButton(tempPoly)
      
      lbl.ref = React.createRef()
      lbl.color = hexJStoCSS(params.color)
      lbl.edit = false
      lbl.active = false
      tempCtn.labelData = lbl

      ctnArr.push(tempCtn)
    })
    
    this.drawAllObjects()

    // For same color in label
    this.props.imageUpdated()
  }

  resizeObjects = () => {
    // Resize canvas according to image
    this.app.renderer.resize(
      imgInnerRef.current.clientWidth,
      imgInnerRef.current.clientHeight
    )
    
    // Resize background
    bg
    .clear()
    .beginFill(0x000000, 0)
    .lineStyle(0, 0x000000)
    .drawRect(0, 0, imgInnerRef.current.clientWidth, imgInnerRef.current.clientHeight)
    
    // Redraw shapes based on new canvas size
    ctnArr.forEach(ctnObj => {
      // l(ctnObj)
      let lbl = ctnObj.labelData
      , form = lbl.form.toLowerCase()
      , points, bounds, center
      , gr = ctnObj.shape
      , bb = ctnObj.boundingBox
      , nc = ctnObj.numberCtn
      , db = ctnObj.deleteBtn

      // Get new coordinates by percent
      points = getCoords(lbl, form, 'percent')
      gr.points = points
      gr.draw()
            
      // Reposition control points
      bounds = gr.getBounds()
      
      if (form === 'circle') {
        points = [
          { x: bounds.x, y: bounds.y },
          { x: bounds.x + bounds.width, y: bounds.y },
          { x: bounds.x + bounds.width, y: bounds.y + bounds.height },
          { x: bounds.x, y: bounds.y + bounds.height },
        ]
      }
            
      ctnObj.lastSqPosArr = []
      ctnObj.controlPoints.forEach((sq, i) => {
        sq.position.set(points[i].x - sq.s / 2, points[i].y - sq.s/2)
        ctnObj.lastSqPosArr.push({ x: sq.x, y: sq.y })
      })

      // Redraw the bounding box
      bb
      .clear()
      .lineStyle(1, 0x979797, 1)
      .drawRect(bounds.x, bounds.y, bounds.width, bounds.height)

      // Update delete button, number circle positions
      db.position.set(bounds.x + bounds.width - 50, bounds.y + 15)

      center = gr.getCenter()
      nc.position.set(center.x, center.y)
    })
  }

  hideObjects = forAdding => {
    // l(ctnArr)
    ctnArr.forEach(ctnObj => {
      ctnObj.labelData.active = false
      ctnObj.labelData.edit = false
      ctnObj.boundingBox.visible = false
      ctnObj.controlPoints.forEach(sq => sq.visible = false)
      ctnObj.deleteBtn.visible = false

      if (forAdding){
        ctnObj.shape.visible = false
        ctnObj.numberCtn.visible = false
      }
    })
  }
  
  deleteObject = ctnObj => {
    this.ctn.removeChild(ctnObj.shape)
    this.ctn.removeChild(ctnObj.boundingBox)
    ctnObj.controlPoints.forEach(sq => this.ctn.removeChild(sq))
    this.ctn.removeChild(ctnObj.numberCtn)
    this.ctn.removeChild(ctnObj.deleteBtn)
  }  

  addObject = ctnObj => {
    ctnObj.shape.visible = true
    this.ctn.addChild(ctnObj.shape)
  
    ctnObj.boundingBox.visible = false
    this.ctn.addChild(ctnObj.boundingBox)
    
    ctnObj.controlPoints.forEach(sq => {
      sq.visible = false
      this.ctn.addChild(sq)
    })
    
    ctnObj.numberCtn.visible = true
    this.ctn.addChild(ctnObj.numberCtn)
    
    ctnObj.deleteBtn.visible = false
    this.ctn.addChild(ctnObj.deleteBtn)
  }

  drawAllObjects = () => ctnArr.forEach(ctnObj => this.addObject(ctnObj))

  drawShape = params => {
    let type = params.type
    , poly

    switch(type){
      case 'rectangle':
      case 'polygon':
        poly = new Polygon(params)
      break

      default:
        poly = new Circle(params)
      break
    }
    
    poly.type = type
    poly.ctnObj = tempCtn
    this.addInteraction(poly, 'shape')
    return poly
  }
  
  drawBoundingBox = poly => {
    let bb = poly.getBounds()
    , gr = new PIXI.Graphics()
    
    this.ctn.addChild(gr)
    return gr
      .lineStyle(1, 0x979797, 1)
      .drawRect(bb.x, bb.y, bb.width, bb.height)
  }

  drawControlPoints = (points, type) => {
    let sqArr = []
    
    for(let i = 0; i < points.length; i++){
      let sq = new Square(polyParams.pointSize, 0xe5e5e5, 1)
      sq.position.set(
        points[i].x - polyParams.pointSize/2, 
        points[i].y - polyParams.pointSize/2
      )
      sq.s = polyParams.pointSize
      sq.idx = i
      sq.type = type
      sq.ctnObj = tempCtn
      tempCtn.lastSqPosArr.push({ x: sq.x, y: sq.y })
      this.addInteraction(sq, 'point')
      sqArr.push(sq)
    }

    return sqArr
  }

  drawNumberLabel = (graphic, color, index) => {
    let circCtn = new PIXI.Container()
      , center = graphic.getCenter()

    let circ = new NumberCircle({
      c: { x: 0, y: 0 },
      r: 25,
      edgeSize: 2,
      fillColor: color,
      opacity: 1
    })
    circCtn.addChild(circ)

    let text = new PIXI.Text(index, new PIXI.TextStyle({
      fill: 0xffffff,
      fontFamily: "sofia-pro-r",
      fontSize: 24,
      align: "center",
      wordWrap: true
    }))
    text.anchor.set(0.5, 0.5)
    circCtn.addChild(text)
    circCtn.position.set(center.x, center.y)

    circCtn.visible = false
    this.ctn.addChild(circCtn)

    return circCtn
  }

  drawDeleteButton = tempPoly => {
    let b = tempPoly.getBounds()
    , delBtn = new PIXI.Sprite.from('assets/delete-3.png')

    delBtn.visible = false 
    delBtn.interactive = true
    delBtn.buttonMode = true
    delBtn.ctnObj = tempCtn
    delBtn.on('pointerdown', () => this.deleteLabel())
    delBtn.position.set(b.x + b.width - 50, b.y + 15)    
    this.ctn.addChild(delBtn)

    return delBtn
  }

  moveToTopLayer = () => {
    this.deleteObject(currCtnObj)
    this.addObject(currCtnObj)

    currCtnObj.boundingBox.visible = true
    currCtnObj.deleteBtn.visible = true
    currCtnObj.controlPoints.forEach(sq => sq.visible = true)
    this.setState({ 
      tempLblName: currCtnObj.labelData.label.name 
    }, () => {
      // l(currCtnObj.labelData.ref)
      let input = currCtnObj
        .labelData.ref.current
        .children[1]
        .children[0]
        .children[0].children[0]
      // l(input)
      input.focus()
    })
  }

  makeMutable = deleteOnBackspace => {
    this.hideObjects()
    currCtnObj.labelData.edit = true
    currCtnObj.labelData.active = true
    currCtnObj.boundingBox.visible = true
    currCtnObj.controlPoints.forEach(sq => sq.visible = true)
    currCtnObj.deleteBtn.visible = true
    this.moveToTopLayer()

    //Disable delete on backspace if label was clicked
    this.setState({ deleteOnBackspace }) 
  }

  makeImmutable = () => {
    this.hideObjects()
    this.props.imageUpdated()
  }

  addInteraction = (graphic, eventType) => {
    let self = this

    this.ctn.addChild(graphic)
    graphic.interactive = true
    
    if(eventType === 'shape'){
      graphic.buttonMode  = true
    }else if(eventType === 'point'){
      if(graphic.type !== 'polygon')
        graphic.cursor = graphic.idx % 2 ? "nesw-resize" : "nwse-resize"
      else
        graphic.cursor = "move"
    }
    
    graphic
    .on('pointerdown', onDragStart)
    .on('pointerup', onDragEnd)
    .on('pointerupoutside', onDragEnd)
    .on('pointermove', onDragMove)    

    function setControlPointPositions(sq, point){
      let idx = point.idx
      , pos = point.position

      switch (idx) {
        case 0: // Top Left
          sq[1].position.y = pos.y
          sq[3].position.x = pos.x
          break

        case 1: // Top Right
          sq[0].position.y = pos.y
          sq[2].position.x = pos.x
          break

        case 2: // Bottom Right
          sq[3].position.y = pos.y
          sq[1].position.x = pos.x
          break

        default: // Bottom Left
          sq[2].position.y = pos.y
          sq[0].position.x = pos.x
          break
      }
    }

    function lerp(a, b, x) {
      return a + x * (b - a)
    }
    
    function getClosestPointOnLine(center, idx, pos){
      let line = {
        x0: center.x + 0,
        y0: center.y + 0,
      } // Line joining the 2 points

      switch (idx % 2) {
        case 0:
          line.x1 = center.x + 100
          line.y1 = center.y + 100
          break

        default:
          line.x1 = center.x - 100
          line.y1 = center.y + 100
          break
      }

      let dx = line.x1 - line.x0
        , dy = line.y1 - line.y0
        , t = ((pos.x - line.x0) * dx + (pos.y - line.y0) * dy) / (dx * dx + dy * dy)

      // t = Math.min(1, Math.max(0, t)) //- Not required here for infinite range

      return {
        x: lerp(line.x0, line.x1, t),
        y: lerp(line.y0, line.y1, t),
        // p: t
      }
    }

    function getPosInBounds(pos, side){
      let width = imgInnerRef.current.clientWidth
      , height = imgInnerRef.current.clientHeight
      return {
        x: Math.min(Math.max(0, pos.x), width) - side / 2,
        y: Math.min(Math.max(0, pos.y), height) - side / 2
      }
    }

    function onDragStart(e){
      currCtnObj = this.ctnObj
      if (!currCtnObj.labelData.active) {
        self.makeMutable(true)
      } else {
        this.data = e.data
        this.alpha = 0.5
        this.dragging = true
      }
      // l(currCtnObj)
    }

    function onDragEnd(){
      // To end rectangle/circle drawing
      bg.emit('pointerup')
      
      let height = imgInnerRef.current.clientHeight
      , width = imgInnerRef.current.clientWidth
      // , size = polyParams.edgeSize
      , size = polyParams.pointSize
      , newPos
      , ld = currCtnObj.labelData
      , gr = currCtnObj.shape
      , sq = currCtnObj.controlPoints

      switch (gr.type) {
        case 'rectangle':
        case 'circle':
          newPos = sq.map(s => {
            return { x: s.x, y: s.y }
          })

          // 4 control points for both rectangle and square
          ld.object_coords = [
            (newPos[0].x + size / 2) / width,
            (newPos[0].y + size / 2) / height,
            (newPos[2].x + size / 2) / width,
            (newPos[2].y + size / 2) / height,
          ].map(x => x.toString())  
        break

        default: // Polygon
          ld.object_coords = sq.map(s => {
            return { x: s.x, y: s.y }
          }).reduce((a, b) => {
            return a.concat(...[(b.x / width).toString(), (b.y / height).toString()])
          }, [])
        break
      }

      this.alpha = 1
      this.dragging = false
      // set the interaction data to null
      this.data = null
    }

    function onDragMove(){
      if(this.dragging){
        let gr = currCtnObj.shape
        , bb = currCtnObj.boundingBox
        , sq = currCtnObj.controlPoints
        , db = currCtnObj.deleteBtn
        , nc = currCtnObj.numberCtn

        switch(eventType){
          case 'point':
            let newPos = this.data.getLocalPosition(this.parent)
            , posInBounds
            
            if(gr.type === 'rectangle'){
              posInBounds = getPosInBounds(newPos, this.s)
              this.position.set(posInBounds.x, posInBounds.y)
              // Rectangular movement - drag other points too
              setControlPointPositions(sq, this)
            }else if(gr.type === 'polygon'){
              // Free movement - move only single point
              posInBounds = getPosInBounds(newPos, this.s)
              this.position.set(posInBounds.x, posInBounds.y)
            } else {
              let point = getClosestPointOnLine(gr.c, this.idx, newPos)
              , width = imgInnerRef.current.clientWidth
              , height = imgInnerRef.current.clientHeight
              
              if (point.x > 0 && point.y > 0 && 
                point.x < width && point.y < height){
                posInBounds = getPosInBounds(point, this.s)
                this.position.set(posInBounds.x, posInBounds.y)
                // Square movement - drag other points too
                setControlPointPositions(sq, this)
              }
            }
            // Capture last good positions
            // l(currCtnObj.lastSqPosArr)
            currCtnObj.lastSqPosArr = []
            sq.forEach(s => currCtnObj.lastSqPosArr.push({ x: s.x, y: s.y }))
          break

          default:   
            // console.clear()
            let e = this.data.originalEvent
            , grB = gr.getBounds()
            , bgB = bg.getBounds()

            if( // If shape's bounding box is within image bounds
              grB.x > 0 && grB.y > 0 &&
              grB.x + grB.width < bgB.width &&
              grB.y + grB.height < bgB.height
            ) {
              inBounds = true
              // Capture last good positions
              currCtnObj.lastSqPosArr = []
              sq.forEach(s => currCtnObj.lastSqPosArr.push({ x: s.x, y: s.y }))
              // l(currCtnObj.lastSqPosArr)
            }
            else {
              inBounds = false
              // l("Last good positions: ", currCtnObj.lastSqPosArr)
              // Restore from last good positions
              sq.forEach((s, idx) => s.position.set(
                currCtnObj.lastSqPosArr[idx].x, 
                currCtnObj.lastSqPosArr[idx].y
              ))
            }
            
            // l("Within Bounds: ", inBounds)
            sq.forEach(s => {
              s.x+= e.movementX
              s.y+= e.movementY              
            })
          break
        }
        // Update points for the shape and redraw
        gr.points = sq.map(s => {
          return { x: s.x + s.s / 2, y: s.y + s.s / 2 }
        })
        gr.draw()

        let bounds = gr.getBounds()
        , center = gr.getCenter()
        
        // Redraw the bounding box
        bb
        .clear()
        .lineStyle(1, 0x979797, 1)
        .drawRect(bounds.x, bounds.y, bounds.width, bounds.height)
        
        // Update delete button, number circle positions
        db.position.set(bounds.x + bounds.width - 50, bounds.y + 15)
        nc.position.set(center.x, center.y)
      }
    }
  }

  catChanged = e => {
    let currCat = this.props.categories.filter(cat => { return cat === e.target.value })[0]
    this.setState({ currCat })
    this.props.catUpdated(currCat)
  }

  tempLblNameChanged = value => this.setState({ tempLblName: value })
  
  handleSuggestions = s => {
    suggestions = s
    fromOptions = false
  }

  addLabel = () => {
    let ld = currCtnObj.labelData

    this.http
    .post('/api/v1/keywords', { 
      name: ld.label.name 
    }, auth)
    .then(res => {
      // l(res.data)

      ld.color = hexJStoCSS(tempColor)
      ld.label = res.data
      this.props.imageUpdated(ld, "add")

      ctnArr.push(currCtnObj)
      currCtnObj.numberCtn.children[1].text = ctnArr.length

      currCtnObj.labelData.ref = React.createRef()
      this.resetForAdding()
      this.drawAllObjects()      
    })
  }

  editLabel = name => {
    let lbl = currCtnObj.labelData
    // l(lbl.label, name, suggestions, fromOptions)
    
    // If selected from list, PUT else POST
    if(fromOptions){
      this.http
      .put('/api/v1/keywords/' + lbl.label.id, {
        name
      }, auth)
      .then(res => {
        lbl.label = res.data
        this.makeImmutable()
      })
      .catch(res => {
        // l(res)
        alert('There is another label with this name. Please use a different name.')
      })
    } else{
      this.http
      .post('/api/v1/keywords', {
        name
      }, auth)
      .then(res => {
        lbl.label = res.data
        this.makeImmutable()
      })
      .catch(res => {
        // l(res)
        alert('There is another label with this name. Please use a different name.')
      })
    }
  }

  deleteLabel = () => {
    let tmpctnArr = [], i = 1
    ctnArr.forEach(ctnObj => {
      if (ctnObj.id === currCtnObj.id){
        this.deleteObject(ctnObj)
      } else {
        ctnObj.numberCtn.children[1].text = i
        tmpctnArr.push(ctnObj)
        i++
      }
    })
    ctnArr = tmpctnArr
    this.props.imageUpdated(currCtnObj.labelData, "delete")
  }
  
  labelSelected = (option, method) => {
    // l("Chosen from options: ", option, method)
    fromOptions = true
    this.setState({ tempLblName: option.name })
    if (method === "click") this.editLabel(option.name)
  } 

  labelClicked = lbl => {    
    currCtnObj = ctnArr.filter(obj => obj.labelData === lbl)[0]
    this.makeMutable(false)
  }

  render(){
    const image = this.props.image
    , labels = image.labels
    , categories = this.props.categories
    
    let cursorImg = "default", inputSize = 1
    
    if(this.state.adding === "polygon"){
      cursorImg = "url('assets/cursor-poly.svg') 9 14.5, auto"
    } else if(this.state.adding === "rectangle"){
      cursorImg = "url('assets/cursor-square.svg') 9 14.5, auto"
    } else if(this.state.adding === "circle"){
      cursorImg = "url('assets/cursor-circle.svg') 9 14.5, auto"
    }

    if (this.state.tempLblName !== "") inputSize = this.state.tempLblName.length

    return (
      <div className="row">
        <div className="col-lg-9 col-xl-8">
          <div className="row pb-0">
            <div className="col-1">
              <div className={"obj-sel " + (this.state.adding === "polygon"?"active":"")} onClick={() => this.startAdding('polygon')}>
                <img src="assets/poly.svg" alt=""/>
                {this.state.adding === 'polygon' && <div className="ctn-add-action">
                  <FontAwesomeIcon onClick={e => this.doneAdding(e, 'Polygon')} icon={faCheck} style={{ color: 'green' }} />
                  <FontAwesomeIcon onClick={e => this.resetForAdding(e)} icon={faTimes} style={{ color: 'red' }} />
                </div>}
              </div>
              <div className={"obj-sel " + (this.state.adding === "rectangle"?"active":"")} onClick={() => this.startAdding('rectangle')}>
                <img src="assets/square.svg" alt=""/>
                {this.state.adding === 'rectangle' && <div className="ctn-add-action">
                  <FontAwesomeIcon onClick={e => this.doneAdding(e, 'Rectangle')} icon={faCheck} style={{ color: 'green' }} />
                  <FontAwesomeIcon onClick={e => this.resetForAdding(e)} icon={faTimes} style={{ color: 'red' }} />
                </div>}
              </div>
              <div className={"obj-sel " + (this.state.adding === "circle"?"active":"")} onClick={() => this.startAdding('circle')}>
                <img src="assets/circle.svg" alt=""/>
                {this.state.adding === 'circle' && <div className="ctn-add-action">
                  <FontAwesomeIcon onClick={e => this.doneAdding(e, 'Circle')} icon={faCheck} style={{ color: 'green' }} />
                  <FontAwesomeIcon onClick={e => this.resetForAdding(e)} icon={faTimes} style={{ color: 'red' }} />
                </div>}
              </div>
            </div>
            <div className="col-11">
              <div ref={imgRef} 
                className={"ctn-photo " + (
                  this.state.imgOrientation === "landscape" ? "ctn-horizontal" : "ctn-vertical"
                )}
              >
                <div className="img-loader h-100 w-100 position-absolute">
                  <svg x="0px" y="0px" width="40px" height="40px" viewBox="0 0 50 50">
                    <path d="M25.251,6.461c-10.318,0-18.683,8.365-18.683,18.683h4.068c0-8.071,6.543-14.615,14.615-14.615V6.461z">
                      <animateTransform attributeType="xml"
                        attributeName="transform"
                        type="rotate"
                        from="0 25 25"
                        to="360 25 25"
                        dur="0.6s"
                        repeatCount="indefinite" />
                    </path>
                  </svg>
                </div>
                <div ref={imgInnerRef} 
                  className="ctn-photo-inner"
                  style={{ cursor: cursorImg }}
                >
                  <img
                    alt={image.key}
                    key={image.key}
                    src={image.image_url}
                    onLoad={e => this.imageLoaded(e.currentTarget)}
                    style={{
                      opacity: this.state.imgOrientation !== "" ? 1 : 0
                    }}
                  />
                </div>
              </div>
            </div>        
          </div>
        </div>
        <div className="col-lg-3 col-xl-4 ctn-cat">
          <div>Photo category</div>
          {categories.length > 0 &&
          <select 
            className="custom form-control" 
            value={this.state.currCat}
            onChange={this.catChanged}
          >
            {categories.map(function(cat, idx){
              return (
                <option key={idx} value={cat}>{cat}</option>
              )
            })}
          </select>}
          <div className="ctn-lbl">
            <div>Objects</div>
            {/* Object.keys(image).length && labels.length &&  */}
            {labels.length === 0?<span>0 objects created.</span>:
            labels.map((lbl, idx) => {
              // l(lbl)
              
              return (
                <div 
                  ref={lbl.ref}
                  onClick={() => this.labelClicked(lbl)}
                  className="lbl-item" 
                  key={idx} 
                  style={{ 
                    boxShadow: lbl.edit ? "0 0 6px 0 #1785fb" : "none"
                  }}
                  >
                  
                  {lbl.form === "Polygon" && 
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <defs>
                      <path id="a" d="M4 16.414V20h3.586l12-12L16 4.414l-12 12zM16.707 2.293l5 5a1 1 0 0 1 0 1.414l-13 13A1 1 0 0 1 8 22H3a1 1 0 0 1-1-1v-5a1 1 0 0 1 .293-.707l13-13a1 1 0 0 1 1.414 0z" />
                    </defs>
                    <use fill={lbl.color} fillRule="nonzero" href="#a"/>
                  </svg>}
                  
                  {lbl.form === "Rectangle" && 
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <defs>
                      <path id="b" d="M5 4a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H5zm0-2h14a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3z"/>
                    </defs>
                    <use fill={lbl.color} fillRule="nonzero" href="#b"/>
                  </svg>}
                  
                  {lbl.form === "Circle" && 
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <defs>
                      <path id="c" d="M12 23C5.925 23 1 18.075 1 12S5.925 1 12 1s11 4.925 11 11-4.925 11-11 11zm0-2a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" />
                    </defs>
                    <use fill={lbl.color} fillRule="nonzero" href="#c"/>
                  </svg>}

                  {lbl.edit && 
                  <div className="lbl-auto-cpl" >
                    <AutoCompleteComponent
                      inputProps={{
                        className: 'lbl-input',
                        size: inputSize,
                        value: this.state.tempLblName
                      }}
                      type="label"
                      inputChanged={this.tempLblNameChanged}
                      optionSelected={this.labelSelected}
                      getCurrSugg={this.handleSuggestions}                      
                    />
                  </div>}
                  {!lbl.edit && <>
                    <span className="lbl-name">{(idx + 1) + ". " + lbl.label.name}</span>
                  </>}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }
}