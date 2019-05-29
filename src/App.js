import React, { Component } from 'react'
import Cookies from 'universal-cookie'
import $ from 'jquery'
import Popper from 'popper.js'
import 'bootstrap/dist/js/bootstrap.bundle.min'

import Main from './components/Main'
import HttpService from './services/HttpService'
import { l, auth } from './helpers/common'

import 'bootstrap/dist/css/bootstrap.min.css'
import './App.scss'

const cookies = new Cookies()

export default class App extends Component {
  constructor(props){
    super(props)
    this.http = new HttpService()
    this.state = {
      username: "",
      password: "",
      showNav: true,
      isAuth: false,
      showErr: false,
      perm: []
    }
  }

  componentDidMount(){
    let ck = cookies.get("ml_app")
    if(typeof ck !== "undefined"){
      this.setState({
        showNav: false,
        username: ck.x_u,
        password: ck.x_p
      }, this.signIn)
    }
    // else{      
    //   this.setState({
    //     showNav: false,      
    //     username: 'ml_page',
    //     password: '}XhE9p2/FQjx9.e'
    //   }, this.signIn)
    // }
  }

  handleInputChange = event => {
    const target = event.target
    const value = target.type === 'checkbox' ? target.checked : target.value
    this.setState({
      [target.name]: value
    })
  }

  handleClick = event => {
    event && event.stopPropagation()    
    // l("App", event.target, this.child)
    // Call main->block->photoblock function
    if(this.child && this.child.childBlock[0]){      
      let pb = this.child.childBlock[0].photoBlock
      if(pb.state.adding === "" || pb.state.adding === "editing-shape"){
        pb.makeImmutable()
      }
    }
  }

  signIn = e => {
    e && e.preventDefault()
    // Login rest call
    this.http
    .post('/api/v1/login', {
      username: this.state.username,
      password: this.state.password,
      ml_page: true 
    })
    .then(res => {
      l(res)
      // res.data.permissions = ["photo_block", "place_block", "tag_block"] 
      // res.data.permissions = ["photo_block", "tag_block"] 
      // res.data.permissions = ["photo_block"] 
      // res.data.permissions = ["place_block"] 
      // res.data.permissions = ["tag_block"]

      this.setState({ 
        isAuth: true, 
        showNav: true,        
        perm: res.data.permissions 
      })

      // Set auth user
      auth.username = this.state.username
      auth.password = this.state.password
      
      let ck = cookies.get("ml_app")
      if(typeof ck === "undefined"){
        cookies.set("ml_app", {
          x_u: auth.username,
          x_p: auth.password
        }, { maxAge: 3600 })
      }
      // l(auth)
    })
    .catch(err => {
      l(err)
      this.setState({ showErr: true })
      setTimeout(() => {
        this.setState({ showErr: false })
      }, 3000)
    })
  }

  logOut = () => {
    cookies.remove("ml_app")
    this.setState({ 
      isAuth: false,
      perm: [],
      username: "",
      password: ""
    })
  }
  
  render(){
    return (
      <div className="app-outer" onMouseDown={e => this.handleClick(e)}>
        {this.state.showNav && <nav className="navbar navbar-expand-lg navbar-dark">
          <div className="container-fluid p-0">
            <a className="navbar-brand" href="javascript:void(0)">
              <img src="assets/burger.svg" alt=""/>
            </a>
            <div className="ml-auto">
            {!this.state.isAuth &&
              <form className="form-inline" onSubmit={this.signIn}>
                <input name="username" value={this.state.username} onChange={this.handleInputChange} className="form-control mr-sm-2" type="text" placeholder="Login" />
                <input name="password" value={this.state.password} onChange={this.handleInputChange} className="form-control mr-sm-2" type="password" placeholder="Password" />
                <button className="btn btn-accent" type="submit">Sign In</button>
              </form>}
            {this.state.isAuth &&
              <ul className="navbar-nav logged-in">
                <li className="nav-item">
                  <img src="assets/user-icon.png" alt="" />
                  <span className="mx-3">{this.state.username}</span>
                </li>
                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle" href="javascript:void(0)" data-toggle="dropdown">
                  </a>
                  <div className="dropdown-menu">
                    <a className="dropdown-item" onClick={this.logOut} href="javascript:void(0)">Logout</a>
                  </div>
                </li>
              </ul>}
            </div>
          </div>
        </nav>}
        {this.state.showErr &&
        <div className="error w-100 py-2 text-center">
          <span>Ooops…</span>Invalid email or password!
        </div>}
        {this.state.isAuth && 
        <Main 
          blocks={this.state.perm}
          ref={instance => { this.child = instance }}        
        />}
      </div>
    )
  }
}