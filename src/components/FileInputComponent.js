import React, { Component } from 'react'
import { l } from '../helpers/common'

export default class FileInputComponent extends Component {
  constructor(props) {
    super(props)
    this.dropInput = React.createRef()
    this.fileInput = React.createRef()
    this.state = {
      dragging: false
    }
  }

  componentDidMount(){
    let div = this.dropInput.current
    div.addEventListener('dragenter', this.handleDragIn)
    div.addEventListener('dragleave', this.handleDragOut)
    div.addEventListener('dragover', this.handleDrag)
    div.addEventListener('drop', this.handleDrop)
  }

  componentWillUnmount(){
    let div = this.dropInput.current
    div.removeEventListener('dragenter', this.handleDragIn)
    div.removeEventListener('dragleave', this.handleDragOut)
    div.removeEventListener('dragover', this.handleDrag)
    div.removeEventListener('drop', this.handleDrop)
  }

  handleDrag = e => {
    e.preventDefault()
    e.stopPropagation()
  }

  handleDragIn = e => {
    e.preventDefault()
    e.stopPropagation()
    this.dragCounter++
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      this.setState({dragging: true})
    }
  }

  handleDragOut = e => {
    e.preventDefault()
    e.stopPropagation()
    this.dragCounter--
    if (this.dragCounter === 0) {
      this.setState({dragging: false})
    }
  }

  handleDrop = e => {
    e.preventDefault()
    e.stopPropagation()
    this.setState({dragging: false})
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      this.props.handleFiles(e.dataTransfer.files)
      e.dataTransfer.clearData()
      this.dragCounter = 0
    }
  }

  render(){
    return (
      <div ref={this.dropInput} className="dropzone">
        <img src="assets/dz-img.png" alt=""/>
        <input className="inputfile" id="file" type="file" multiple
          ref={this.fileInput}
          onChange={() => this.props.handleFiles(this.fileInput.current.files)}
        />
        <div>
          Drop any .jpg, .png or <label htmlFor="file">browse your files</label>
        </div>
      </div>
    )
  }
}