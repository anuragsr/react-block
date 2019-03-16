import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { l, mock } from '../helpers/common'

let apiHost = '', call

export default class HttpService {
  
  constructor(){
    if(mock){
      this.initMock()     
    }else{
      apiHost = 'https://api-admin-staging.oyster.ai'
    }
  }
  
  initMock(){
    new MockAdapter(axios, { delayResponse: 1000 })
    .onGet('/api/v1/bots')
    .reply(200, {
      "count": 2,
      "results": [
        {"id": 1, "name": "Andrew Bot", "avatar": "assets/bot1.png"},
        {"id": 2, "name": "Paulie Bot", "avatar": "assets/bot2.png"},
        {"id": 3, "name": "Thomas Bot", "avatar": "assets/bot3.png"},
      ]
    })
    .onGet('/api/v1/tags')
    .reply(200, {
      "count": 2,
      "results": [
        {"id": 1, "name": "tag1:tag2:tag3", "full_name": "tag1:tag2:tag3", "image": "assets/tag-plh.png"},
        {"id": 2, "name": "tag2:tag3:tag4", "full_name": "tag2:tag3:tag4", "image": "assets/tag-plh.png"},
        {"id": 3, "name": "tag3:tag4:tag5", "full_name": "tag3:tag4:tag5", "image": "assets/tag-plh.png"},
      ]
    })
    .onGet('/api/v1/random_tags')
    .reply(200, {
      "count": 2,
      "results": [
        {"id": 1, "name": "random_tag1:tag2:tag3", "full_name": "random_tag1:tag2:tag3", "image": "assets/tag-plh.png"},
        {"id": 2, "name": "random_tag2:tag3:tag4", "full_name": "random_tag2:tag3:tag4", "image": "assets/tag-plh.png"},
        {"id": 3, "name": "random_tag3:tag4:tag5", "full_name": "random_tag3:tag4:tag5", "image": "assets/tag-plh.png"},
      ]
    })
    .onGet('api/v1/undo')
    .reply(204)
    .onGet('/api/v1/places')
    .reply(200, {
      "count": 2,
      "results": [
        {"id": 1, "title": "Panama City Title", "subtitle": "Panama City Subtitle"},
        {"id": 2, "title": "New Jersey Title", "subtitle": "New Jersey Subtitle"},
        {"id": 3, "title": "Moscow Title", "subtitle": "Moscow Subtitle"},
        {"id": 4, "title": "St. Petersburg Title", "subtitle": "St. Petersburg Subtitle"},
        {"id": 5, "title": "Vladivostok Title", "subtitle": "Vladivostok Subtitle"},
      ]
    })
    .onGet('/api/v1/suggested_tags')
    .reply(200, {
      "count": 2,
      "results": [
        {"id": 1, "name": "tag1:tag2:tag3", "full_name": "tag1:tag2:tag3", "image": "assets/tag-plh-sug.png"},
        {"id": 2, "name": "tag2:tag3:tag4", "full_name": "tag2:tag3:tag4", "image": "assets/tag-plh-sug.png"},
        {"id": 3, "name": "tag3:tag4:tag5", "full_name": "tag3:tag4:tag5", "image": "assets/tag-plh-sug.png"},
        {"id": 4, "name": "american", "full_name": "american", "image": "assets/tag-plh-sug.png"},
        {"id": 5, "name": "weather", "full_name": "weather", "image": "assets/tag-plh-sug.png", "optional": true},
        {"id": 6, "name": "distance", "full_name": "distance", "image": "assets/tag-plh-sug.png", "optional": true},
        {"id": 7, "name": "time", "full_name": "time", "image": "assets/tag-plh-sug.png", "optional": true},
      ]
    })
    .onPost('/api/v1/get_attraction_for_tags'/* , {
      "tags_ids": [1, 2, 3]
    } */)
    .reply(200, {
      "attraction": 73
    })
    .onPost('/api/v1/send_attraction_for_tags'/* , {
      "tags_ids": [1, 2, 3], 
      "ML_attraction": 73 (or None), 
      "editor_attraction": 65, 
      "editor_id": 1,
      "bot_id": 1
    } */)
    .reply(200, {
      "id": 1
    })
  }

  get(url, params) {
    let config = {
      method: "get",
      url: apiHost + url,
      params
    }
    if(call){
      call.cancel('One request at a time, fellas!')
    }
    call = axios.CancelToken.source()
    config.cancelToken = call.token
    return axios(config)
  }
  
  post(url, data) {
    let config = {
      method: "post",
      url: apiHost + url,
      data
    }
    if(call){
      call.cancel('One request at a time, fellas!')
    }
    call = axios.CancelToken.source()
    config.cancelToken = call.token
    return axios(config)
  }  
}