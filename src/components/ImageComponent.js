import React, { Component } from 'react'
import * as PIXI from 'pixi.js'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash, faTimes, faCheck } from '@fortawesome/free-solid-svg-icons'
import { faEdit, faSave } from '@fortawesome/free-regular-svg-icons'

import HttpService from '../services/HttpService'
import { l } from '../helpers/common'

const auth = {
  username: 'ml_page',
  password: '}XhE9p2/FQjx9.e'
}

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

class Polygon extends PIXI.Graphics {
  constructor(sq, params) {
    super()
    this.sq = sq || []
    this.dashed = params.dashed
    this.fo = params.opacity || 0
    this.co = params.color || 0x000000
    this.lw = params.edgeSize || 1
    this.sq.forEach(s => s.parent = this)
    this.draw()
  }

  draw = () => {
    let points = [], i = 0    
    this.sq.forEach(s => {
      points[i] = s.position.x + s.s/2
      points[i+1] = s.position.y + s.s/2
      i+=2
    })

    this
    .clear()
    .lineStyle(this.lw, this.co, this.dashed.enabled?0:1)
    .beginFill(this.co, this.fo)
    .drawPolygon(points)
    .endFill()
    .closePath()

    if(this.dashed.enabled){
      points = this.sq.map(s => {
        return {
          x: s.position.x + s.s/2,
          y: s.position.y + s.s/2
        }
      })
      this
      .lineStyle(this.lw, this.co, 1)
      .drawDashedBorder(points, 8, 7)
    }
  }
}

class Square extends PIXI.Graphics {
  constructor(s, c) {
    super()
    this.s = s || 1
    this.c = c || 0x000000
    this.draw()
  }  

  draw = () => {
    this
    .clear()
    .beginFill(this.c)
    .drawRect(0, 0, this.s, this.s)
    .endFill()
  }
}

class Circle extends PIXI.Graphics {
  constructor(sq, params) {
    super()
    this.sq = sq || []
    this.dashed = params.dashed
    this.c = params.circleData.c
    this.r = params.circleData.r || 1
    this.lw = params.edgeSize || 1
    this.co = params.color || 0x000000
    this.fo = params.opacity || 1
    this.sq.forEach(s => s.parent = this)
    this.draw()
  }  

  draw = () => {
    this
    .clear()
    .lineStyle(this.lw, this.co, this.dashed.enabled?0:1)
    .beginFill(this.co, this.fo)
    .drawCircle(this.c.x, this.c.y, this.r)
    .endFill()
    .closePath()

    if(this.dashed.enabled){
      let points = []
      , noPoints = this.r/2
      , angle = 2*Math.PI/noPoints

      for(let i = 0; i < noPoints; i++){
        // let x = angle*i - Math.PI/2
        points.push({
          x: this.c.x + this.r*Math.cos(angle*i),
          y: this.c.y + this.r*Math.sin(angle*i)
        })
      }
      
      this
      .lineStyle(this.lw, this.co, 1)
      .drawDashedBorder(points, 8, 7)
    }
  }
}

class NumberCircle extends PIXI.Graphics {
  constructor(params) {
    super()
    this.c = params.c
    this.r = params.r || 1
    this.es = params.edgeSize || 1
    this.lc = params.lineColor || 0x000000
    this.fc = params.fillColor || 0x000000
    this.fo = params.opacity || 1
    this.draw()
  }

