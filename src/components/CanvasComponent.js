import React, { Component } from 'react'
import * as PIXI from 'pixi.js'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash, faTimes, faCheck } from '@fortawesome/free-solid-svg-icons'
import { faEdit, faSave } from '@fortawesome/free-regular-svg-icons'

import HttpService from '../services/HttpService'
import { l } from '../helpers/common'

class Polygon extends PIXI.Graphics {
  constructor(sq, fo, fc, lw, lc) {
    super()
    this.sq = sq || []
    this.fo = fo || 0
    this.fc = fc || 0x000000
    this.lw = lw || 1
    this.lc = lc || 0x000000
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
    .lineStyle(this.lw, this.lc)    
    .beginFill(this.fc, this.fo)
    .drawPolygon(points)
    .endFill()
    .closePath()
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
  constructor(c, r, lw, co, fo) {
    // center, radius, edgeSize, color, opacity
    super()
    this.c = c
    this.r = r || 1
    this.lw = lw || 1
    this.co = co || 0x000000
    this.fo = fo || 1
    this.draw()
  }  

  draw = () => {
    this
    .clear()
    .lineStyle(this.lw, this.co)
    .beginFill(this.co, this.fo)
    .drawCircle(this.c.x, this.c.y, this.r)
    .endFill()
    .closePath()
  }
}

const randHex = () => {
  return "0x" + "000000".replace(/0/g,() => {
    return (~~(Math.random()*16)).toString(16)
  })
}

const getRectangleCoords = (data, type) => {
  let height = imgRef.current.clientHeight
  , width = imgRef.current.clientWidth
  , point1, point2, point3, point4

  switch(type){
    case 'percent':
      let coords = data.object_rectangle.map(c => parseFloat(parseFloat(c).toFixed(2)))  
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
  
  return [].concat(...[point1, point2, point3, point4])
}

const distance = (x1, y1, x2, y2) => Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))

let polyArr = []
, imgRef, bg
, tempPointArr = []
, tempColor
, rectangleCoords = {}
, circleData = {}

