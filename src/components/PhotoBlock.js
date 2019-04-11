import React, { Component } from 'react'

import AutoCompleteComponent from './AutoCompleteComponent'
import ImageComponent from './ImageComponent'
import FileInputComponent from './FileInputComponent'
import HttpService from '../services/HttpService'
import { l, auth, rand, withIndex, getFormattedTime } from '../helpers/common'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import FilePreviewComponent from './FilePreviewComponent';

// const auth = {
//   username: 'ml_page',
//   password: '}XhE9p2/FQjx9.e'
// }
const checkId = rand(5)
// const checkId_p = rand(5)
const getActive = arr => {
  let tmp
  for(let i = 0; i < arr.length; i++){
    if(arr[i].active){
      tmp = arr[i]
      break
    }
  }
  return tmp
}

export default class PhotoBlock extends Component {
  
  constructor(props) {
    super(props)
    l(this.props)
    this.http = new HttpService()
    this.state = {
      categories: [],
      photos: [],
      currPhoto: {},
      currPhotoIdx: null,
      showingUploaded: false,
      currPlace: {},
      uncheckedOnly: false,
      ml: !false,
      showUpload: !false,
      uploadedFiles: [],
      loadUrl: "",
    }
  }

  componentDidMount(){
    this.doApiCall(this.props)
  }

  componentWillReceiveProps = nextProps => {
    // l("Next Props", nextProps)
    this.doApiCall(nextProps)    
  }

  doApiCall = props => {
    let placeId = null, canCall = false

    if (props.placeObj.withPlace) {
      if (!Object.keys(props.placeObj.place).length) {
        l("Wait for place selection")
      } else {
        placeId = props.placeObj.place.id
        canCall = true
      }
    } else {
      canCall = true
    }

    canCall && this.getPhotos(placeId)
  }

  getPhotos = id => {
    let params = {
      limit: 10,
      place_id: id,
      // series: true
    }
    
    // l(params)
    
    this.http
    .get('/api/v1/photos', params, auth)
    .then(res => {      
      let photos = res.data.results
      , currPhoto = photos[0]
      currPhoto.labels.forEach(lbl => lbl.edit = false)
      currPhoto.key = Math.random()
      l(photos)
      this.child && this.child.destroyCanvas()
      this.setState({ photos, currPhoto })
      this.getCategories()
    })
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
      , catUrl
      , detUrl
      , req = { newBaseUrl: true }
      , fd = new FormData()
      req.file = fd
      
      // Instantiate copy of file, giving it new name (to avoid large image_url sending). Takes roughly same amount of time
      // let fileCopy = new File([file], file.name, { type: file.type })
      // fd.append('file', fileCopy)

      // l(file)
      if(file.fromUrl){
        fd.append('url', file.image_url)
        catUrl = 'http://18.202.217.216:5000/category_url'
        detUrl = 'http://18.202.217.216:5000/detect_url'
      }else{
        fd.append('file', file)
        catUrl = 'http://18.202.217.216:5000/category_buffer'
        detUrl = 'http://18.202.217.216:5000/detect_buffer'
      }

      return this.http
      .post(catUrl, req)
      .then(res => {
        // l("Category Result:", res) 
        if (res.data.category)
          file.category = { name: Object.keys(res.data.category[0])[0] }
        
        this.http
        .post(detUrl, req)
        .then(res => {
          // l("Labels Result:", res) 
          if (res.data.length) {
            // let response = JSON.parse(res.data)
            let response = res.data
            , labels = []
            // l(response)
            response.forEach(r => 
              labels.push({
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
            )
            
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
      currPhoto.labels.splice(currPhoto.labels.indexOf(label), 1)
      // currPhoto.labels = currPhoto.labels.filter(l => l.id !== label.id)
    }
    this.setState({ currPhoto }/* , () => l(this.state.currPhoto) */)
  }  

  // req.append('id', typeof im.id === "string" ? null : im.id)
  // im.labels.forEach(l => {        
  //   req.append('labels[]', l)
  // })
  // req.append('category', im.category)

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
      if (tmp.fromUrl) {
        req.append('url', tmp.image_url)
      }else{
        req.append('file', tmp)
      }
    }

    this.http
    .put('/api/v1/submit_photo', req)
    .then(res => {
      l(res)
      if (res.status === 200) {
        if(this.state.currPhotoIdx < this.state.photos.length - 1) {
          this.nextPhoto()
        } else {
          this.doApiCall(this.props)
        }
      }
    })
  }

  handleKey = event => {
    event.preventDefault()
    // l(event.keyCode, "Photo Block")
    let lbls = this.state.currPhoto.labels
    if(event.keyCode === 13){
      // Enter Key
      if (getActive(lbls)){
        this.child.makeImmutable()
      }else{
        // l("Submit")
        this.submit()
      }
    } else if (event.keyCode === 8){
      // Backspace
      let activeLbls = getActive(lbls)
      if (activeLbls) this.child.deleteLabel(activeLbls)
    }
  }

  render() {
    const photo = this.state.currPhoto
    , photos = this.state.photos
    , categories = this.state.categories
    , currPhotoIdx = this.state.currPhotoIdx
    , showingUploaded = this.state.showingUploaded

    return (
      <div className="block-content" tabIndex="0" onKeyUp={this.handleKey}>
        {photos.length > 0 && <>
          <div style={{ display: !this.state.showUpload?"block":"none" }}>
            <div className="title row">
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
                  {/* PlaceObj: <pre>{JSON.stringify(this.props.placeObj, null, 2)}</pre> */}
                  {/* Place: <pre>{JSON.stringify(this.state.currPlace, null, 2)}</pre> */}
                  {!this.props.placeObj.withPlace && 
                  Boolean(Object.keys(this.state.currPlace).length) && 
                  <div className="mb-4 title-city">
                    Current City: {this.state.currPlace.name}
                  </div>}
                  {!this.props.placeObj.withPlace &&
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