  draw = () => {
    this
    .clear()
    .lineStyle(this.es, this.lc, 1)
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
, distance = (x1, y1, x2, y2) => Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
, getCoords = (data, type, subtype) => {
  let height = imgRef.current.clientHeight
  , width = imgRef.current.clientWidth
  , coords
  , returnVar

  switch(type){
    case 'rectangle':
      let point1, point2, point3, point4
      switch(subtype){
        case 'percent':
          coords = data.object_coords.map(c => parseFloat(parseFloat(c).toFixed(2)))  
          point1 = [coords[0]*width, coords[1]*height]
          point2 = [coords[2]*width, coords[1]*height]
          point3 = [coords[2]*width, coords[3]*height]
          point4 = [coords[0]*width, coords[3]*height]      
        break
    
        default:
          point1 = [data.tl.x, data.tl.y]
          point2 = [data.br.x, data.tl.y]
          point3 = [data.br.x, data.br.y]
          point4 = [data.tl.x, data.br.y]
        break
      }  
      returnVar = [].concat(...[point1, point2, point3, point4])
    break
    
    case 'polygon':
      coords = data.object_coords.map(c => parseFloat(parseFloat(c).toFixed(2)))
      returnVar = []

      for(let i = 0; i < coords.length - 1; i+=2){
        returnVar.push({
          x: coords[i]*width,
          y: coords[i+1]*height
        })
      }
    break
    
    default:
      coords = data.object_coords.map(c => parseFloat(parseFloat(c).toFixed(2)))      
      returnVar = {
        c: { x: coords[0]*width, y: coords[1]*height },
        r: coords[2]*width
      }
    break
  }

  return returnVar
}
, getGraphicCenter = gr => {
  let center
  
  if(gr.type === "circle"){
    center = gr.c
  }else{
    center = gr.sq.reduce((a, b) => {
      return { x: a.x + b.x, y: a.y + b.y }
    }, { x: 0, y: 0 })
    
    let len = gr.sq.length
    center.x/=len
    center.y/=len
  }

  return center
}
, polyArr = []
, imgRef, bg
, tempPointArr = []
, tempColor
, rectangleCoords = {}
, circleData = {}
, polyParams = {  
  // opacity: .7,
  // edgeSize: 2,
  opacity: .4,
  edgeSize: 5,
  pointSize: 15,
  dashed: {
    enabled: true,
    dash: 8,
    gap: 7,
  }
}

export default class ImageComponent extends Component {
  constructor(props) {
    super(props)
    imgRef = React.createRef()
    this.http = new HttpService()
    this.state = {
      currCat: "",
      tempLblName: "",
      adding: "",
      tempPoly: ""
    }
  }

  componentDidMount(){
    this.props.onRef(this)
    window.addEventListener('resize', this.resizeObjects)
  }

  componentWillReceiveProps = nextProps => {
    // l("Next Props")
    if(nextProps.image.category){
      let currCat = nextProps.image.category.name
      this.setState({ currCat })
    }
  }

  imageLoaded = () => {
    // l("New Image loaded")
    polyArr.length = 0
    this.createCanvas()
    this.drawObjects()
  }
  
  destroyCanvas = () => {
    if(this.app){
      imgRef.current.removeChild(this.app.view)
      this.app.destroy()
      this.app = null
    }
  }

  createCanvas = () => {
    this.destroyCanvas()
    this.app = new PIXI.Application(
      imgRef.current.clientWidth, 
      imgRef.current.clientHeight, {
      transparent: true,
      antialias: true
    })
    this.ctn = new PIXI.Container()
    this.app.stage.addChild(this.ctn)

    let view = this.app.view
    view.style.position = "absolute"
    // view.style.outline = "5px solid green"
    view.style.top = view.style.left = 0
    imgRef.current.appendChild(view)

    // Blank rectangle for click events for adding shapes
    this.addBackground()        
  }

  addBackground = () => {
    bg = new PIXI.Graphics()
    bg
    .beginFill(0xFFFF00, 0)
    .lineStyle(0, 0xFF0000)
    .drawRect(0, 0, imgRef.current.clientWidth, imgRef.current.clientHeight)
    this.ctn.addChild(bg)

    bg.interactive = true
    bg.visible = false
    bg.cursor = "crosshair"

    bg.on('pointerdown', e => {
      let c = {...e.data.global}
      , tempPoly = this.state.tempPoly

      if(tempPoly){
        tempPoly.sq.forEach(s => this.ctn.removeChild(s))
        this.ctn.removeChild(tempPoly)
        this.setState({ tempPoly: "" })
      }

      switch(this.state.adding){
        case 'rectangle':
          this.data = e.data
          this.drawingRect = true
          rectangleCoords.tl = { x: c.x, y: c.y }
        break
        
        case 'polygon':
          tempPointArr.push(c)
          let params = {
            ...polyParams,
            type: 'polygon',
            color: tempColor,            
            points: tempPointArr,
          }
          tempPoly = this.drawShape(params)

          // tempPoly = this.drawPolygon(tempPointArr, 15, 2, tempColor, .7, )
          this.setState({ tempPoly })
        break
        
        default:
          this.data = e.data
          this.drawingCirc = true
          circleData.c = c
        break
      }
    })

    bg.on('pointerup', e => {
      // l("Done Creating")
      this.data = null
      this.drawingRect = false
      this.drawingCirc = false      
    })
    
    bg.on('pointermove', () => {
      if(this.data){
        let p = this.data.global
        , tempPoly = this.state.tempPoly
        , params

        if(tempPoly){
          tempPoly.sq && tempPoly.sq.forEach(s => this.ctn.removeChild(s))
          this.ctn.removeChild(tempPoly)
          this.setState({ tempPoly: "" })
        }

        if(this.drawingRect){
          rectangleCoords.br = { x: p.x, y: p.y }
          params = {
            ...polyParams,
            type: 'rectangle',
            color: tempColor,
            points: getCoords(rectangleCoords, 'rectangle', ''),
          }
        }else if(this.drawingCirc){
          circleData.r = distance(circleData.c.x, circleData.c.y, p.x, p.y)
          params = {
            ...polyParams,
            type: 'circle',
            color: tempColor,
            circleData: circleData,
          }
        }

        tempPoly = this.drawShape(params)
        this.setState({ tempPoly })
      }
    })
  }

  resetForAdding = () => {
    bg.visible = false
    tempPointArr.length = 0
    polyArr.forEach(p => {
      p.visible = true
      p.sq && p.sq.forEach(s => s.visible = true)
    })
    this.setState({ adding: "", tempPoly: "" })
  }

  startAdding = type => {
    // l(bg)
    let tempPoly = this.state.tempPoly
    bg.visible = true
    tempColor = randHex()
    polyArr.forEach(p => {
      p.visible = false
      p.sq && p.sq.forEach(s => s.visible = false)
    })
    if(tempPoly){
      tempPoly.sq.forEach(s => this.ctn.removeChild(s))
      this.ctn.removeChild(tempPoly)
    }
    this.setState({ adding: type, tempPoly: "" })
  }

  doneAdding = (e, type) => {
    typeof e !== "undefined" && e.stopPropagation()
    let height = imgRef.current.clientHeight
    , width = imgRef.current.clientWidth
    , tempPoly = this.state.tempPoly
    , labelData = {
      edit: false,
      active: false,
      form: type,
      id: 0,
      label: {
        id: 0,
        name: "new label",
        tag: null
      },
    }

    switch(type){
      case 'Rectangle':
        let tmp = []
        tempPoly.sq.forEach((s, idx) => {
          if(idx%2 === 0){
            tmp.push(
              ((s.x + s.s/2)/width).toString(), 
              ((s.y + s.s/2)/height).toString()
            )
          }            
        })
        labelData.object_coords = tmp        
      break
      
      case 'Polygon':
        labelData.object_coords = tempPoly.sq.map(s => {
          return { x: s.x, y: s.y }
        }).reduce((a, b) => {
          return a.concat(...[(b.x / width).toString(), (b.y / height).toString()])
        }, [])
      break
        
      default: 
        labelData.object_coords = [
          (tempPoly.c.x / width).toString(),
          (tempPoly.c.y / height).toString(),
          (tempPoly.r / width).toString()
        ]
      break
    }

    // Add new label based on the above data
    tempPoly.labelData = labelData
    this.addLabel(tempPoly)
  }
  
  cancelAdd = e => {
    e.stopPropagation()
    let tempPoly = this.state.tempPoly
    tempPoly.sq && tempPoly.sq.forEach(s => this.ctn.removeChild(s))
    this.ctn.removeChild(tempPoly)    
    this.resetForAdding()
  }

  drawObjects = () => {
    this.props.image.labels.forEach((lbl, idx) => {
      let form = lbl.form.toLowerCase()
      , params
      , poly
      , color = randHex()  

      switch(form){
        case 'rectangle':    
          params = {
            ...polyParams,
            type: form,
            color: color,
            points: getCoords(lbl, 'rectangle', 'percent'),
          }
        break
        
        case 'polygon':
          params = {
            ...polyParams,
            type: form,
            color: color,
            points: getCoords(lbl, 'polygon'),
          }
        break
        
        default:           
          params = {
            ...polyParams,
            type: form,
            color: color,
            circleData: getCoords(lbl, 'circle'),
          }
        break
      }

      params.idx = idx + 1
      poly = this.drawShape(params)
      lbl.color = hexJStoCSS(color)
      lbl.edit = false
      lbl.active = false
      poly.labelData = lbl

      this.addNumberLabel(poly, params.idx)
      polyArr.push(poly)
    })

    this.props.imageUpdated()
  }

  resizeObjects = () => {
    // Resize canvas according to image
    this.createCanvas()    

    // Redraw shapes based on new canvas size
    // Maintain the positions of coordinates
    let tempPolyArr = []
    , tempPoly
    
    polyArr.forEach(poly => {
      let lbl = poly.labelData
      , form = lbl.form.toLowerCase()
      , params = {
        ...polyParams,
        type: form,
        color: poly.graphicsData[0].fillColor,
      }
      
      switch(form){
        case 'rectangle':
          // params.points = getRectangleCoords(lbl, 'percent')
          params.points = getCoords(lbl, form, 'percent')
        break
        
        case 'polygon':
          params.points = getCoords(lbl, form)
        break
        
        default: 
          params.circleData = getCoords(lbl, form)     
        break
      }

      // l(params)
      tempPoly = this.drawShape(params)
      tempPoly.labelData = lbl
      tempPolyArr.push(tempPoly)
    })

    polyArr = tempPolyArr
  }

  drawShape = params => {
    let type = params.type
    , sqArr = []
    , poly

    switch(type){
      case 'rectangle':
        // Points as squares
        for(let i = 0, idx = 0; i < params.points.length - 1; i+=2){
          let sq = new Square(params.pointSize, params.color)
          sq.idx = idx
          sq.position.x = params.points[i] - params.pointSize/2
          sq.position.y = params.points[i+1] - params.pointSize/2
          sqArr.push(sq)
          idx++
        }

        sqArr.forEach((s, idx) => {
          this.addToStage(type, s, 'point', idx)
        })
        
        // Rectangle from created squares
        poly = new Polygon(sqArr, params)
      break
      
      case 'polygon':
        // Points as squares
        for(let i = 0; i < params.points.length; i++){
          let sq = new Square(params.pointSize, params.color)
          sq.position.x = params.points[i].x - params.pointSize/2
          sq.position.y = params.points[i].y - params.pointSize/2
          sqArr.push(sq)
        }

        sqArr.forEach(s => {
          this.addToStage(type, s, 'point')
        })
        
        // Polygon from created squares
        poly = new Polygon(sqArr, params)
      break

      default:
        // Single control square
        let sq = new Square(params.pointSize, params.color)
        sq.position.x = params.circleData.c.x + params.circleData.r - params.pointSize/2
        sq.position.y = params.circleData.c.y - params.pointSize/2
        
        this.addToStage(type, sq, 'point')
        
        // Circle containing one square for resize
        poly = new Circle([sq], params)
      break
    }

    this.addToStage(type, poly, 'shape')
    return poly
  }

  addToStage = (graphicType, graphic, eventType, pointIdx) => {
    this.ctn.addChild(graphic)
    graphic.type = graphicType
    graphic.interactive = true

    if(eventType === 'shape'){
      graphic.buttonMode  = true
    }else if(eventType === 'point'){
      if(graphic.type === 'rectangle')
        graphic.cursor = pointIdx%2?"nesw-resize":"nwse-resize"
      else
        graphic.cursor = "move"
    }
    
    graphic
    .on('pointerdown', onDragStart)
    .on('pointerup', onDragEnd)
    .on('pointerupoutside', onDragEnd)
    .on('pointermove', onDragMove)

    function onDragStart(e){
      // l(e)
      let ld
      switch(eventType){
        case 'point':
          ld = this.parent.labelData
          if (!ld || (ld && ld.active)) {
            this.data = e.data
            this.alpha = 0.5
            this.dragging = true
          }
        break
        
        default:
          ld = this.labelData
          if (ld && !ld.active){
            polyArr.forEach(p => p.labelData.active = false)
            ld.active = true
          }
          else{
            this.data = e.data
            this.alpha = 0.5
            this.dragging = true
          }
        break
      }
    }

    function onDragEnd(){
      // To end rectangle/circle drawing
      bg.emit('pointerup')

      let height = imgRef.current.clientHeight
      , width = imgRef.current.clientWidth
      , size = polyParams.edgeSize
      , newPos

      switch(eventType){
        case 'shape':

          switch(this.type){
            case 'rectangle': 
              newPos = this.sq.map(s => {
                return { x: s.x, y: s.y }
              })
              this.labelData &&
              (this.labelData.object_coords = [
                (newPos[0].x + size/2)/width,
                (newPos[0].y + size/2)/height,
                (newPos[2].x + size/2)/width,
                (newPos[2].y + size/2)/height,
              ].map(x => x.toString()))
              // l(this.labelData.object_coords)
            break
            
            case 'polygon':               
              this.labelData &&
              (this.labelData.object_coords = this.sq.map(s => {
                return { x: s.x, y: s.y }
              }).reduce((a, b) => {
                return a.concat(...[(b.x/width).toString(), (b.y/height).toString()])
              }, []))
              // l(this.labelData.object_coords)
            break

            default:   
              // l(this)            
              this.labelData &&
              (this.labelData.object_coords = [
                (this.c.x/width).toString(), 
                (this.c.y/height).toString(),
                (this.r/width).toString()
              ])
            break
          }

        break
        
        default:

          switch(this.parent.type){
            case 'rectangle': 
              newPos = this.parent.sq.map(s => {
                return { x: s.x, y: s.y }
              })

              this.parent.labelData &&
              (this.parent.labelData.object_coords = [
                (newPos[0].x + size/2)/width,
                (newPos[0].y + size/2)/height,
                (newPos[2].x + size/2)/width,
                (newPos[2].y + size/2)/height,
              ].map(x => x.toString()))
              // l(this.parent.labelData.object_coords)
            break
            
            case 'polygon': 
              this.parent.labelData &&
              (this.parent.labelData.object_coords = this.parent.sq.map(s => {
                return { x: s.x, y: s.y }
              }).reduce((a, b) => {
                return a.concat(...[(b.x/width).toString(), (b.y/height).toString()])
              }, []))
              // l(this.parent.labelData.object_coords)
            break

            default: 
              this.parent.labelData &&
              (this.parent.labelData.object_coords = [
                (this.parent.c.x/width).toString(), 
                (this.parent.c.y/height).toString(),
                (this.parent.r/width).toString()
              ])
            break
          }
          
        break
      }  

      this.alpha = 1
      this.dragging = false
      // set the interaction data to null
      this.data = null
    }

    function onDragMove(){
      if(this.dragging){
        switch(eventType){
          case 'shape':
            if(this.type === "circle"){
              this.c.x+= this.data.originalEvent.movementX
              this.c.y+= this.data.originalEvent.movementY
            }
            this.sq.forEach(s => {
              // Would add checks here to prevent out of bounds
              s.position.x+= this.data.originalEvent.movementX
              s.position.y+= this.data.originalEvent.movementY
            })
            this.draw()
            if(this.children.length){
              let center = getGraphicCenter(this)
              this.children[0].position.set(center.x, center.y)
            }
          break

          default:
            let newPos = this.data.getLocalPosition(this.parent)        
            this.position.x = newPos.x - this.s/2
            this.position.y = newPos.y - this.s/2
            if(this.parent.type === 'rectangle'){
              // Rectangular movement - drag other points too
              switch(this.idx){
                case 0: // Top Left
                  this.parent.sq[1].position.y = this.position.y
                  this.parent.sq[3].position.x = this.position.x
                break
                
                case 1: // Top Right
                  this.parent.sq[0].position.y = this.position.y
                  this.parent.sq[2].position.x = this.position.x
                break
                
                case 2: // Bottom Right
                  this.parent.sq[3].position.y = this.position.y
                  this.parent.sq[1].position.x = this.position.x
                break
                
                default: // Bottom Left
                  this.parent.sq[2].position.y = this.position.y
                  this.parent.sq[0].position.x = this.position.x
                break              
              }
            }else if(this.parent.type === 'circle'){
              // Change circle radius
              this.parent.r = distance(
                this.parent.c.x, 
                this.parent.c.y,
                newPos.x,
                newPos.y
              )
            }else{
              // Free movement - move only single point
            }
            this.parent.draw()
            if (this.parent.children.length) {
              let center = getGraphicCenter(this.parent)
              this.parent.children[0].position.set(center.x, center.y)
            }
          break
        }
      }
    }
  }

  addNumberLabel = (graphic, index) => {
    let circCtn = new PIXI.Container()
    , center = getGraphicCenter(graphic)
    graphic.addChild(circCtn)      

    if (graphic.type !== "circle")
      circCtn.pivot.set(-8, -8)

    circCtn.position.x = center.x
    circCtn.position.y = center.y

    let circ = new NumberCircle({
      c: { x: 0, y: 0 },
      r: 15,
      edgeSize: 2,
      lineColor: 0x000000,
      fillColor: 0xffffff,
      opacity: 1
    })
    circCtn.addChild(circ)

    let text = new PIXI.Text(index, new PIXI.TextStyle({
      fontSize: 14,
      fontWeight: "bold",
      align: "center",
      wordWrap: true
    }))

    text.anchor.set(0.5, 0.5)
    circCtn.addChild(text)
  }

  catChanged = e => {
    let currCat = this.props.categories.filter(cat => { return cat === e.target.value })[0]
    this.setState({ currCat })
    this.props.catUpdated(currCat)
  }

  tempLblNameChanged = e => this.setState({ tempLblName: e.target.value })

  addLabel = tempPoly => {
    // l(tempPoly.labelData)    
    this.http
    .post('/api/v1/keywords', { 
      name: tempPoly.labelData.label.name 
    }, auth)
    .then(res => {
      l(res.data)
      // l(tempPoly.labelData)
      tempPoly.labelData.color = hexJStoCSS(tempColor)
      tempPoly.labelData.label = res.data

      this.props.imageUpdated(tempPoly.labelData, "add")
      polyArr.push(tempPoly)
      
      this.addNumberLabel(tempPoly, polyArr.length)
      this.resetForAdding()
    })
  }
  
  editLabel = lbl => {
    lbl.edit = true
    this.setState({ tempLblName: lbl.label.name })
  }

  deleteLabel = lbl => {      
    let tmpPolyArr = []
    polyArr.forEach(p => {
      if (p.labelData === lbl){
        p.sq.forEach(s => this.ctn.removeChild(s))
        this.ctn.removeChild(p)
      } else{
        tmpPolyArr.push(p)
      }
    })
    polyArr = tmpPolyArr
    this.props.imageUpdated(lbl, "delete")
  }
  
  doEditLabel = lbl => {
    this.http
    .put('/api/v1/keywords/'+ lbl.label.id, {
      name: this.state.tempLblName
    }, auth)
    .then(res => {
      lbl.label = res.data
      lbl.edit = false
      this.props.imageUpdated()
    })
    .catch(res => {
      // l(res)
      alert('There is another label with this name. Please use a different name.')
    })
  }
  
  cancelEdit = lbl => {
    lbl.edit = false
    this.setState({ tempLblName: lbl.label.name })
  }

  makeImmutable = () => {
    polyArr.forEach(p => p.labelData.active = false)
  }

  labelClicked = lbl => {
    let tmp
    polyArr.forEach(p => {
      if (p.labelData === lbl){
        // Removing from ctn, to add at end later
        tmp = p
        this.ctn.removeChild(p)
        p.sq.forEach(s => this.ctn.removeChild(s))
      }else{
        p.labelData.active = false
      }
    })
    tmp.labelData.active = true
    tmp.sq.forEach(s => {
      this.ctn.addChild(s)
      s.parent = tmp
    })
    this.ctn.addChild(tmp)
  }

  render(){
    const image = this.props.image
    , labels = image.labels
    , categories = this.props.categories
        
    return (
      <div className="row">
        <div className="col-lg-8">
          <div className="row pb-0">
            <div className="col-2 pr-0">
              <div className={"obj-sel " + (this.state.adding === "polygon"?"active":"")} onClick={() => this.startAdding('polygon')}>
                <img src="assets/icon-random.png" alt=""/>
                {this.state.adding === 'polygon' && <div className="ctn-add-action">
                  <FontAwesomeIcon onClick={e => this.doneAdding(e, 'Polygon')} icon={faCheck} style={{ color: 'green' }} />
                  <FontAwesomeIcon onClick={e => this.cancelAdd(e)} icon={faTimes} style={{ color: 'red' }} />
                </div>}
              </div>
              <div className={"obj-sel " + (this.state.adding === "rectangle"?"active":"")} onClick={() => this.startAdding('rectangle')}>
                <img src="assets/icon-square.png" alt=""/>
                {this.state.adding === 'rectangle' && <div className="ctn-add-action">
                  <FontAwesomeIcon onClick={e => this.doneAdding(e, 'Rectangle')} icon={faCheck} style={{ color: 'green' }} />
                  <FontAwesomeIcon onClick={e => this.cancelAdd(e)} icon={faTimes} style={{ color: 'red' }} />
                </div>}
              </div>
              <div className={"obj-sel " + (this.state.adding === "circle"?"active":"")} onClick={() => this.startAdding('circle')}>
                <img src="assets/icon-circle.png" alt=""/>
                {this.state.adding === 'circle' && <div className="ctn-add-action">
                  <FontAwesomeIcon onClick={e => this.doneAdding(e, 'Circle')} icon={faCheck} style={{ color: 'green' }} />
                  <FontAwesomeIcon onClick={e => this.cancelAdd(e)} icon={faTimes} style={{ color: 'red' }} />
                </div>}
              </div>
            </div>
            <div className="col-10 pl-0">
              <div ref={imgRef} className={"ctn-photo " + (this.state.adding !== ""?"adding":"")}>
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
                <img 
                  alt={image.key}
                  key={image.key}
                  src={image.image_url}
                  onLoad={this.imageLoaded}
                  width="100%"
                />
              </div>
            </div>        
          </div>
        </div>
        <div className="col-lg-4 ctn-cat">
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
            {/* Object.keys(image).length && labels.length &&  */}
            {labels.map((lbl, idx) => {
              return (
                <div 
                  onClick={() => this.labelClicked(lbl)}
                  className="lbl-item" 
                  key={idx} 
                  style={{ 
                    border: "5px dashed " + lbl.color,
                    boxShadow: lbl.edit?"0 10px 20px 0 rgba(0, 0, 0, .1)":"none"
                  }}
                  >
                  <div style={{ background: lbl.color }}>{idx + 1}</div>                  
                  {lbl.edit && <>
                    <input 
                      className="form-control" 
                      value={this.state.tempLblName} 
                      onChange={this.tempLblNameChanged}                        
                    />
                    <span onClick={e => {e.stopPropagation(); this.doEditLabel(lbl)}}>
                      <FontAwesomeIcon icon={faSave} />
                    </span>
                    <span onClick={e => {e.stopPropagation(); this.cancelEdit(lbl)}}>
                      <FontAwesomeIcon icon={faTimes} />
                    </span>
                  </>}
                  {!lbl.edit && <>
                    <span style={{ color: "#2c405a" }}>{lbl.label.name}</span>
                    <span onClick={e => {e.stopPropagation(); this.editLabel(lbl)}}>
                      <FontAwesomeIcon icon={faEdit} />
                    </span>
                    <span onClick={e => {e.stopPropagation(); this.deleteLabel(lbl)}}>
                      <FontAwesomeIcon icon={faTrash} />
                    </span>
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