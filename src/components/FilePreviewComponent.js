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
    let arr = nextProps.images
    this.setState({ arr })
  }

  render(){
    return (
      <div className="row">
        <div className="col-lg-12 up-files">
          {this.state.arr.length?<>
            <div className="mb-2">Attachments:</div>
            {this.state.arr.map((el, i) => {
              return <img key={i} src={el.image_url} height="100" alt=""/>          
            })}
          </>:"No files uploaded"}
        </div>
      </div>
    )
  }
}