import React, { Component } from 'react'
import TagInput from './TagInput'
import SliderInput from './SliderInput'
import HttpService from '../services/HttpService'
import { l, rand } from '../helpers/common'
const checkId = rand(5)

export default class PlaceBlock extends Component {
  
  constructor(props) {
    super(props)
    this.http = new HttpService()
    this.state = {
      showNotif: false, 
      showAnim: false,
      showAttr: false,
      places: [],
      currPlace: {},
      bots: [],
      currBot: {},
      tags: [],
      suggestedTags: [],
      ml: false,
      att: {
        manual: 0,
        auto: 0
      },
    }
    this.placeChanged = this.placeChanged.bind(this)
    this.placeInputChanged = this.placeInputChanged.bind(this)
    this.inputChanged = this.inputChanged.bind(this)
    this.botChanged = this.botChanged.bind(this)
    this.mlChanged = this.mlChanged.bind(this)
    this.attChanged = this.attChanged.bind(this)
    this.tagsChanged = this.tagsChanged.bind(this)
    this.addToTags = this.addToTags.bind(this)
    this.submit = this.submit.bind(this)
    this.undo = this.undo.bind(this)
  }

  componentDidMount(){
    this.http
    .get('/api/v1/bots')
    .then(res => {
      let bots = res.data.results, currBot = bots[0]
      this.setState({ bots, currBot })
    })

    this.http
    .get('/api/v1/places')
    .then(res => {
      let places = res.data.results
      this.setState({ places })
      this.placeChanged(places[0])
    })
  }

  placeChanged(currPlace){
    this.setState({ currPlace })
    this.http
    .get('/api/v1/suggested_tags', { 
      params: { place_id: currPlace.id }
    })
    .then(res => {
      let suggestedTags = res.data.results
      l(suggestedTags)
      this.setState({ suggestedTags })
    })
  }
  
  inputChanged(showAnim, showAttr){
    this.setState({ showAnim, showAttr })
  }  
  
  placeInputChanged(e){
    this.setState({ placeInput: e.target.value })
  }
  
  botChanged(e){
    let currBot = this.state.bots.filter(bot => { return bot.id === parseInt(e.target.value) })[0]
    this.setState({ currBot })
  }
  
  mlChanged(e){
    let ml = e.target.checked
    this.setState({ ml })
  } 
  
  addToTags(item){
    l(item)
  }

  tagsChanged(tags){
    if(tags.length && this.state.ml){
      // l(tags)
      l("Call ML with list of tags if ML on")
      this.http
      .post('/api/v1/get_attraction_for_tags', { tags_ids: tags.map(x => x.id) })
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
    }
    this.setState({ tags })
  }
  
  attChanged(val){
    this.setState( state => ({
      att: {
        ...state.att,
        manual: val
      }
    }))
  }

  undo(){
    this.http
    .get('/api/v1/undo', { 
      params: { type: 'tag', id: 1 }
    })
    .then(res => {
      alert("Undo status:" + res.status)
    })
  }

  submit(){
    // l(this.state)
    if(this.state.tags.length){
      const request = {
        tags_ids: this.state.tags.map(x => x.id),
        ML_attraction: this.state.ml?this.state.att.auto:"None",
        editor_attraction: this.state.att.manual, 
        editor_id: 1,
        bot_id: this.state.currBot.id,
      }
      l(request)

      this.http
      .post('/api/v1/send_attraction_for_tags', request)
      .then(res => {
        l(res.data)
        //  Show notif, undo
        this.setState({ showNotif: true })
        setTimeout(() => {
          this.setState({ showNotif: false, tags: [], showAttr: false })
        }, 5000)
      })    
    }
  }

  render() {
    return (
      <div className="block-content">
        {
          this.state.places.length > 0 &&
          <div className="row">
            <div className="col-lg-8">
              <div className="title">
                {this.state.currPlace.title}
                <div className="sub-title">{this.state.currPlace.subtitle}</div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="search">
                <input 
                  type="text" 
                  className="pl-inp form-control mr-2"
                  value={this.state.placeInput} 
                  onChange={this.placeInputChanged} 
                  placeholder="FIND THE PLACE"
                  />
                <button type="submit" className="btn btn-primary">Submit</button>
              </div>
            </div>
          </div>
        }
        <div className={this.state.showNotif?"shown notif":"notif"}>
          <div className="n-title">New tag block created!</div>
          <div onClick={this.undo} className="undo float-right">Undo</div>
          <div className="n-body">
            Tags: {this.state.tags.length?
              this.state.tags.map((t, i) => {
                if(i === this.state.tags.length - 1)
                  return "#" + t.name
                else
                  return "#" + t.name + ", "
              }
              ):"None"}
            <br/>
            Attraction: {this.state.att.manual}
          </div>
        </div>
        {
          this.state.bots.length > 0 &&
          <div className="body row">
            <div className="col-lg-7">
              <div className="b-section">
                <img src={this.state.currBot.avatar} alt="bot" height="50" />
                <select 
                  className="custom" 
                  value={this.state.currBot.id} 
                  onChange={this.botChanged}
                >
                  {this.state.bots.map(function(bot, idx){
                    return (
                      <option key={bot.id} value={bot.id}>{bot.name}</option>
                    )
                  })}
                </select>
              </div>
              <div className="b-section">
                <TagInput tags={this.state.tags} changeInput={this.inputChanged} changeTags={this.tagsChanged}/>
              </div>
              { 
                this.state.suggestedTags.length > 0 &&
                <div className="b-section">
                  <div className="sl-title">
                    <div>Suggested Tags</div>  
                  </div>
                  <ul className="tag-ctn sug">
                    {this.state.suggestedTags.map((item, i) => 
                      <li key={i} onClick={() => this.addToTags(item)}>
                        <img src={item.image} alt="" /> {item.name} 
                      </li>
                    )}          
                  </ul>
                </div>
              }  
                {/* ShowAnim: <pre>{JSON.stringify(this.state.showAnim, null, 2)}</pre> */}
                {/* ShowAttr: <pre>{JSON.stringify(this.state.showAttr, null, 2)}</pre> */}
              <div className="b-section">
                {
                  this.state.showAnim &&
                  <div className="ctn-anim">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                  </div>
                }{
                  this.state.showAttr &&
                  <SliderInput att={this.state.att} changeAtt={this.attChanged}/>
                }
              </div>
              <div className="b-section">
                <div className="custom-control custom-checkbox">
                  <input checked={this.state.ml?"checked":""} onChange={this.mlChanged} type="checkbox" className="custom-control-input" id={checkId} />
                  <label className="custom-control-label" htmlFor={checkId}>Turn On ML</label>
                </div>
              </div>
              <div className="b-section">
                <button onClick={this.submit} className="btn btn-accent">Submit</button>
              </div>
            </div>
          </div>    
        }
      </div>      
    )
  }
}