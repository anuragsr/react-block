import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { l, mock } from '../helpers/common'

let apiHost = '', call

export default class HttpService {
  
  constructor(){
    l()    
    if(mock){
      this.initMock()     
    }else{
      apiHost = 'https://api-admin-staging.oyster.ai'
    }
  }
  
  initMock(){
    new MockAdapter(axios, { delayResponse: 1000 })
    .onGet('/api/v1/bots', {})
    .reply(200, {
      "count": 2,
      "results": [
        {"id": 1, "name": "Andrew Bot", "avatar": "assets/bot1.png"},
        {"id": 2, "name": "Paulie Bot", "avatar": "assets/bot2.png"},
        {"id": 3, "name": "Thomas Bot", "avatar": "assets/bot3.png"},
      ]
    })
    .onGet('/api/v1/tags', {})
    .reply(200, {
      "count": 2,
      "results": [
        {"id": 1, "name": "tag1:tag2:tag3", "full_name": "tag1:tag2:tag3", "image": "assets/tag-plh.png"},
        {"id": 2, "name": "tag2:tag3:tag4", "full_name": "tag2:tag3:tag4", "image": "assets/tag-plh.png"},
        {"id": 3, "name": "tag3:tag4:tag5", "full_name": "tag3:tag4:tag5", "image": "assets/tag-plh.png"},
      ]
    })
    .onGet('/api/v1/random_tags', {})
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
    .onGet('/api/v1/places', {})
    .reply(200, {
      "count": 2,
      "results": [
        {"id": 1, "name": "Panama City Title", "vicinity": "Panama City Subtitle"},
        {"id": 2, "name": "New Jersey Title", "vicinity": "New Jersey Subtitle"},
        {"id": 3, "name": "Moscow Title", "vicinity": "Moscow Subtitle"},
        {"id": 4, "name": "St. Petersburg Title", "vicinity": "St. Petersburg Subtitle"},
        {"id": 5, "name": "Vladivostok Title", "vicinity": "Vladivostok Subtitle"},
      ]
    })
    .onGet('/api/v1/suggested_tags', {})
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
    .onPost('/api/v1/get_attraction_for_place'/* , {
      "tags_ids": [1, 2, 3],
      "place_id": 1
    } */)
    .reply(200, {
      "attraction": 73
    })
    .onPost('/api/v1/send_attraction_for_place'/* , {
      "tags_ids": [1, 2, 3], 
      "ML_attraction": 73 (or None), 
      "editor_attraction": 65, 
      "editor_id": 1,
      "bot_id": 1,
      "place_id": 1
    } */)
    .reply(200, {
      "id": 1
    })
    .onGet('/api/v1/photos', {})
    .reply(200, {      
      "count": 4,
      "results": [
        {
          "id": 600690,
          "name": "Photo1.jpg", 
          "labels": [
            {
              "id": 459,
              "object_rectangle": [
                "0.36019423604011536",
                "0.6705842614173889",
                "0.9092695116996765",
                "0.9804669618606567"
              ],
              "label": {
                "id": 7793,
                "name": "kitchen utensil"
              }
            }
          ],
          "category": {
            "id": 23,
            "name": "Food"
          },
          "image_url": "https://somewhere-data.s3.amazonaws.com/media/places/photos/006.jpgejlBjQEdYh.jpg",
          "ml_check_date": "2019-03-14T16:19:34+0000"
        },{
          "id": 600691,
          "name": "Photo2.jpg", 
          "labels": [
            {
              "id": 459,
              "object_rectangle": [
                "0.36019423604011536",
                "0.6705842614173889",
                "0.9092695116996765",
                "0.9804669618606567"
              ],
              "label": {
                "id": 7793,
                "name": "kitchen utensil"
              }
            }
          ],
          "category": {
            "id": 23,
            "name": "Food"
          },
          "image_url": "assets/photo-plh.png",
          "ml_check_date": "2019-03-15T16:19:34+0000"
        }
      ]
      // "count": 2,
      // "results": [
      //   {"id": 1, "photo_name": "Photo1.jpg", "image": "assets/photo-plh.png", checked: true, checkedTime: new Date(), city_id:""},
      //   {"id": 2, "photo_name": "Photo2.jpg", "image": "assets/photo-plh.png", checked: true, checkedTime: new Date(), city_id:""},
      //   {"id": 3, "photo_name": "Photo3.jpg", "image": "assets/photo-plh.png", checked: true, checkedTime: new Date(), city_id:""},
      //   {"id": 4, "photo_name": "Photo4.jpg", "image": "assets/photo-plh.png", checked: false, city_id:""},
      //   {"id": 5, "photo_name": "Photo5.jpg", "image": "assets/photo-plh.png", checked: false, city_id:""},
      // ]
    })
  }

  get(url, params, auth) {
    let config = {
      method: "get",
      url: apiHost + url,
      params,
      auth
    }
    return this.doRequest(config)
  }
  
  post(url, data, auth) {
    let config = {
      method: "post",
      url: data.newBaseUrl?url:apiHost + url,
      data,
      auth
    }
    return this.doRequest(config)
  }

  put(url, data, auth) {
    let config = {
      method: "put",
      url: apiHost + url,
      data,
      auth
    }
    return this.doRequest(config)
  }
  
  doRequest = config => {
    // l(config)
    if(config.params && !config.params.parallel){
      if(call){
        call.cancel('One request at a time, fellas!')
      }
      call = axios.CancelToken.source()
      config.cancelToken = call.token
    }
    return axios(config)
  }
}