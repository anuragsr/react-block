import React, { Component } from 'react'
import AutoCompleteComponent from './AutoCompleteComponent'
import TagsComponent from './TagsComponent'
import SliderComponent from './SliderComponent'
import HttpService from '../services/HttpService'
import { l, auth, rand, withIndex } from '../helpers/common'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretRight } from '@fortawesome/free-solid-svg-icons'

const checkId = rand(5)
const checkId_r = rand(5)
let suggestions = []

export default class PlaceBlock extends Component {
  
  constructor(props) {
    super(props)
    this.http = new HttpService()
    this.state = {
      showNotif: false, 
      notifType: "submit",
      showAnim: false,
      showAttr: false,
      showSugTags: false,
      toggleSugTags: true,
      allowAdd: true,
      places: [],
      currPlace: {},
      bots: [],
      currBot: {},
      tags: [],
      suggTags: [],
      ml: false,
      att: {
        manual: 0,
        auto: 0
      },
      randomMode: false,
    }
  }

  componentDidMount(){
    this.http
    .get('/api/v1/bots', { from_ml_page: true })
    .then(res => {
      let bots = res.data.results, currBot = bots[0]
      this.setState({ bots, currBot })
      this.http
      .get('/api/v1/places', {
        query: "",
        approved: true
      }, auth)
      .then(res => {
        let places = res.data.results
        l(places)
        this.setState({ places })
        this.placeChanged(places[0])
      })
    })
  }

  toggleRandom = e => {
    let randomMode = e.target.checked
    if (randomMode) {
      this.getRandomTags()
    }
    this.setState({ randomMode })
  }

  getRandomTags = () => {
    this.http
    .get('/api/v1/random_tags', {
      place_id: this.state.currPlace.id
    })
    .then(res => {
      let tags = res.data.results
      this.setState({
        tags,
        showTags: true,
        showAttr: true,
      })
    })
    .catch(error => {
      // error callback
      l(error)
    })
  }

  getSuggTags = (currPlace) => {
    let params = { place_id: currPlace.id }
    this.http
    .get('/api/v1/suggested_tags', params)
    .then(res => {
      let suggTags = res.data.results
      l(suggTags)
      this.setState({ 
        allowAdd: true,
        showSugTags: true, 
        suggTags 
      })
      if(this.state.randomMode){
        this.getRandomTags()
      }
    })
  }

  nextPlace = () => {
    let found = withIndex(this.state.places).filter(x => x.value.id === this.state.currPlace.id), idx = 0
    if(found.length){
      idx = found[0].index
      if(idx === this.state.places.length - 1){
        idx = 0
      }else{
        idx++
      }
    }
    this.placeChanged(this.state.places[idx])
  }

  placeChanged = currPlace => {
    this.setState({ currPlace, tags:[], showAttr: false })
    this.props.placeChanged({ currPlace })
    this.getSuggTags(currPlace)
  } 
  
  placeInputChanged = (showAnim, showAttr) => this.setState({ showAnim, showAttr })

  botChanged = e => {
    let currBot = this.state.bots.filter(bot => { return bot.id === parseInt(e.target.value) })[0]
    this.setState({ currBot })
  }
  
  mlChanged = e => this.setState({ ml: e.target.checked })    

  tagSuggested = tag => {
    // l(tag)
    if(this.state.allowAdd){
      let tags = [...this.state.tags, tag]
      , suggTags = this.state.suggTags.filter(curr => curr.id !== tag.id)
      , showAttr = !!tags.length
      , showTags = !!tags.length
  
      this.setState({ tags, suggTags, showAttr, showTags }, this.tagsChanged)
    }
  }
  
  tagAdded = tag => {
    let tags = [...this.state.tags, tag]
    , showTags = !!tags.length

    this.setState({ tags, showTags }, this.tagsChanged)
    setTimeout(() => {
      suggestions.length = 0
    }, 200)
    // this.tagsChanged()
  }

