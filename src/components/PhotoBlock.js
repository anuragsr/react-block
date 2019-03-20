import React, { Component } from 'react'

import AutoCompleteComponent from './AutoCompleteComponent'
import CanvasComponent from './CanvasComponent'
import HttpService from '../services/HttpService'
import { l, rand, withIndex, getFormattedTime } from '../helpers/common'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faTrash } from '@fortawesome/free-solid-svg-icons'
import { faEdit } from '@fortawesome/free-regular-svg-icons';

const checkId = rand(5)
const checkId_p = rand(5)

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
      showNotif: false, 
      notifType: "submit",
      categories: [],
      currCat: {},
      photos: [],
      currPhoto: {},
      ml: false,
      uncheckedOnly: false,
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
      let photos = res.data.results, currPhoto = photos[1]
      l(photos)
      this.setState({ photos, currPhoto })
      this.http
      .get('/api/v1/categories')
      .then(res => {
        let categories = res.data.results, currCat = categories[0]
        this.setState({ categories, currCat })
      })
    })
  }

  catChanged = e => {
    let currCat = this.state.categories.filter(cat => { return cat === e.target.value })[0]
    this.setState({ currCat })
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
    l("Add Photo")
  }

  editLabel = () => {
    l("editLabel")
  }

  deleteLabel = () => {
    l("deleteLabel")
  }
  
  mlChanged = e => this.setState({ ml: e.target.checked })
  
  checkChanged = e => this.setState({ uncheckedOnly: e.target.checked })

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
    , labels = this.state.currPhoto.labels
    l(labels)

    return (
      <div className="block-content">
        {photos.length > 0 &&
        <div className="row">
          <div className="col-lg-9">
            <div className="title">
              <span>{photo.name}</span>
              <span className="checkTime">
                <FontAwesomeIcon style={{ color: "green" }} icon={faCheck} />
                &nbsp;&nbsp;Checked: {getFormattedTime(photo.checkedTime)}
              </span>
            </div>
          </div>
          <div className="col-lg-3 text-right">
            <button onClick={this.addPhoto} className="btn btn-accent-outline">Add Photo</button>
          </div>
        </div>}
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
          <div className="row">
            <div className="b-section col-lg-1">
              <div className="obj-sel">
                <img src="assets/icon-random.png" alt=""/>
              </div>
              <div className="obj-sel">
                <img src="assets/icon-square.png" alt=""/>
              </div>
              <div className="obj-sel">
                <img src="assets/icon-circle.png" alt=""/>
              </div>
            </div>
            <div className="b-section col-lg-7">
              <CanvasComponent
                image={photo}
              />              
            </div>
            <div className="b-section col-lg-4 ctn-cat">
              <div>Photo category</div>
              {this.state.categories.length > 0 &&
              <select 
                className="custom form-control" 
                value={this.state.currCat.id} 
                onChange={this.catChanged}
              >
                {this.state.categories.map(function(cat, idx){
                  return (
                    <option key={idx} value={cat}>{cat}</option>
                  )
                })}
              </select>}
              <div className="ctn-lbl">
                {photos.length > 0 && labels.length && labels.map((lbl, idx) => {
                  return (
                    <div className="lbl-item" key={idx}>
                      <div>{idx + 1}</div>
                      <span>{lbl.label.name}</span>
                      <span onClick={this.editLabel}><FontAwesomeIcon style={{ color: "#a8c6df" }} icon={faEdit} /></span>
                      <span onClick={this.deleteLabel}><FontAwesomeIcon style={{ color: "#a8c6df" }} icon={faTrash} /></span>
                    </div>
                  )
                })}
              {/* Labels: <pre>{JSON.stringify(labels, null, 2)}</pre> */}
              </div>
            </div>
          </div>
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
    )
  }
}