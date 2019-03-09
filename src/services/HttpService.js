import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

class HttpService {

  constructor(){
    this.initMock()
  }
  
  initMock(){
    // const mock = new MockAdapter(axios, { delayResponse: 1000 })
    
    new MockAdapter(axios, { delayResponse: 1000 })
    // .onGet('/api/v1/tags', { params: { query: 'a' } }).reply(200, {      
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
        {"id": 1, "name": "tag1:tag2:tag3", "image": "assets/tag-plh.png"},
        {"id": 2, "name": "tag2:tag3:tag4", "image": "assets/tag-plh.png"},
        {"id": 3, "name": "tag3:tag4:tag5", "image": "assets/tag-plh.png"},
      ]
    })
    .onGet('api/v1/undo')
    .reply(204)
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
      "editor_id": 1
    } */)
    .reply(200, {
      "id": 1
    })
  }

  get(url, data) {
    return axios.get(url, data)
  }
  
  post(url, data) {  	
    return axios.post(url, data)
  }  
}

export default HttpService