  tagRemoved = tag => {
    let tags = this.state.tags.filter(curr => curr.id !== tag.id), showAttr
    if(tags.length === 0){
      showAttr = false
    }else{
      showAttr = true
    }

    this.setState({ showAttr, tags }, this.tagsChanged)
  }

  tagsChanged = () => {
    if(this.state.tags.length && this.state.ml){
      l("Call ML with list of tags and place if ML on")
      this.http
      .post('/api/v1/get_attraction_for_place', { 
        tags_ids: this.state.tags.map(x => x.id),
        place_id: this.state.currPlace.id
      })
      .then(res => {
        l(res.data)
        let attr = res.data.attraction?res.data.attraction:0
        this.setState( state => ({
          att: {
            ...state.att,
            manual: attr,
            auto: attr
          }
        }))
      })
      .catch(error => {
        // error callback
        l(error)
      }) 
    }
  }
  
  attChanged = val => {
    this.setState( state => ({
      att: {
        ...state.att,
        manual: val
      }
    }))
  }

  undo = () => {
    let params = { type: 'place', id: this.state.lastPlaceId }
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
        att: {
          manual: 0,
          auto: 0
        },
        tagsText: this.state.tags.map((t, i) => {
          if(i === this.state.tags.length - 1)
            return t.full_name
          else
            return t.full_name + ", "
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
        place_id: this.state.currPlace.id
      }
      l(request)
  
      this.http
      .post('/api/v1/send_attraction_for_place', request, auth)
      .then(res => {
        l(res.data)
        //  Show notif, undo
        this.getSuggTags(this.state.currPlace)
        this.setState({ 
          showNotif: true, 
          lastPlaceId: res.data.id 
        })
        setTimeout(() => {
          !this.state.tags.length &&
          this.setState({
            showAttr: false,
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

  handleSuggestions =  s => suggestions = s

  handleKey = event => {
    event.preventDefault()
    l(event.keyCode, "Place Block")
    if (event.keyCode === 13) {
      // Enter Key
      l(suggestions)
      if (!suggestions.length) {
        this.submit()
      }
    }
  }

  render() {
    return (<>
      {this.state.showNotif && <div className="block-notif">
        {this.state.notifType === "submit" && <>
          <div className="col-lg-11 px-0">
            <div className="title">
              <span>New tag block created!&nbsp;&nbsp;</span>
              <span className="tag-text">Tags: {this.state.tagsText}</span>
            </div>
          </div>
          <div className="col-lg-1 pr-0">
            <div onClick={this.undo} className="undo float-right">Undo</div>
          </div>
        </>}
        {this.state.notifType === "undo" && 
        <div className="col-lg-12 px-0 text-center">
          <div className="title">
            <span>Tag block deleted successfully!&nbsp;&nbsp;</span>
            <span onClick={this.onUndo} className="undo">Ok</span>
          </div>
        </div>}
      </div>}
      <div className="block-content" tabIndex="0" onKeyUp={this.handleKey}>
        {this.state.places.length > 0 &&
          <div className="title row place">
          <div className="col-lg-5">
            <a href={"https://admin-staging.oyster.ai/places/edit/" + this.state.currPlace.id} 
              rel="noopener noreferrer" 
              target="_blank"
            >
              {this.state.currPlace.name}
            </a> 
            <div className="sub-title">{this.state.currPlace.vicinity}</div>
          </div>
          <div className="col-lg-7">
            <div className="search">
              <AutoCompleteComponent
                inputProps={{
                  className: 'pl-inp form-control sec',
                  placeholder: 'Find the place ..'
                }}
                type="place"
                // changeInput={this.placeInputChanged}
                optionSelected={this.placeChanged}
              />
              <button onClick={this.nextPlace} className="ml-3 btn btn-accent-outline">
                Next&nbsp;&nbsp;<FontAwesomeIcon icon={faCaretRight} />
              </button>
              <button onClick={this.submit} disabled={!this.state.tags.length} className="ml-3 btn btn-accent">Submit</button>
            </div>
          </div>
        </div>}
        <div className="body">
          <div className="row align-items-center">
            <div className="col-lg-7">
              {this.state.bots.length > 0 && <>
                <div
                  className="bot-img"
                  style={{ backgroundImage: `url(${this.state.currBot.avatar})` }}
                >
                </div>
                <select
                  className="custom"
                  value={this.state.currBot.id}
                  onChange={this.botChanged}
                >
                  {this.state.bots.map(function (bot, idx) {
                    return (
                      <option key={bot.id} value={bot.id}>{bot.name}</option>
                    )
                  })}
                </select>
              </>}
            </div>
            <div className="col-lg-5 text-right">
              <div className="custom-control custom-checkbox">
                <input checked={this.state.randomMode ? "checked" : ""} onChange={this.toggleRandom} type="checkbox" className="custom-control-input" id={checkId_r} />
                <label className="custom-control-label" htmlFor={checkId_r}>Random Mode</label>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-6">
              <AutoCompleteComponent
                inputProps={{
                  className: 'tag-inp form-control',
                  placeholder: 'Add tag ..'
                }}
                type="tag"
                parent="place"
                placeId={this.state.currPlace.id}
                changeInput={this.placeInputChanged}
                getCurrSugg={this.handleSuggestions}
                optionSelected={this.tagAdded}
              />
            </div>
          </div>
          <div className="row">
            <div className="col-lg-12">
              <div className="tag-outer">
                {(this.state.tags.length === 0) &&
                  <div className="no-tags-plh">
                    <div className="inner">
                      <img src="assets/start-add.svg" alt="" />
                      <span>Start adding tags</span>
                    </div>
                  </div>
                }
                {this.state.showTags &&
                  <TagsComponent
                    type="default"
                    tags={this.state.tags}
                    removeTag={this.tagRemoved}
                  />}
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-6">
              {/* ShowAnim: <pre>{JSON.stringify(this.state.showAnim, null, 2)}</pre> */}
              {/* ShowAttr: <pre>{JSON.stringify(this.state.showAttr, null, 2)}</pre> */}
              {this.state.showAnim &&
                <div className="ctn-anim">
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
                </div>}
              {/* {<div style={{ display: this.state.showAttr ? "block" : "none" }}>
                <SliderComponent att={this.state.att} changeAtt={this.attChanged} />
              </div>} */}
              <SliderComponent att={this.state.att} changeAtt={this.attChanged} />
            </div>
          </div>
          <div className="row">
            <div className="col-lg-6">
              <div className="custom-control custom-checkbox">
                <input checked={this.state.ml ? "checked" : ""} onChange={this.mlChanged} type="checkbox" className="custom-control-input" id={checkId} />
                <label className="custom-control-label" htmlFor={checkId}>Turn On ML</label>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-12">
              {this.state.showSugTags && <>
                <div className="tags-title">
                  Suggested Tags&nbsp;&nbsp;
                  <img src="assets/plus.svg" alt=""
                    style={{
                      display: !this.state.toggleSugTags ? "inline-block" : "none",
                      cursor: "pointer",
                      position: "relative",
                      top: 0, left: 3
                    }}
                    onClick={() => this.setState({
                      toggleSugTags: !this.state.toggleSugTags
                    })}
                  />
                  <img src="assets/minus.svg" alt=""
                    style={{
                      display: this.state.toggleSugTags ? "inline-block" : "none",
                      cursor: "pointer",
                      position: "relative",
                      top: -3, left: 3
                    }}
                    onClick={() => this.setState({
                      toggleSugTags: !this.state.toggleSugTags
                    })}
                  />                  
                </div>
                {this.state.toggleSugTags &&
                  <TagsComponent
                    type="suggested"
                    tags={this.state.suggTags}
                    clickedTag={this.tagSuggested}
                  />}
              </>}
            </div>
          </div>
        </div>
      </div>
    </>
    )
  }
}