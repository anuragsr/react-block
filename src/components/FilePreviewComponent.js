import React, { Component } from 'react'
import { l } from '../helpers/common'

export default class FilePreviewComponent extends Component {
  constructor(props) {
    super(props)
    this.state = {
      arr: []
    }
  }

  componentWillReceiveProps(nextProps){
    // l("nextProps")
    let arr = [], count = 0
    nextProps.images.forEach(file => {
      //Only pics
      if(file.type.match('image')){
        let r = new FileReader()
        r.onload = event => {
          // l(file.name + " Loaded")
          // l(event.target.result)
          count++
          arr.push(event.target.result)
          // l(count === nextProps.images.length)
          if(count === nextProps.images.length)
            this.setState({ arr })
        }
        //Read the image
        r.readAsDataURL(file)
      }else if(file.type === 'url'){
        count++
        arr.push(file.url)
        if(count === nextProps.images.length)
          this.setState({ arr })
      }
    })
  }

  render(){
    return (
      <div>
        {this.state.arr.length?<>
          <div className="mb-2">Attachments:</div>
          {this.state.arr.map((url, i) => {
            return <img key={i} src={url} height="100" alt=""/>          
          })}
        </>:"No files uploaded"}
      </div>
    )
  }
}