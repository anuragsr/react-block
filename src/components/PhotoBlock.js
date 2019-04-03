import React, { Component } from 'react'

import AutoCompleteComponent from './AutoCompleteComponent'
import ImageComponent from './ImageComponent'
import FileInputComponent from './FileInputComponent'
import HttpService from '../services/HttpService'
import { l, rand, withIndex, getFormattedTime } from '../helpers/common'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import FilePreviewComponent from './FilePreviewComponent';

const auth = {
  username: 'ml_page',
  password: '}XhE9p2/FQjx9.e'
}
const checkId = rand(5)
// const checkId_p = rand(5)

export default class PhotoBlock extends Component {
  
  constructor(props) {
    super(props)    
    this.http = new HttpService()
    this.state = {
      categories: [],
      photos: [],
      currPhoto: {},
      currPhotoIdx: null,
      showingUploaded: false,
      currPlace: {},
      ml: false,
      uncheckedOnly: false,
      showUpload: false,
      uploadedFiles: [],
      loadUrl: "",
    }
  }

  componentDidMount(){
    this.getPhotos()
    .then(res => {
      let photos = res.data.results
      , currPhoto = photos[0]
      currPhoto.labels.forEach(lbl => lbl.edit = false)
      currPhoto.key = Math.random()
      // l(photos)
      this.setState({ photos, currPhoto })
      this.getCategories()
    })
  }

  getPhotos = () => {
    return this.http.get('/api/v1/photos', {
      limit: 10
    }, auth)
  }
  
  getCategories = () => {
    this.http
    .get('/api/v1/categories')
    .then(res => {
      let categories = res.data.results//, currCat = categories[0]
      this.setState({ categories })
    })
  }

  nextPhoto = () => {
    this.child.destroyCanvas()
    let idx = withIndex(this.state.photos).filter(x => x.value.id === this.state.currPhoto.id)[0].index;
    // l(idx)
    if(idx === this.state.photos.length - 1){
      idx = 0
    }else{
      idx++
    }
    let currPhoto = this.state.photos[idx]
    currPhoto.key = Math.random()
    this.setState({ currPhotoIdx: idx, currPhoto })
  }

  placeSelected = currPlace => this.setState({ currPlace })
  
  mlChanged = e => this.setState({ ml: e.target.checked })
  
  checkChanged = e => this.setState({ uncheckedOnly: e.target.checked })
  
  addPhoto = () => this.setState({ showUpload: true })

  doUpload = () => {
    let photos = this.state.uploadedFiles
    , currPhoto

    if(photos.length){
      currPhoto = photos[0]
      currPhoto.key = Math.random()
      this.setState({ 
        photos, 
        currPhoto,
        currPhotoIdx: 0,
        showingUploaded: true,
      }, () => {
        // Here we call ML and process the photos in the background
        this.state.ml && this.processUploads()
      })      
    }
    
    this.setState({ 
      uploadedFiles: [], 
      showUpload: false 
    })
  }

  processUploads = () => {
    let index = 0
    , photos = this.state.photos
    , currPhoto
    , request = () => {
      let file = photos[index]
      , req = { newBaseUrl: true }
      , fd = new FormData()
      req.file = fd
      
      // Instantiate copy of file, giving it new name (to avoid large image_url sending). Takes roughly same amount of time
      // let fileCopy = new File([file], file.name, { type: file.type })
      // fd.append('file', fileCopy)

      if(file.fromUrl){
        fd.append('file', file.image_url)
      }else{
        fd.append('file', file)
      }

      return this.http
      .post('http://18.202.217.216:5000/category', req)
      .then(res => {
        // l("Category Result:", res) 
        if (res.data.category)
          file.category = { name: Object.keys(res.data.category[0])[0] }
        
        this.http
        .post('http://18.202.217.216:5000/detect', req)
        .then(res => {
          // l("Labels Result:", res) 
          if (typeof res.data === "object") {
            let response = JSON.parse(res.data.result)
            , labels = []
            // l(response)
            response.forEach(r => {
              r && labels.push({
                edit: false,
                form: "Rectangle",
                id: 0,
                label: {
                  id: 0,
                  name: r.label,
                  tag: null
                },
                object_coords: r.float_rect.map(c => c.toString())
              })
            })
            
            file.labels = labels
            // l(file)
          }
          // l(this.state.currPhotoIdx)
          currPhoto = photos[this.state.currPhotoIdx]
          currPhoto.key = Math.random()
          
          this.setState({
            photos,
            currPhoto,
          }, () => {
            // l(this.state)
          })
  
          index++
          if (index >= photos.length) return
          return request()
        })
      })

    }
    return request()
  }

  cancelUpload = () => this.setState({ uploadedFiles: [], showUpload: false })

  filesUploaded = files => {
    // l(files)
    this.setState( state => ({
      uploadedFiles: state.uploadedFiles.concat(...files)    
    }))
  }

  handleCatUpdate = cat => {
    let currPhoto = this.state.currPhoto
    currPhoto.category = { name: cat }
    this.setState({ currPhoto }/* , () => l(this.state.currPhoto) */)
  }

