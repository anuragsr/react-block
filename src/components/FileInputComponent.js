import React, { Component } from 'react'
import { l, rand } from '../helpers/common'

export default class FileInputComponent extends Component {
  constructor(props) {
    super(props)
    this.dropInput = React.createRef()
    this.fileInput = React.createRef()
    this.state = {
      dragging: false,
      loadUrl: ""
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
      this.prepareForUpload(e.dataTransfer.files)
      e.dataTransfer.clearData()
      this.dragCounter = 0
    }
  }
  
  prepareForUpload = files => {
    l(files)
    let count = 0
    Array.from(files).forEach(file => {
      //Only pics
      if(file.type.match('image')){
        let r = new FileReader()
        r.onload = event => {
          // l(file.name + " Loaded")
          // l(event.target.result)
          count++
          file.image_url = event.target.result
          file.ml_check_date = null
          file.labels = []
          // file.id = rand(5)
          if(count === files.length)
            this.props.handleFiles(files)
        }
        //Read the image
        r.readAsDataURL(file)
      }
    })
  }

  loadUrlChanged = e => this.setState({ loadUrl: e.target.value })

  doLoadUrl = () => {
    // l(this.state.loadUrl)
    let url = this.state.loadUrl
    , split = url.split("/")

    this.props.handleFiles([{ 
      // id: rand(5),
      name: split[split.length - 1],
      image_url: url, 
      ml_check_date: null,
      labels: [],
      fromURL: true
    }])
    this.setState({ loadUrl: "" })
  }

  render(){
    return (
      <div className="col-lg-6 b-section">
        <div ref={this.dropInput} className="dropzone">
          <img src="assets/dz-img.png" alt=""/>
          <input className="inputfile" id="file" type="file" multiple
            ref={this.fileInput}
            onChange={() => this.prepareForUpload(this.fileInput.current.files)}
          />
          <div>
            Drop any .jpg, .png or <label htmlFor="file">browse your files</label>
          </div>
        </div>
        <div className="url-inp">
          or enter remote photo URL<br/>
          <input value={this.state.loadUrl} onChange={this.loadUrlChanged} type="text" className="form-control tag-inp" placeholder="Place URL here .."/>
          <img onClick={this.doLoadUrl} src="assets/btn-remote.png" alt=""/>
        </div>
      </div>
    )
  }
}