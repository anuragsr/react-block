import React, { Component } from 'react'
import AutoCompleteComponent from './AutoCompleteComponent'
// import TagsComponent from './TagsComponent'
// import SliderComponent from './SliderComponent'
import HttpService from '../services/HttpService'
import { l, rand, withIndex, getFormattedTime } from '../helpers/common'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons'

const checkId = rand(5)
const checkId_p = rand(5)

export default class PlaceBlock extends Component {
  
  constructor(props) {
    super(props)
    this.http = new HttpService()
    this.state = {
      showNotif: false, 
      notifType: "submit",
      // showAnim: false,
      // showAttr: false,
      // showSugTags: false,
      // toggleSugTags: true,
      // allowAdd: true,
      // places: [],
      // currPhoto: {},
      photos: [],
      currPhoto: {},
      // tags: [],
      ml: false,
      uncheckedOnly: false,
      // suggTags: [],
      // att: {
      //   manual: 0,
      //   auto: 0
      // },
    }
  }

  componentDidMount(){
    this.http
    .get('/api/v1/photos')
    .then(res => {
      let photos = res.data.results, currPhoto = photos[0]
      l(photos)
      this.setState({ photos, currPhoto })
      this.getObjects()
      // this.http
      // .get('/api/v1/places', {        
      //   query: "",
      //   approved: true
      // })
      // .then(res => {
      //   let places = res.data.results
      //   this.setState({ places })
      //   this.placeChanged(places[0])
      // })
    })
  }

  getObjects = () => {
    if(this.state.ml){
      l("Getting objects")
    }else{      
      l("Drawing objects")
    }
  }

  nextPhoto = () => {}

  getSuggTags = (currPhoto) => {
    this.http
    .get('/api/v1/suggested_tags', {
      params: { place_id: currPhoto.id }
    })
    .then(res => {
      let suggTags = res.data.results
      l(suggTags)
      this.setState({ 
        showSugTags: true, 
        suggTags 
      })
      // if(this.state.randomMode){
      //   this.getRandomTags()
      // }
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
    // this.photoChanged(this.state.photos[idx])
  }

  placeSelected = currPlace => {
    l(currPlace)
    // this.getSuggTags(currPhoto)
  } 
  
  // placeInputChanged = (showAnim, showAttr) => this.setState({ showAnim, showAttr })
  
  addPhoto = () => {
    l("Add Photo")
  }
  
  mlChanged = e => this.setState({ ml: e.target.checked })    
  checkChanged = e => this.setState({ uncheckedOnly: e.target.checked })    

  // tagSuggested = tag => {
  //   // l(tag)
  //   if(this.state.allowAdd){
  //     let tags = [...this.state.tags, tag]
  //     , suggTags = this.state.suggTags.filter(curr => curr.id !== tag.id)
  //     , showAttr = !!tags.length
  //     , showTags = !!tags.length
  
  //     this.setState({ tags, suggTags, showAttr, showTags })
  //     this.tagsChanged()
  //   }
  // }
  
  // tagAdded = tag => {
  //   let tags = [...this.state.tags, tag]
  //   , showTags = !!tags.length

  //   this.setState({ tags, showTags })
  //   this.tagsChanged()
  // }

  // tagRemoved = tag => {
  //   let tags = this.state.tags.filter(curr => curr.id !== tag.id)
  //   , showAttr = !!tags.length

  //   this.setState({ showAttr, tags })
  //   this.tagsChanged()
  // }

  // tagsChanged = () => {
  //   if(this.state.tags.length && this.state.ml){
  //     l("Call ML with list of tags if ML on")
  //     this.http
  //     .post('/api/v1/get_attraction_for_place', { 
  //       tags_ids: this.state.tags.map(x => x.id),
  //       place_id: this.state.currPhoto.id
  //     })
  //     .then(res => {
  //       l(res.data)
  //       let attr = res.data.attraction?res.data.attraction:0
  //       this.setState( state => ({
  //         att: {
  //           ...state.att,
  //           manual: attr,
  //           auto: attr
  //         }
  //       }))
  //     })
  //     .catch(error => {
  //       // error callback
  //       l(error)
  //     }) 
  //   }
  // }
  
  // attChanged = val => {
  //   this.setState( state => ({
  //     att: {
  //       ...state.att,
  //       manual: val
  //     }
  //   }))
  // }

  undo = () => {
    let params = { type: 'tag', id: this.state.lastTagId }
    l(params)
    this.http
    .get('/api/v1/undo', params)
    .then(res => {
      l(res)
      this.setState({
        showNotif: true, 
        notifType: "undo"
      })
      setTimeout(() => {
        this.setState({
          allowAdd: true,
          showNotif: false,
          notifType: "submit"
        })
        // this.getSuggTags()
      }, 5000)
    })
  }

  onUndo = () => this.setState({ showNotif: false, notifType: "submit" })

  submit = () => {
    // l(this.state)
    if(this.state.tags.length){
      this.setState({
        showAttr: false,
        tagsText: this.state.tags.map((t, i) => {
          if(i === this.state.tags.length - 1)
            return t.photo_name
          else
            return t.photo_name + ", "
        }),
        tags: [],
        // showTags: false,
        allowAdd: false,
      })

      const request = {
        tags_ids: this.state.tags.map(x => x.id),
        ML_attraction: this.state.ml?this.state.att.auto:"None",
        editor_attraction: this.state.att.manual, 
        editor_id: 1,
        bot_id: this.state.currBot.id,
        place_id: this.state.currPhoto.id
      }
      l(request)
  
      this.http
      .post('/api/v1/send_attraction_for_place', request)
      .then(res => {
        l(res.data)
        //  Show notif, undo
        this.getSuggTags(this.state.currPhoto)
        this.setState({ 
          showNotif: true, 
          lastTagId: res.data.id 
        })
        setTimeout(() => {
          this.setState({ 
            showAttr: false,
            att: {
              manual: 0,
              auto: 0
            }
          })
          
          if(this.state.notifType === "submit"){
            this.setState({ 
              allowAdd: true,
              showNotif: false 
            })
          }
        }, 5000)
      })    
    }
  }

  render() {
    return (
      <div className="block-content">
        {
          this.state.photos.length > 0 &&
          <div className="row">
            <div className="col-lg-7">
              <div className="title">
                <span>{this.state.currPhoto.photo_name}</span>
                <span className="checkTime">
                  <FontAwesomeIcon style={{ color: "green" }} icon={faCheck} />
                  &nbsp;&nbsp;Checked: {getFormattedTime(this.state.currPhoto.checkedTime)}
                </span>
              </div>
            </div>
            <div className="col-lg-5 text-right">
              <button onClick={this.addPhoto} className="btn btn-accent-outline">Add Photo</button>
              {/* <div className="search">
                <AutoCompleteComponent
                  inputProps={{
                    className: 'pl-inp form-control',
                    placeholder: 'FIND THE PLACE'
                  }}
                  type="place"
                  // changeInput={this.placeInputChanged}
                  optionSelected={this.placeChanged}
                />
              </div> */}
            </div>
          </div>
        }
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
            <div className="b-section col-lg-6">
              Photo
            </div>
            <div className="b-section col-lg-6">
              Photo Objects
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