import React, { Component } from 'react'

import Main from './components/Main'
import HttpService from './services/HttpService'
import { l, auth } from './helpers/common'

import 'bootstrap/dist/css/bootstrap.min.css'
import './App.scss'

export default class App extends Component {
  constructor(){
    super()
    this.http = new HttpService()
    this.state = {
      username: "",
      password: "",
      isAuth: false,
      showErr: false,
      perm: []
    }
  }

  componentDidMount(){
    // this.setState({
    //   username: 'ml_page',
    //   password: '}XhE9p2/FQjx9.e'
    // }, this.signIn)
  }

  handleInputChange = event => {
    const target = event.target
    const value = target.type === 'checkbox' ? target.checked : target.value
    this.setState({
      [target.name]: value
    })
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
      res.data.permissions = ["photo_block", "place_block", "tag_block"] 
      // res.data.permissions = ["photo_block", "tag_block"] 
      // res.data.permissions = ["tag_block"] 

      let perm = res.data.permissions
      this.setState({ isAuth: true, perm })

      // Set auth user
      auth.username = this.state.username
      auth.password = this.state.password
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
    this.setState({ 
      isAuth: false,
      perm: [],
      username: "",
      password: ""
    })
  }
  
  render(){
    return (<>
      <nav className="navbar navbar-expand-lg navbar-light bg-white">
        <div className="container">
          <a className="navbar-brand" href="javascript:void(0)">
            <img src="assets/burger.png" alt=""/>
          </a>
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav mr-auto">
            </ul>
            {!this.state.isAuth &&
            <form className="form-inline" onSubmit={this.signIn}>
              <input name="username" value={this.state.username} onChange={this.handleInputChange} className="form-control mr-sm-2" type="text" placeholder="Login" />
              <input name="password" value={this.state.password} onChange={this.handleInputChange} className="form-control mr-sm-2" type="password" placeholder="Password" />
              <button className="btn btn-accent" type="submit">Sign In</button>
            </form>}
            {this.state.isAuth && 
            <form className="form-inline logged-in" onSubmit={this.logOut}>
              <img src="assets/user-icon.png" alt=""/><span className="mx-3">{this.state.username}</span>
              <button className="btn btn-accent-outline" type="submit">Logout</button>
            </form>}
          </div>
        </div>
      </nav>
      {this.state.showErr &&
      <div className="error w-100 py-2 text-center">
        <span>Ooops…</span>Invalid email or password!
      </div>}
      {this.state.isAuth && 
      <Main blocks={this.state.perm}/>}
    </>)
  }
}