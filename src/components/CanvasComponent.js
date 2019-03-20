import React, { Component } from 'react'
import * as PIXI from 'pixi.js'

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

const randHex = () => {
  return "0x" + "000000".replace(/0/g,() => {
    return (~~(Math.random()*16)).toString(16)
  })
}

export default class CanvasComponent extends Component {
  constructor(props) {
    super(props)
    this.imgRef = React.createRef()
    this.state = {
      image: this.props.image
    }
  }

  componentDidMount = () => {
    // l("Image Loaded")
  }

  imageLoaded = () => {
    l("Image Loaded")
    this.createCanvas()
    this.drawObjects()
  }
    
  componentWillUnmount = () => {
    // l("Unmount")
    // this.app.destroy()
  }
  
  componentWillReceiveProps = nextProps => {
    // this.destroyCanvas()
    this.setState({
      image: nextProps.image
    })
  }

  destroyCanvas = () => {
    if(this.app){
      this.imgRef.current.removeChild(this.app.view)
      this.app.destroy()
      this.app = null
    }
  }

  createCanvas = () => {
    // l("Received Image")
    this.destroyCanvas()
    const current = this.imgRef.current
    
    this.app = new PIXI.Application(
      current.clientWidth, 
      current.clientHeight, {
      transparent: true,
      antialias: true
    })
    this.ctn = new PIXI.Container()
    this.app.stage.addChild(this.ctn)

    let view = this.app.view
    view.style.position = "absolute"
    // view.style.outline = "5px solid green"
    view.style.top = view.style.left = 0
    current.appendChild(view)
  }

  drawObjects = () => {
    const labels = this.state.image.labels

    labels.length &&
    labels.forEach(lbl => {
      const form = lbl.form.toLowerCase()
      , coords = lbl.object_rectangle
      // const pointsArr = this.getPoints(lbl.object_rectangle, form)

      switch(form){
        case 'rectangle':
          const height = this.imgRef.current.clientHeight
          , width = this.imgRef.current.clientWidth
          
          let point1 = [coords[0]*width, coords[1]*height]
            , point2 = [coords[2]*width, coords[1]*height]
            , point3 = [coords[2]*width, coords[3]*height]
            , point4 = [coords[0]*width, coords[3]*height]
            , pointsArr = [point1, point2, point3, point4]
    
          this.drawPolygon([].concat(...pointsArr), 15, 2, randHex(), .7, form)
        break
        
        case 'polygon':
          // Draw polygon with n points
          // this.drawPolygon([].concat(...pointsArr), 10, 2, randHex(), .7, form)
        break
        
        case 'circle':
          // Draw circle
          // this.drawCircle(x, y, r, color, edgeWidth, fill)
        break
  
        default: break
      }
    })
    // if(this.state.ml){
    //   l("Getting objects")
    // }else{
    //   l("Drawing objects")
    // }
  }
  
  drawPoints = (points, pointSize, color, type) => {
    
    let arr = []
    for(let i = 0, idx = 0; i < points.length - 1; i+=2){
      let sq = new Square(pointSize, color)
      sq.idx = idx
      sq.position.x = points[i] - pointSize/2
      sq.position.y = points[i+1] - pointSize/2
      sq.interactive = true
      // sq.buttonMode  = true
      if(type === 'rectangle')
        sq.cursor = idx%2?"nesw-resize":"nwse-resize"
      else
        sq.cursor = "move"

      // Event listeners for points
      sq
      .on('pointerdown', onDragStart)
      .on('pointerup', onDragEnd)
      .on('pointerupoutside', onDragEnd)
      .on('pointermove', onDragMove)
  
      function onDragStart(e){
        // store a reference to the data
        // the reason for this is because of multitouch
        // we want to track the movement of this particular touch        
        this.data = e.data
        this.alpha = 0.5
        this.dragging = true      
      }
  
      function onDragEnd(){
        this.alpha = 1
        this.dragging = false
        // set the interaction data to null
        this.data = null
      }
      
      function onDragMove(){
        if (this.dragging){
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
        }
      }

      this.ctn.addChild(sq)
      arr.push(sq)
      idx++
    }
    return arr
  }

  drawPolygon = (points, pointSize, edgeSize, color, opacity, type) => {
    
    // Points as squares
    const sqArr = this.drawPoints(points, pointSize, color, type)    
    
    // Polygon from created squares
    const poly = new Polygon(sqArr, opacity, color, edgeSize, color)
    poly.type = type
    poly.interactive = true
    poly.buttonMode  = true
    
    // Event listeners for polygon
    poly
    .on('pointerdown', onDragStart)
    .on('pointerup', onDragEnd)
    .on('pointerupoutside', onDragEnd)
    .on('pointermove', onDragMove)

    function onDragStart(e){
      // store a reference to the data
      // the reason for this is because of multitouch
      // we want to track the movement of this particular touch
      this.data = e.data
      this.alpha = 0.5
      this.dragging = true      
    }

    function onDragEnd(){
      this.alpha = 1
      this.dragging = false
      // set the interaction data to null
      this.data = null
    }
    
    function onDragMove(){
      if (this.dragging){
        this.sq.forEach(s => {
          s.position.x+= this.data.originalEvent.movementX
          s.position.y+= this.data.originalEvent.movementY
        })
        this.draw()
      }
    }

    this.ctn.addChild(poly)
  }

  render(){
    return (      
      <div ref={this.imgRef} className="ctn-photo">
        <img 
          src={this.state.image.image_url} 
          onLoad={this.imageLoaded}
          width="100%"
          alt=""
        />
      </div>
    )
  }
}