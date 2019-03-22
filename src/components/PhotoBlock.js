import React, { Component } from 'react'

import AutoCompleteComponent from './AutoCompleteComponent'
import CanvasComponent from './CanvasComponent'
import FileInputComponent from './FileInputComponent'
import HttpService from '../services/HttpService'
import { l, rand, withIndex, getFormattedTime } from '../helpers/common'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import PreviewComponent from './FilePreviewComponent';

const checkId = rand(5)
const checkId_p = rand(5)
let loadUrl  = ""

export default class PhotoBlock extends Component {
  
  constructor(props) {
    super(props)
    this.http = new HttpService()
    this.state = {
      // showAnim: false,
      // showAttr: false,
      // showSugTags: false,
      // toggleSugTags: true,
      // allowAdd: true,
      // places: [],
      // tags: [],
      // suggTags: [],
      // att: {
      //   manual: 0,
      //   auto: 0
      // },
      // currCat: {},
      showNotif: false,
      notifType: "submit",
      categories: [],
      photos: [],
      currPhoto: {},
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
    },{
      username: 'ml_page',
      password: '}XhE9p2/FQjx9.e'
    })
    .then(res => {
      let photos = res.data.results
      , currPhoto = photos[1]
      // currPhoto.labels.push(JSON.parse(JSON.stringify(currPhoto.labels[0])))
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
    l(idx)
    if(idx === this.state.photos.length - 1){
      idx = 0
    }else{
      idx++
    }
    this.setState({ currPhoto: this.state.photos[idx] })
  }

  placeSelected = currPlace => {
    l(currPlace)
    // this.getSuggTags(currPhoto)
  } 
    
  addPhoto = () => {
    // l("Add Photo")
    this.setState({ showUpload: true })
  }
  
  mlChanged = e => this.setState({ ml: e.target.checked })
  
  checkChanged = e => this.setState({ uncheckedOnly: e.target.checked })

  doUpload = () => {
    l("Do upload")
  }

  cancelUpload = () => {
    // l(this.state.currPhoto)
    this.setState({ showUpload: false })
    // this.forceUpdate()
  }

  loadUrlChanged = e => {
    loadUrl = e.target.value
    // this.setState({ loadUrl: e.target.value })
  }

  doLoadUrl = () => {
    l(this.state.loadUrl)
    let uploadedFiles = this.state.uploadedFiles
    uploadedFiles.push({ url: loadUrl, type: "url" })
    this.setState({ uploadedFiles, loadUrl: "" })
  }

  filesUploaded = files => {
    l(files)
    this.setState( state => ({
      uploadedFiles: state.uploadedFiles.concat(...files)    
    }))
  }

  undo = () => {
    // let params = { type: 'photo', id: this.state.lastTagId }
    // l(params)
    // this.http
    // .get('/api/v1/undo', params)
    // .then(res => {
    //   l(res)
    //   this.setState({
    //     showNotif: true, 
    //     notifType: "undo"
    //   })
    //   setTimeout(() => {
    //     this.setState({
    //       allowAdd: true,
    //       showNotif: false,
    //       notifType: "submit"
    //     })
    //     // this.getSuggTags()
    //   }, 5000)
    // })
  }

  onUndo = () => this.setState({ showNotif: false, notifType: "submit" })

  submit = () => {
    // l(this.state)
    // if(this.state.tags.length){
    //   this.setState({
    //     showAttr: false,
    //     tagsText: this.state.tags.map((t, i) => {
    //       if(i === this.state.tags.length - 1)
    //         return t.photo_name
    //       else
    //         return t.photo_name + ", "
    //     }),
    //     tags: [],
    //     // showTags: false,
    //     allowAdd: false,
    //   })

    //   const request = {
    //     tags_ids: this.state.tags.map(x => x.id),
    //     ML_attraction: this.state.ml?this.state.att.auto:"None",
    //     editor_attraction: this.state.att.manual, 
    //     editor_id: 1,
    //     bot_id: this.state.currBot.id,
    //     place_id: this.state.currPhoto.id
    //   }
    //   l(request)
  
    //   this.http
    //   .post('/api/v1/send_attraction_for_place', request)
    //   .then(res => {
    //     l(res.data)
    //     //  Show notif, undo
    //     this.getSuggTags(this.state.currPhoto)
    //     this.setState({ 
    //       showNotif: true, 
    //       lastTagId: res.data.id 
    //     })
    //     setTimeout(() => {
    //       this.setState({ 
    //         showAttr: false,
    //         att: {
    //           manual: 0,
    //           auto: 0
    //         }
    //       })
          
    //       if(this.state.notifType === "submit"){
    //         this.setState({ 
    //           allowAdd: true,
    //           showNotif: false 
    //         })
    //       }
    //     }, 5000)
    //   })    
    // }
  }

  render() {
    const photo = this.state.currPhoto
    , photos = this.state.photos
    , categories = this.state.categories

    return (
      <div className="block-content">        
        {
          photos.length > 0 && <>
          <div style={{display: !this.state.showUpload?"block":"none" }}>
            <div className="row">
              <div className="col-lg-9">
                <div className="title">
                  <span>{photo.name}</span>
                  {photo.ml_check_date !== null &&
                  <span className="checkTime">
                    <FontAwesomeIcon style={{ color: "green" }} icon={faCheck} />
                    &nbsp;&nbsp;Checked: {getFormattedTime(photo.ml_check_date)}
                  </span>}
                </div>
              </div>
              <div className="col-lg-3 text-right">
                <button onClick={this.addPhoto} className="btn btn-accent-outline">Add Photo</button>
              </div>
            </div>
            {/* <div className={this.state.showNotif?"shown notif":"notif"}>
              {
                this.state.notifType === "submit" &&
                <div>
                  <div className="n-title">New tag block created!</div>
                  <div onClick={this.undo} className="undo float-right">Undo</div>
                  <div className="n-body">
                    Tags: {this.state.tagsText}
                    <br/>
                    Attraction: {this.state.att.manual}
                  </div>
                </div>
              }{
                this.state.notifType === "undo" &&
                <div>
                  <div className="n-title">Tag block deleted successfully!</div>
                  <div onClick={this.onUndo} className="undo float-left">Ok</div>    
                </div>
              }
            </div> */}
            <div className="body">
              <div className="b-section">
                <div className="custom-control custom-checkbox">
                  <input checked={this.state.uncheckedOnly?"checked":""} onChange={this.checkChanged} type="checkbox" className="custom-control-input" id={checkId_p} />
                  <label className="custom-control-label" htmlFor={checkId_p}>Show only unchecked photo</label>
                </div>
              </div>
              <div className="row">
                <div className="col-lg-6">
                  <AutoCompleteComponent 
                    inputProps={{
                      className: 'tag-inp form-control',
                      placeholder: 'Choose the city',
                    }}
                    type="place"
                    // parent="place"
                    // placeId={this.state.currPlace.id}
                    // changeInput={this.placeInputChanged}
                    optionSelected={this.placeSelected}
                  />
                </div>
              </div>
              <CanvasComponent
                image={photo}
                categories={categories}
              />
              <div className="b-section">
                <div className="custom-control custom-checkbox">
                  <input checked={this.state.ml?"checked":""} onChange={this.mlChanged} type="checkbox" className="custom-control-input" id={checkId} />
                  <label className="custom-control-label" htmlFor={checkId}>Turn On ML</label>
                </div>
              </div>
              <div className="b-section">
                <button onClick={this.submit} className="btn btn-accent">Submit</button>
                <button onClick={this.nextPhoto} className="ml-3 btn btn-accent-outline">Next Photo</button>
              </div>
            </div>
          </div>

          <div style={{display: this.state.showUpload?"block":"none" }}>
            <div className="title">Upload Photos</div>
            <div className="body">
              <div className="row">
                <div className="col-lg-6 b-section">                
                  <FileInputComponent
                    handleFiles={this.filesUploaded}
                  />
                  <div className="url-inp">
                    or enter remote photo URL<br/>
                    <input onChange={this.loadUrlChanged} type="text" className="form-control tag-inp" placeholder="Place URL here .."/>
                    <img onClick={this.doLoadUrl} src="assets/btn-remote.png" alt=""/>
                  </div>
                </div>
                <div className="col-lg-12 up-files">
                  <PreviewComponent 
                    images={this.state.uploadedFiles}
                  />
                </div>
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