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
      showNotif: false,
      notifType: "submit",
      categories: [],
      photos: [],
      currPhoto: {},
      currPhotoIdx: null,
      currPlace: {},
      ml: false,
      uncheckedOnly: false,
      showUpload: false,
      uploadedFiles: [],
      loadUrl: "",
    }
  }

  componentDidMount(){
    this.http
    .get('/api/v1/photos', {
      limit: 10
    }, auth)
    .then(res => {
      let photos = res.data.results
      , currPhoto = photos[0]
      currPhoto.labels.forEach(lbl => lbl.edit = false)

      l(photos)
      this.setState({ photos, currPhoto })

      this.http
      .get('/api/v1/categories')
      .then(res => {
        let categories = res.data.results//, currCat = categories[0]
        this.setState({ categories })
      })
    })
  }

  nextPhoto = () => {
    let idx = withIndex(this.state.photos).filter(x => x.value.id === this.state.currPhoto.id)[0].index;
    // l(idx)
    if(idx === this.state.photos.length - 1){
      idx = 0
    }else{
      idx++
    }
    this.setState({ currPhotoIdx: idx, currPhoto: this.state.photos[idx] })
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
      // currPhoto.labels.forEach(lbl => lbl.edit = false)
      this.setState({ currPhotoIdx: 0, photos, currPhoto })      
    }

    // Here we call ML and process the photos in the background
    // if(this.state.ml)
      this.processUploads()

    this.setState({ uploadedFiles: [], showUpload: false })
  }

  cancelUpload = () => this.setState({ uploadedFiles: [], showUpload: false })

  filesUploaded = files => {
    // l(files)
    this.setState( state => ({
      uploadedFiles: state.uploadedFiles.concat(...files)    
    }))
  }

  processUploads = () => {
    // axios.get(...)
    // .then((response) => {
    //   return axios.get(...); // using response.data
    // })
    // .then((response) => {
    //   console.log('Response', response);
    // });

    this.http
    .post('http://18.202.217.216:5000/detect', {
      files: {
        file: this.state.currPhoto
      },
      newBaseUrl: true
    })
    .then(res => {
      l(res)
    })
  }

  handleCatUpdate = cat => {
    let currPhoto = this.state.currPhoto
    currPhoto.category = { name: cat }
    this.setState({ currPhoto }, () => l(this.state.currPhoto))
  }

  handleImageUpdate = (label, type) => {
    let currPhoto = this.state.currPhoto
    if(type === "add"){
      currPhoto.labels.push(label)
    }
    this.setState({ currPhoto }, () => l(this.state.currPhoto))
  }

  submit = () => {
    const im = this.state.currPhoto
    , request = {
      id: im.id,
      // labels: im.labels.map(l => {
      //   delete l.edit
      //   l.type = [...l.form].join("")
      //   delete l.form
      //   return l
      // }),
      labels: im.labels,
      category: im.category
    }
    l(request)

    this.http
    .put('/api/v1/submit_photo', request, auth)
    // .put('/api/v1/submit_photo/' + im.id, request )
    .then(res => {
      l(res)
    })
  }

  render() {
    const photo = this.state.currPhoto
    , photos = this.state.photos
    , categories = this.state.categories
    , currPhotoIdx = this.state.currPhotoIdx

    return (
      <div className="block-content">        
        {
          photos.length > 0 && <>
          <div style={{display: !this.state.showUpload?"block":"none" }}>
            <div className="row px-4">
              <div className="col-lg-8">
                {currPhotoIdx !== null && <div className="counter">
                  {currPhotoIdx + 1} of {photos.length}
                </div>}
                <div className="title">
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
              <div className="row b-section">
                <div className="col-lg-6">
                  <img src="assets/up-icon.png" alt=""/>
                  <a className="up-link" href="javascript:void(0)" onClick={this.addPhoto}>Upload Photos</a>
                </div>
              </div>
              <div className="row b-section">
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
                image={photo}
                categories={categories}
                imageUpdated={this.handleImageUpdate}
                catUpdated={this.handleCatUpdate}
              />
              <div className="b-section">
                <div className="custom-control custom-checkbox">
                  <input checked={this.state.ml?"checked":""} onChange={this.mlChanged} type="checkbox" className="custom-control-input" id={checkId} />
                  <label className="custom-control-label" htmlFor={checkId}>Turn On ML</label>
                </div>
              </div>
            </div>
          </div>

          <div style={{display: this.state.showUpload?"block":"none" }}>
            <div className="title">Upload Photos</div>
            <div className="body">
              <div className="row">
                <FileInputComponent
                  handleFiles={this.filesUploaded}
                />
                <FilePreviewComponent 
                  images={this.state.uploadedFiles}
                />
              </div>
              <div className="b-section">
                <button onClick={this.doUpload} className="btn btn-accent">Upload</button>
                <button onClick={this.cancelUpload} className="ml-3 btn btn-accent-outline">Cancel</button>
              </div>
            </div>
          </div>
          </>
        }
      </div>
    )
  }
}