  handleImageUpdate = (label, type) => {
    let currPhoto = this.state.currPhoto
    if(type === "add"){
      currPhoto.labels.push(label)
    } else if (type === "delete"){
      currPhoto.labels = currPhoto.labels.filter(l => l.id !== label.id)
    }
    this.setState({ currPhoto }/* , () => l(this.state.currPhoto) */)
  }

  submit = () => {
    let im = this.state.currPhoto
    , req

    if (!im.uploaded){
      req = {
        id: im.id,
        labels: im.labels,
        category: im.category
      }
    }else{
      req = new FormData()
      let tmp = {...im}
      delete tmp.id
      // l(tmp)
      req.append('file', tmp)
      // if (im.fromUrl) {
      //   req.append('file', im.image_url)
      // }

      // req.append('id', typeof im.id === "string" ? null : im.id)
      // im.labels.forEach(l => {        
      //   req.append('labels[]', l)
      // })
      // req.append('category', im.category)
    }

    this.http
    .put('/api/v1/submit_photo', req, auth)
    .then(res => {
      l(res)
      if (res.status === 200) {
        if(this.state.currPhotoIdx < this.state.photos.length - 1) {
          this.nextPhoto()
        } else {
          this.getPhotos()
          .then(res => {
            let photos = res.data.results
            , currPhoto = photos[0]
            currPhoto.labels.forEach(lbl => lbl.edit = false)
            currPhoto.key = Math.random()
            this.setState({ photos, currPhoto })
          })
        }
      }
    })
  }

  render() {
    const photo = this.state.currPhoto
    , photos = this.state.photos
    , categories = this.state.categories
    , currPhotoIdx = this.state.currPhotoIdx
    , showingUploaded = this.state.showingUploaded

    return (
      <div className="block-content">
        {photos.length > 0 && <>
          <div style={{ display: !this.state.showUpload?"block":"none" }}>
            <div className="row">
              <div className="col-lg-8">
                {showingUploaded && <div className="counter">
                  {currPhotoIdx + 1} of {photos.length}
                </div>}
                <div className="title photo">
                  <span title={photo.name}>{photo.name}</span>
                </div>
                {photo.ml_check_date !== null &&
                <div className="checkTime">
                  <FontAwesomeIcon style={{ color: "green" }} icon={faCheck} />
                  &nbsp;&nbsp;Checked: {getFormattedTime(photo.ml_check_date)}
                </div>}
              </div>
              <div className="col-lg-4 text-right">
                <button onClick={this.nextPhoto} className="btn btn-accent-outline">Next Photo</button>
                <button onClick={this.submit} className="ml-3 btn btn-accent">Submit</button>
              </div>
            </div>
            <div className="body">           
              <div className="row">
                <div className="col-lg-6">
                  <img src="assets/up-icon.png" alt=""/>
                  <a className="up-link" href="javascript:void(0)" onClick={this.addPhoto}>Upload Photos</a>
                </div>
              </div>
              <div className="row">
                <div className="col-lg-6">
                  {/* WithPlace: <pre>{JSON.stringify(this.props.withPlace, null, 2)}</pre> */}
                  {/* Place: <pre>{JSON.stringify(this.state.currPlace, null, 2)}</pre> */}
                  {Boolean(Object.keys(this.state.currPlace).length) && 
                    <div className="mb-4 title-city">
                      Current City: {this.state.currPlace.name}
                    </div>}
                  {!this.props.withPlace &&
                  <AutoCompleteComponent 
                    inputProps={{
                      className: 'tag-inp form-control',
                      placeholder: 'Choose the city',
                    }}
                    type="city"
                    // parent="place"
                    // placeId={this.state.currPlace.id}
                    // changeInput={this.placeInputChanged}
                    optionSelected={this.placeSelected}
                  />}
                </div>
              </div>
              <ImageComponent
                onRef={ref => (this.child = ref)}
                image={photo}
                categories={categories}
                imageUpdated={this.handleImageUpdate}
                catUpdated={this.handleCatUpdate}
              />
              <div className="row">
                <div className="col-lg-6">
                  <div className="custom-control custom-checkbox">
                    <input checked={this.state.ml?"checked":""} onChange={this.mlChanged} type="checkbox" className="custom-control-input" id={checkId} />
                    <label className="custom-control-label" htmlFor={checkId}>Turn On ML</label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: this.state.showUpload?"block":"none" }}>
            <div className="title row">
              <div className="col-lg-6">
                Upload Photos
              </div>
            </div>
            <div className="body">
              <FileInputComponent handleFiles={this.filesUploaded} />
              <FilePreviewComponent images={this.state.uploadedFiles}/>
              <div className="row">
                <div className="col-lg-12">
                  <button onClick={this.doUpload} className="btn btn-accent">Upload</button>
                  <button onClick={this.cancelUpload} className="ml-3 btn btn-accent-outline">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </>}
      </div>
    )
  }
}