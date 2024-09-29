import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { l, mock } from "../helpers/common";

let apiHost = "",
  call;

export default class HttpService {
  constructor() {
    if (mock) {
      this.initMock();
    } else {
      // apiHost = 'https://api-admin.oyster.ai'
      apiHost = "https://api-admin-staging.oyster.ai";
    }
  }

  initMock() {
    l("Mock");
    new MockAdapter(axios, { delayResponse: 1000 })
      .onPost("/api/v1/login", {
        ml_page: true,
        username: "ml_page",
        password: "}XhE9p2/FQjx9.e"
      })
      .reply(200, {
        permissions: ["photo_block", "place_block", "tag_block"]
      })
      .onGet("/api/v1/bots", {})
      .reply(200, {
        count: 2,
        results: [
          { id: 1, name: "Andrew Bot", avatar: "assets/bot1.svg" },
          { id: 2, name: "Paulie Bot", avatar: "assets/bot2.svg" },
          { id: 3, name: "Thomas Bot", avatar: "assets/bot3.svg" }
        ]
      })
      .onGet("/api/v1/tags", {})
      .reply(200, {
        count: 2,
        results: [
          {
            id: 1,
            name: "tag1:tag2:tag3",
            full_name: "tag1:tag2:tag3",
            image: "assets/tag-plh.png"
          },
          {
            id: 2,
            name: "tag2:tag3:tag4",
            full_name: "tag2:tag3:tag4",
            image: "assets/tag-plh.png"
          },
          {
            id: 3,
            name: "tag3:tag4:tag5",
            full_name: "tag3:tag4:tag5",
            image: "assets/tag-plh.png"
          }
        ]
      })
      .onGet("/api/v1/random_tags", {})
      .reply(200, {
        count: 2,
        results: [
          {
            id: 1,
            name: "random_tag1:tag2:tag3",
            full_name: "random_tag1:tag2:tag3",
            image: "assets/tag-plh.png"
          },
          {
            id: 2,
            name: "random_tag2:tag3:tag4",
            full_name: "random_tag2:tag3:tag4",
            image: "assets/tag-plh.png"
          },
          {
            id: 3,
            name: "random_tag3:tag4:tag5",
            full_name: "random_tag3:tag4:tag5",
            image: "assets/tag-plh.png"
          }
        ]
      })
      .onGet("api/v1/undo")
      .reply(204)
      .onGet("/api/v1/places", {})
      .reply(200, {
        count: 2,
        results: [
          {
            id: 1,
            name: "Panama City Title",
            vicinity: "Panama City Subtitle"
          },
          { id: 2, name: "New Jersey Title", vicinity: "New Jersey Subtitle" },
          { id: 3, name: "Moscow Title", vicinity: "Moscow Subtitle" },
          {
            id: 4,
            name: "St. Petersburg Title",
            vicinity: "St. Petersburg Subtitle"
          },
          { id: 5, name: "Vladivostok Title", vicinity: "Vladivostok Subtitle" }
        ]
      })
      .onGet("/api/v1/suggested_tags", {})
      .reply(200, {
        count: 2,
        results: [
          {
            id: 1,
            name: "tag1:tag2:tag3",
            full_name: "tag1:tag2:tag3",
            image: "assets/tag-plh-sug.png"
          },
          {
            id: 2,
            name: "tag2:tag3:tag4",
            full_name: "tag2:tag3:tag4",
            image: "assets/tag-plh-sug.png"
          },
          {
            id: 3,
            name: "tag3:tag4:tag5",
            full_name: "tag3:tag4:tag5",
            image: "assets/tag-plh-sug.png"
          },
          {
            id: 4,
            name: "american",
            full_name: "american",
            image: "assets/tag-plh-sug.png"
          },
          {
            id: 5,
            name: "weather",
            full_name: "weather",
            image: "assets/tag-plh-sug.png",
            optional: true
          },
          {
            id: 6,
            name: "distance",
            full_name: "distance",
            image: "assets/tag-plh-sug.png",
            optional: true
          },
          {
            id: 7,
            name: "time",
            full_name: "time",
            image: "assets/tag-plh-sug.png",
            optional: true
          }
        ]
      })
      .onPost(
        "/api/v1/get_attraction_for_tags" /* , {
      "tags_ids": [1, 2, 3]
    } */
      )
      .reply(200, {
        attraction: 73
      })
      .onPost(
        "/api/v1/send_attraction_for_tags" /* , {
      "tags_ids": [1, 2, 3], 
      "ML_attraction": 73 (or None), 
      "editor_attraction": 65, 
      "editor_id": 1,
      "bot_id": 1
    } */
      )
      .reply(200, {
        id: 1
      })
      .onPost(
        "/api/v1/get_attraction_for_place" /* , {
      "tags_ids": [1, 2, 3],
      "place_id": 1
    } */
      )
      .reply(200, {
        attraction: 73
      })
      .onPost(
        "/api/v1/send_attraction_for_place" /* , {
      "tags_ids": [1, 2, 3], 
      "ML_attraction": 73 (or None), 
      "editor_attraction": 65, 
      "editor_id": 1,
      "bot_id": 1,
      "place_id": 1
    } */
      )
      .reply(200, {
        id: 1
      })
      .onGet("/api/v1/categories")
      .reply(200, {
        results: ["food", "kitchen", "table"]
      })
      .onGet("/api/v1/tags", {})
      .reply(200, {
        count: 2,
        results: [
          {
            id: 1,
            name: "tag1:tag2:tag3",
            full_name: "tag1:tag2:tag3",
            image: "assets/tag-plh.png"
          },
          {
            id: 2,
            name: "tag2:tag3:tag4",
            full_name: "tag2:tag3:tag4",
            image: "assets/tag-plh.png"
          },
          {
            id: 3,
            name: "tag3:tag4:tag5",
            full_name: "tag3:tag4:tag5",
            image: "assets/tag-plh.png"
          }
        ]
      })
      .onPut("/api/v1/submit_photo")
      .reply(200, {})
      .onGet("/api/v1/photos", {})
      .reply(200, {
        count: 4,
        results: [
          {
            id: 600690,
            name: "food.jpg",
            labels: [
              {
                form: "Rectangle",
                id: 396,
                label: {
                  id: 7738,
                  name: "fashion accessory",
                  tag: null
                },
                object_coords: [
                  "0.3132956922054291",
                  "0.27638623118400574",
                  "0.9963658452033997",
                  "0.8171226382255554"
                ]
              },
              {
                form: "Circle",
                id: 39601,
                label: {
                  id: 77381,
                  name: "circle",
                  tag: null
                },
                object_coords: [
                  "0.2660536421530819",
                  "0.03249433527307487",
                  "0.6242626535534694",
                  "0.7778712830904767"
                ]
              },
              {
                form: "Polygon",
                id: 396012,
                label: {
                  id: 773812,
                  name: "poly",
                  tag: null
                },
                object_coords: [
                  "0.050795250896057347",
                  "0.1671309192200557",
                  "0.06334005376344086",
                  "0.7158774373259053",
                  "0.25509632616487454",
                  "0.8579387186629527",
                  "0.32857302867383514",
                  "0.6295264623955432",
                  "0.28377016129032256",
                  "0.21727019498607242",
                  "0.19058019713261648",
                  "0.03064066852367688"
                ]
              }
            ],
            category: {
              id: 23,
              name: "Food"
            },
            image_url: "assets/food.jpg",
            ml_check_date: "2019-03-14T16:19:34+0000"
          },
          {
            id: 600691,
            name: "kitchen.jpg",
            labels: [
              {
                form: "Rectangle",
                id: 397,
                label: {
                  id: 7738,
                  name: "fashion accessory",
                  tag: null
                },
                object_coords: [
                  "0.3132956922054291",
                  "0.27638623118400574",
                  "0.9963658452033997",
                  "0.8171226382255554"
                ]
              },
              {
                form: "Circle",
                id: 39601,
                label: {
                  id: 77381,
                  name: "circle",
                  tag: null
                },
                object_coords: [
                  "0.2660536421530819",
                  "0.03249433527307487",
                  "0.6242626535534694",
                  "0.7778712830904767"
                ]
              },
              {
                form: "Polygon",
                id: 396012,
                label: {
                  id: 773812,
                  name: "poly",
                  tag: null
                },
                object_coords: [
                  "0.050795250896057347",
                  "0.1671309192200557",
                  "0.06334005376344086",
                  "0.7158774373259053",
                  "0.25509632616487454",
                  "0.8579387186629527",
                  "0.32857302867383514",
                  "0.6295264623955432",
                  "0.28377016129032256",
                  "0.21727019498607242",
                  "0.19058019713261648",
                  "0.03064066852367688"
                ]
              }
            ],
            category: {
              id: 23,
              name: "Food"
            },
            image_url: "assets/kitchen.jpg",
            ml_check_date: "2019-03-14T16:19:34+0000"
          },
          {
            id: 600692,
            name: "table.jpg",
            labels: [
              {
                form: "Rectangle",
                id: 398,
                label: {
                  id: 7738,
                  name: "fashion accessory",
                  tag: null
                },
                object_coords: [
                  "0.3132956922054291",
                  "0.27638623118400574",
                  "0.9963658452033997",
                  "0.8171226382255554"
                ]
              },
              {
                form: "Circle",
                id: 39601,
                label: {
                  id: 77381,
                  name: "circle",
                  tag: null
                },
                object_coords: [
                  "0.2660536421530819",
                  "0.03249433527307487",
                  "0.6242626535534694",
                  "0.7778712830904767"
                ]
              },
              {
                form: "Polygon",
                id: 396012,
                label: {
                  id: 773812,
                  name: "poly",
                  tag: null
                },
                object_coords: [
                  "0.050795250896057347",
                  "0.1671309192200557",
                  "0.06334005376344086",
                  "0.7158774373259053",
                  "0.25509632616487454",
                  "0.8579387186629527",
                  "0.32857302867383514",
                  "0.6295264623955432",
                  "0.28377016129032256",
                  "0.21727019498607242",
                  "0.19058019713261648",
                  "0.03064066852367688"
                ]
              }
            ],
            category: {
              id: 23,
              name: "Food"
            },
            image_url: "assets/table.jpg",
            ml_check_date: "2019-03-14T16:19:34+0000"
          },
          {
            id: 600694,
            name: "clock.jpg",
            labels: [
              {
                form: "Rectangle",
                id: 399,
                label: {
                  id: 7738,
                  name: "fashion accessory",
                  tag: null
                },
                object_coords: [
                  "0.3132956922054291",
                  "0.27638623118400574",
                  "0.9963658452033997",
                  "0.8171226382255554"
                ]
              },
              {
                form: "Circle",
                id: 39601,
                label: {
                  id: 77381,
                  name: "circle",
                  tag: null
                },
                object_coords: [
                  "0.2660536421530819",
                  "0.03249433527307487",
                  "0.6242626535534694",
                  "0.7778712830904767"
                ]
              },
              {
                form: "Polygon",
                id: 396012,
                label: {
                  id: 773812,
                  name: "poly",
                  tag: null
                },
                object_coords: [
                  "0.050795250896057347",
                  "0.1671309192200557",
                  "0.06334005376344086",
                  "0.7158774373259053",
                  "0.25509632616487454",
                  "0.8579387186629527",
                  "0.32857302867383514",
                  "0.6295264623955432",
                  "0.28377016129032256",
                  "0.21727019498607242",
                  "0.19058019713261648",
                  "0.03064066852367688"
                ]
              }
            ],
            category: {
              id: 23,
              name: "Food"
            },
            image_url: "assets/clock.jpeg",
            ml_check_date: "2019-03-14T16:19:34+0000"
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
      });
  }

  get(url, params, auth) {
    let config = {
      method: "get",
      url: apiHost + url,
      params,
      auth
    };

    // if (params && params.newBaseUrl) {
    //   config.url = url
    //   delete config.params.newBaseUrl
    // }

    return this.doRequest(config);
  }

  post(url, data, auth) {
    let config = {
      method: "post",
      url: apiHost + url,
      data,
      auth
    };

    if (data.newBaseUrl) {
      config.url = url;
      config.data = data.file;
      delete config.data.newBaseUrl;
    }

    return this.doRequest(config);
  }

  put(url, data, auth) {
    let config = {
      method: "put",
      url: apiHost + url,
      data,
      auth
    };
    return this.doRequest(config);
  }

  doRequest = config => {
    // l(config)
    if (config.params && config.params.series) {
      delete config.params.series;
      if (call) {
        call.cancel("One request at a time, fellas!");
      }
      call = axios.CancelToken.source();
      config.cancelToken = call.token;
    }
    return axios(config);
  };
}