export default class CanvasComponent extends Component {
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
    window.addEventListener('resize', this.resizeObjects)
  }

  imageLoaded = () => {
    // l("Image loaded")
    this.createCanvas()
    this.drawObjects()
  }
  
  createCanvas = () => {
    if(this.app){
      imgRef.current.removeChild(this.app.view)
      this.app.destroy()
      this.app = null
    }
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
          tempPoly = this.drawPolygon(tempPointArr, 15, 2, tempColor, .7, 'polygon')
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
      l("Done Creating")
      this.data = null
      this.drawingRect = false
      this.drawingCirc = false      
    })
    
    bg.on('pointermove', () => {
      if(this.data){
        // l("Dragging")
        // l(rectangleCoords)

        let p = this.data.global
        , tempPoly = this.state.tempPoly
        
        if(tempPoly){
          tempPoly.sq && tempPoly.sq.forEach(s => this.ctn.removeChild(s))
          this.ctn.removeChild(tempPoly)
          this.setState({ tempPoly: "" })
        }

        if(this.drawingRect){
          rectangleCoords.br = { x: p.x, y: p.y }
          tempPoly = this.drawPolygon(getRectangleCoords(rectangleCoords, ''), 15, 2, tempColor, .7, 'rectangle')
        }else if(this.drawingCirc){
          circleData.r = distance(circleData.c.x, circleData.c.y, p.x, p.y)
          tempPoly = this.drawCircle(circleData, 2, tempColor, .7)          
        }

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
    bg.visible = true
    tempColor = randHex()
    polyArr.forEach(p => {
      p.visible = false
      p.sq && p.sq.forEach(s => s.visible = false)
    })
    this.setState({ adding: type, tempPoly: "" })
  }

  doneAdding = (e, type) => {
    typeof e !== "undefined" && e.stopPropagation()
    let height = imgRef.current.clientHeight
    , width = imgRef.current.clientWidth
    , tempPoly = this.state.tempPoly

    switch(type){
      case 'rectangle':
        tempPoly.labelData = {
          edit: false,
          form: "Rectangle",
          id: 0,
          label: {
            id: 0, 
            name: "new label", 
            tag: null
          },
          object_rectangle: tempPoly.sq.map(s => {
            return { x: s.x, y: s.y }
          }).reduce((a, b) => {
            return a.concat(...[(b.x/width).toString(), (b.y/height).toString()])
          }, [])
        }

      break
      
      case 'polygon':
        tempPoly.labelData = {
          edit: false,
          form: "Polygon",
          id: 0,
          label: {
            id: 0, 
            name: "new label", 
            tag: null
          },
          object_polygon: tempPoly.sq.map(s => {
            return { x: s.x, y: s.y }
          }).reduce((a, b) => {
            return a.concat(...[(b.x/width).toString(), (b.y/height).toString()])
          }, [])
        }
        
        // Add new label based on the above data

        break
        
        default: 
          tempPoly.labelData = {
            edit: false,
            form: "Circle",
            id: 0,
            label: {
              id: 0, 
              name: "new label", 
              tag: null
            },
            object_circle: [
              (tempPoly.x/width).toString(), 
              (tempPoly.y/height).toString(),
              tempPoly.r.toString()
            ]
          }

          l(tempPoly.getBounds())
        break
    }
      
    polyArr.push(tempPoly)
    this.resetForAdding()
  }
  
  cancelAdd = e => {
    e.stopPropagation()
    let tempPoly = this.state.tempPoly
    tempPoly.sq && tempPoly.sq.forEach(s => this.ctn.removeChild(s))
    this.ctn.removeChild(tempPoly)    
    this.resetForAdding()
  }

  drawObjects = () => {
    this.props.image.labels.forEach(lbl => {
      const form = lbl.form.toLowerCase()      
      switch(form){
        case 'rectangle':    
          // Draw rectangle
          let poly = this.drawPolygon(getRectangleCoords(lbl, 'percent'), 15, 2, randHex(), .7, form)
          poly.labelData = lbl
          polyArr.push(poly)
        break
        
        case 'polygon':
          // Draw polygon with n points - For now blank
          // this.drawPolygon([].concat(...pointsArr), 10, 2, randHex(), .7, form)
        break
        
        default: 
          // Draw circle - For now blank
          // this.drawCircle(x, y, r, color, edgeWidth, fill)
        break
      }
    })
  }

  resizeObjects = () => {
    // Resize canvas according to image
    this.createCanvas()    

    // Redraw shapes based on new canvas size
    // Maintain the positions of coordinates
    let tempPolyArr = []
    polyArr.forEach(poly => {
      const lbl = poly.labelData
      , form = lbl.form.toLowerCase()
      
      switch(form){
        case 'rectangle':
          let tempPoly = this.drawPolygon(getRectangleCoords(lbl, 'percent'), 15, 2, poly.graphicsData[0].fillColor, .7, form)
          tempPoly.labelData = lbl
          tempPolyArr.push(tempPoly)
        break
        
        case 'polygon':
          // Resize polygon with n points
          // this.drawPolygon([].concat(...pointsArr), 10, 2, randHex(), .7, form)
        break
        
        default: 
          // Resize circle
          // this.drawCircle(x, y, r, color, edgeWidth, fill)
        break
      }
    })

    polyArr = tempPolyArr
  }
  
  drawPoints = (points, pointSize, color, type) => {
    let arr = []
    if(type === 'rectangle'){
      for(let i = 0, idx = 0; i < points.length - 1; i+=2){
        let sq = new Square(pointSize, color)
        sq.idx = idx
        sq.position.x = points[i] - pointSize/2
        sq.position.y = points[i+1] - pointSize/2
        arr.push(sq)
        idx++
      }
    }else if(type === 'polygon'){
      for(let i = 0; i < points.length; i++){
        let sq = new Square(pointSize, color)
        sq.position.x = points[i].x - pointSize/2
        sq.position.y = points[i].y - pointSize/2
        arr.push(sq)
      }
    }
    return arr
  }

  drawPolygon = (points, pointSize, edgeSize, color, opacity, type) => {
    // Points as squares
    let sqArr = this.drawPoints(points, pointSize, color, type)
    sqArr.forEach((s, idx) => {
      s.type = type
      this.attachEvents(s, 'point', idx)
      this.ctn.addChild(s)
    })

    // Polygon from created squares
    let poly = new Polygon(sqArr, opacity, color, edgeSize, color)
    poly.type = type

    // Event listeners for polygon
    this.attachEvents(poly, 'shape')
    this.ctn.addChild(poly)
    return poly
  }

  drawCircle = (circleData, edgeSize, color, opacity) => {
    let circ = new Circle(circleData.c, circleData.r, edgeSize, color, opacity)
    circ.type = 'circle'
    this.attachEvents(circ, 'shape')
    this.ctn.addChild(circ)
    return circ
  }

  attachEvents = (graphic, eventType, pointIdx) => {
    graphic.interactive = true
    graphic
    .on('pointerdown', onDragStart)
    .on('pointerup', onDragEnd)
    .on('pointerupoutside', onDragEnd)
    .on('pointermove', onDragMove)

    if(eventType === 'shape'){
      graphic.buttonMode  = true
    }else if(eventType === 'point'){
      if(graphic.type === 'rectangle')
        graphic.cursor = pointIdx%2?"nesw-resize":"nwse-resize"
      else
        graphic.cursor = "move"
    }

    function onDragStart(e){
      // l(e)
      // store a reference to the data
      // the reason for this is because of multitouch
      // we want to track the movement of this particular touch
      this.data = e.data
      this.alpha = 0.5
      this.dragging = true
    }

    function onDragEnd(){
      // To end rectangle/circle drawing
      bg.emit('pointerup')

      let height = imgRef.current.clientHeight
      , width = imgRef.current.clientWidth
      , newPos

      switch(eventType){
        case 'shape':

          switch(this.type){
            case 'rectangle': 
              newPos = this.sq.map(s => {
                return { x: s.x, y: s.y }
              })
              
              this.labelData &&
              (this.labelData.object_rectangle = [
                (newPos[0].x + 15/2)/width,
                (newPos[0].y + 15/2)/height,
                (newPos[2].x + 15/2)/width,
                (newPos[2].y + 15/2)/height,
              ].map(x => x.toString()))

                // l(this.labelData.object_rectangle)
            break
            
            case 'polygon': 
            break

            default: 
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
              (this.parent.labelData.object_rectangle = [
                (newPos[0].x + 15/2)/width,
                (newPos[0].y + 15/2)/height,
                (newPos[2].x + 15/2)/width,
                (newPos[2].y + 15/2)/height,
              ].map(x => x.toString()))

              // l(this.parent.labelData.object_rectangle)
            break
            
            case 'polygon': 
            break

            default: 
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
            if(this.type !== "circle"){
              this.sq.forEach(s => {
                // Would add checks here to prevent out of bounds
                // let tempX, tempY
                // tempX = s.position.x + this.data.originalEvent.movementX
                // if(tempX > 0) 
                //   s.position.x = tempX
                
                // tempY = s.position.y + this.data.originalEvent.movementY
                // if(tempY > 0) 
                //   s.position.y = tempY
      
                s.position.x+= this.data.originalEvent.movementX
                s.position.y+= this.data.originalEvent.movementY
              })
            }else{
              this.c.x+= this.data.originalEvent.movementX
              this.c.y+= this.data.originalEvent.movementY
            }
            this.draw()
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
              this.parent.draw()
            }else if(this.parent.type === 'polygon'){
              // Free movement - move only single point
              this.parent.draw()
            }
          break
        }        
      }
    }
  }

  catChanged = e => {
    let currCat = this.props.categories.filter(cat => { return cat === e.target.value })[0]
    this.setState({ currCat })
  }

  tempLblNameChanged = e => this.setState({ tempLblName: e.target.value })

  editLabel = lbl => {
    l(lbl)
    lbl.edit = true
    this.setState({ tempLblName: lbl.label.name })
  }

  deleteLabel = lbl => {
    l(lbl)
  }
  
  doEditLabel = lbl => {
    l(lbl, this.state.tempLblName)

    this.http
    .put('/api/v1/keywords/'+ lbl.id, {
      name: this.state.tempLblName
    },{
      username: 'ml_page',
      password: '}XhE9p2/FQjx9.e'
    })
    .then(res => {
      l(res.data)
      //  Show notif, undo
      // this.getSuggTags(this.state.currPhoto)
      // this.setState({ 
      //   showNotif: true, 
      //   lastTagId: res.data.id 
      // })
      // setTimeout(() => {
      //   this.setState({ 
      //     showAttr: false,
      //     att: {
      //       manual: 0,
      //       auto: 0
      //     }
      //   })
        
      //   if(this.state.notifType === "submit"){
      //     this.setState({ 
      //       allowAdd: true,
      //       showNotif: false 
      //     })
      //   }
      // }, 5000)
    })   
  }
  
  cancelEdit = lbl => {
    lbl.edit = false
    this.setState({ tempLblName: lbl.label.name })
  }

  render(){
    const image = this.props.image
    , labels = image.labels
    , categories = this.props.categories
        
    return (
      <div className="row">
        <div className="b-section col-lg-1">
          <div className={"obj-sel " + (this.state.adding === "polygon"?"active":"")} onClick={() => this.startAdding('polygon')}>
            <img src="assets/icon-random.png" alt=""/>
            {this.state.adding === 'polygon' && <div className="ctn-add-action">
              <FontAwesomeIcon onClick={e => this.doneAdding(e, 'polygon')} icon={faCheck} style={{ color: 'green' }} />
              <FontAwesomeIcon onClick={e => this.cancelAdd(e)} icon={faTimes} style={{ color: 'red' }} />
            </div>}
          </div>
          <div className={"obj-sel " + (this.state.adding === "rectangle"?"active":"")} onClick={() => this.startAdding('rectangle')}>
            <img src="assets/icon-square.png" alt=""/>
            {this.state.adding === 'rectangle' && <div className="ctn-add-action">
              <FontAwesomeIcon onClick={e => this.doneAdding(e, 'rectangle')} icon={faCheck} style={{ color: 'green' }} />
              <FontAwesomeIcon onClick={e => this.cancelAdd(e)} icon={faTimes} style={{ color: 'red' }} />
            </div>}
          </div>
          <div className={"obj-sel " + (this.state.adding === "circle"?"active":"")} onClick={() => this.startAdding('circle')}>
            <img src="assets/icon-circle.png" alt=""/>
            {this.state.adding === 'circle' && <div className="ctn-add-action">
              <FontAwesomeIcon onClick={e => this.doneAdding(e, 'circle')} icon={faCheck} style={{ color: 'green' }} />
              <FontAwesomeIcon onClick={e => this.cancelAdd(e)} icon={faTimes} style={{ color: 'red' }} />
            </div>}
          </div>
        </div>
        <div className="b-section col-lg-7">
          <div ref={imgRef} className={"ctn-photo " + (this.state.adding !== ""?"adding":"")}>
            <img 
              src={image.image_url} 
              onLoad={this.imageLoaded}
              width="100%"
              alt=""
            />
          </div>
        </div>        
        <div className="b-section col-lg-4 ctn-cat">
          <div>Photo category</div>
          {categories.length > 0 &&
          <select 
            className="custom form-control" 
            value={this.state.currCat.id}
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
                <div className="lbl-item" key={idx}>
                  <div>{idx + 1}</div>
                  {lbl.edit && <>
                    <input 
                      className="form-control" 
                      value={this.state.tempLblName} 
                      onChange={this.tempLblNameChanged}                        
                    />
                    <span onClick={() => this.doEditLabel(lbl)}>
                      <FontAwesomeIcon icon={faSave} />
                    </span>
                    <span onClick={() => this.cancelEdit(lbl)}>
                      <FontAwesomeIcon icon={faTimes} />
                    </span>
                  </>}
                  {!lbl.edit && <>
                    <span style={{ color: "#2c405a" }}>{lbl.label.name}</span>
                    <span onClick={() => this.editLabel(lbl)}>
                      <FontAwesomeIcon icon={faEdit} />
                    </span>
                    <span onClick={() => this.deleteLabel(lbl)}>
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