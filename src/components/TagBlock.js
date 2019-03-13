import React, { Component } from 'react'
// import TagInputOld from './TagInputOld'
import TagInput from './TagInput'
import SliderInput from './SliderInput'
import HttpService from '../services/HttpService'
import { l, rand } from '../helpers/common'
const checkId = rand(5)

export default class TagBlock extends Component {
  
  constructor(props) {
    super(props)
    this.http = new HttpService()
    this.state = {
      showNotif: false,
      notifType: "submit",
      showAnim: false,
      showAttr: false,
      showTags: true,
      bots: [],
      currBot: {},
      tags: [],
      ml: false,
      att: {
        manual: 0,
        auto: 0
      },
      lastTagId: 0,
    }
    this.inputChanged = this.inputChanged.bind(this)
    this.botChanged = this.botChanged.bind(this)
    this.mlChanged = this.mlChanged.bind(this)
    this.attChanged = this.attChanged.bind(this)
    this.tagsChanged = this.tagsChanged.bind(this)
    this.submit = this.submit.bind(this)
    this.undo = this.undo.bind(this)
    this.onUndo = this.onUndo.bind(this)
  }

  componentDidMount(){
    this.http
    .get('/api/v1/bots')
    .then(res => {
      let bots = res.data.results, currBot = bots[0]
      this.setState({ bots, currBot })
    })
    .catch(error => {
      // error callback
      l(error)
    })
  }
  
  inputChanged(showAnim, showAttr){
    this.setState({ showAnim, showAttr })
  }
  
  botChanged(e){
    let currBot = this.state.bots.filter(bot => { return bot.id === parseInt(e.target.value) })[0]
    this.setState({ currBot })
  }
  
  mlChanged(e){    
    let ml = e.target.checked
    this.setState({ ml })
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
      .catch(error => {
        // error callback
        l(error)
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
          showNotif: false,
          notifType: "submit"
        })
      }, 5000)
    })
  }

  onUndo(){
    this.setState({ showNotif: false, notifType: "submit" })
  }

  submit(){
    // l(this.state)
    if(this.state.tags.length){
      this.setState({ 
        showAttr: false, 
        showTags: false
      })
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
        this.setState({ showNotif: true, lastTagId: res.data.id })
        setTimeout(() => {
          this.setState({ 
            tags: [], 
            showAttr: false,         
            showTags: true,
            att: {
              manual: 0,
              auto: 0
            }
          })
          if(this.state.notifType === "submit"){
            this.setState({ showNotif: false })
          }
        }, 5000)
      })    
    }
  }

  render() {
    return (
      <div className="block-content">
        <div className="title">
          Create new tag block            
        </div>
        <div className={this.state.showNotif?"shown notif":"notif"}>
          {
            this.state.notifType === "submit" &&
            <div>
              <div className="n-title">New tag block created!</div>
              <div onClick={this.undo} className="undo float-right">Undo</div>
              <div className="n-body">
                Tags: {this.state.tags.length?
                  this.state.tags.map((t, i) => {
                    if(i === this.state.tags.length - 1)
                      return t.full_name
                    else
                      return t.full_name + ", "
                  }
                  ):"None"}
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
        </div>
        <div className="body row">
          <div className="col-lg-7">            
            {this.state.bots.length > 0 &&
            <div className="b-section">
              <div
                className="bot-img"
                style={{ backgroundImage: `url(${this.state.currBot.avatar})` }}
              >
              </div>
              {/* <img src={this.state.currBot.avatar} alt="bot" height="50" /> */}
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
            </div>}
            {/* <div className="b-section">
              <TagInputOld tags={this.state.tags} changeInput={this.inputChanged} changeTags={this.tagsChanged}/>
            </div> */}
            
            <div className="b-section">
              <TagInput tags={this.state.tags} showTags={this.state.showTags} changeInput={this.inputChanged} changeTags={this.tagsChanged}/>
            </div>
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
      </div>
    )
  }
}