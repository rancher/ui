/*
   Copyright 2019 Kiali

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

export default {
  NodeType: {
    APP:      'app',
    SERVICE:  'service',
    UNKNOWN:  'unknown',
    WORKLOAD: 'workload'
  },
  DEGRADED: {
    name:     'Degraded',
    color:    '#ec7a08',
    priority: 2,
    icon:     'warning-triangle-o'
  },
  FAILURE: {
    name:     'Failure',
    color:    '#cc0000',
    priority: 3,
    icon:     'error-circle-o'
  },
  PfColors: {
    Black100:      '#fafafa',
    Black150:      '#f5f5f5',
    Black200:      '#ededed',
    Black300:      '#d1d1d1',
    Black400:      '#bbb',
    Black500:      '#8b8d8f',
    Black600:      '#72767b',
    Black700:      '#4d5258',
    Black800:      '#393f44',
    Black900:      '#292e34',
    Black1000:     '#030303',
    Blue50:        '#def3ff',
    Blue100:       '#bee1f4',
    Blue200:       '#7dc3e8',
    Blue300:       '#39a5dc',
    Blue400:       '#0088ce',
    Blue500:       '#00659c',
    Blue600:       '#004368',
    Blue700:       '#002235',
    Cyan100:       '#bedee1',
    Cyan200:       '#7dbdc3',
    Cyan300:       '#3a9ca6',
    Cyan400:       '#007a87',
    Cyan500:       '#005c66',
    Cyan600:       '#003d44',
    Cyan700:       '#001f22',
    Gold100:       '#fbeabc',
    Gold200:       '#f9d67a',
    Gold300:       '#f5c12e',
    Gold400:       '#f0ab00',
    Gold500:       '#b58100',
    Gold600:       '#795600',
    Gold700:       '#3d2c00',
    Green100:      '#cfe7cd',
    Green200:      '#9ecf99',
    Green300:      '#6ec664',
    Green400:      '#3f9c35',
    Green500:      '#2d7623',
    Green600:      '#1e4f18',
    Green700:      '#0f280d',
    LightBlue100:  '#beedf9',
    LightBlue200:  '#7cdbf3',
    LightBlue300:  '#35caed',
    LightBlue400:  '#00b9e4',
    LightBlue500:  '#008bad',
    LightBlue600:  '#005c73',
    LightBlue700:  '#002d39',
    LightGreen100: '#e4f5bc',
    LightGreen200: '#c8eb79',
    LightGreen300: '#ace12e',
    LightGreen400: '#92d400',
    LightGreen500: '#6ca100',
    LightGreen600: '#486b00',
    LightGreen700: '#253600',
    Orange100:     '#fbdebf',
    Orange200:     '#f7bd7f',
    Orange300:     '#f39d3c',
    Orange400:     '#ec7a08',
    Orange500:     '#b35c00',
    Orange600:     '#773d00',
    Orange700:     '#3b1f00',
    Purple100:     '#c7bfff',
    Purple200:     '#a18fff',
    Purple300:     '#8461f7',
    Purple400:     '#703fec',
    Purple500:     '#582fc0',
    Purple600:     '#40199a',
    Purple700:     '#1f0066',
    Red100:        '#cc0000',
    Red200:        '#a30000',
    Red300:        '#8b0000',
    Red400:        '#470000',
    Red500:        '#2c0000',

    White: '#fff',
    Black: '#030303',

    Blue:       '#0088ce', // Blue400
    Cyan:       '#007a87', // Cyan400
    Gold:       '#f0ab00', // Gold400
    Green:      '#3f9c35', // Green400
    LightBlue:  '#00b9e4', // LightBlue400
    LightGreen: '#92d400', // LightGreen400
    Orange:     '#ec7a08', // Orange400
    Red:        '#cc0000', // Red100

    // Kiali colors that use PF colors
    Gray: '#72767b' // Black600
  },
  ZoomOptions:                     { fitPadding: 25 },
  CytoscapeGlobalScratchNamespace: '_global',
  NodeImageOut:                    `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJ8AAACgCAYAAAASN76YAAAAiHpUWHRSYXcgcHJvZmlsZSB0eXBlIGV4aWYAAHjaVY7dDcQwCIPfmeJGcIDwM05VNdJtcOMfUVpF/R7AssAyXb/voM+kgUm7h6UZCk1NPkoEFgI0Rpu75uLe0krxtkl4Cctw6D7U23/oYmHD1d26nXZypfMlLFGz/mimYtbIHZLjafT2j3c26A9OiiyFi3p6tAAACgZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+Cjx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDQuNC4wLUV4aXYyIj4KIDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+CiAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgIHhtbG5zOmV4aWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vZXhpZi8xLjAvIgogICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iCiAgIGV4aWY6UGl4ZWxYRGltZW5zaW9uPSIxNTkiCiAgIGV4aWY6UGl4ZWxZRGltZW5zaW9uPSIxNjAiCiAgIHRpZmY6SW1hZ2VXaWR0aD0iMTU5IgogICB0aWZmOkltYWdlSGVpZ2h0PSIxNjAiCiAgIHRpZmY6T3JpZW50YXRpb249IjEiLz4KIDwvcmRmOlJERj4KPC94OnhtcG1ldGE+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg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`,
  NodeImageOutLocked:              `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADsAAAA7CAYAAADFJfKzAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4gkRFRYH6vwDTQAAAzBJREFUaN7tms9LalEQx7/aK0syXwQSRQRGQRII4jOhH27uXWaLoP+hdVCLFrYyWmRbN61q0y5opS6Mcvfc2A+JHi4ECTPCMn90sR9v8ejgqUcGHb1KM6uZYbzXj2fOnDPnqAkGgy/4JqLFNxKCJViCJViCJViCJViCJdgP5Ec9XyZJEjQaDbNLpRIikUjd3q+pddfjcrnQ1tZWNe7y8hJnZ2fNmcZarRayLH8KFAD6+vogy3LzpbHNZkNPTw/ny2ZvEQgG8OfiAvl8HiaTCRMTExgfH+dSW5ZlhEKh5oA1Go0caC6Xw+rqKra2tpDL5d7FWywWrK2twe121xxYeBo7HA6mJ5NJTE9PY3Nz87+gABCPxzE7O4uVlRXOX4uUFgorSRLT7+/v4Xa7EYvFuBiTyQSz2YzOzk7O7/V6sbGxwfna29sbF7Zy7i0vL+P4+JibxwcHB0in00gkEkilUlhfX0dXVxeL8Xg8OD8/Z/bU1FRjwtpsNqanUilsb28z22q1IhwOw+VysR/EaDRiaWkJOzs7rGIXCgV4vd7GX3oqi9L+/j7y+Tyz/X4/N4KVMjMzg7m5OWYHAgGUy2Vmt7a2NvY6e3p6yvTh4WE4nc4P4+fn55meyWSQTCaZbbfbGxv25uaG2yxUk4GBAc6+vr5m+ttCpjrs5OQkZz8/PzO9paWl6uffxjw9Pb2r4A0B63Q60dHRUdNtntVqhcViUX8HZTAYOLtYLOLx8ZEbpUKh8OEzisXiO7tcLnPFqb+/H/F4XL2uZ3BwECMjIwCAu7s7SJKEaDQqZDQNBgM8Hg8WFxeZLxaLIZPJqJPGQ0NDTN/b2xMG+roD8/l8nG9sbEy9OVtZWEqlkvC5+vaZnyl2dCxDsARLsARLsATbhLAvL/X9V1FlN1V32KurK6aPjo4KhzObzZydTqfV63pOTk7Q29sL4N81x+7uLiKRiJAR1+v1WFhY4HxfvR75counKAp0Oh07Xqk8YhEpDw8P6heow8NDKIpS07mqKAqOjo7Ub95fgQHAbv+F7u6fwiCz2VtEo7+FPU/oXY/IL0brLMESLMESLMESLMESLMESLMEKkb8wgQxkMaP90gAAAABJRU5ErkJggg==`,
  GraphType:                       {
    APP:           'app',
    SERVICE:       'service',
    VERSIONED_APP: 'versionedApp',
    WORKLOAD:      'workload',
  },
  EdgeLabelMode: {
    HIDE:                          'hide',
    TRAFFIC_RATE_PER_SECOND:       'trafficRatePerSecond',
    REQUESTS_PERCENT_OF_TOTAL:     'requestsPercentOfTotal',
    RESPONSE_TIME_95TH_PERCENTILE: 'responseTime95thPercentile',
  },
  REQUESTS_THRESHOLDS: {
    degraded: 0.1,
    failure:  20,
    unit:     '%',
  },
  Protocol: {
    GRPC: 'grpc',
    HTTP: 'http',
    TCP:  'tcp'
  },
  CyEdge: {
    grpc:           'grpc',
    grpcErr:        'grpcErr',
    grpcPercentErr: 'grpcPercentErr',
    grpcPercentReq: 'grpcPercentReq',
    http:           'http',
    http3xx:        'http3xx',
    http4xx:        'http4xx',
    http5xx:        'http5xx',
    httpPercentErr: 'httpPercentErr',
    httpPercentReq: 'httpPercentReq',
    id:             'id',
    isMTLS:         'isMTLS',
    protocol:       'protocol',
    responseTime:   'responseTime',
    tcp:            'tcp',
  }
}
