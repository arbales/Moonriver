enyo.kind {
  name: "Moonfinger"
  kind: enyo.VFlexBox
  components: [
      {kind: 'PageHeader', content: 'Moonfinger'}
      {kind: 'RowGroup', caption: 'Task URL', components: [
          {kind: 'Input', name: 'getButton', components: [
              {kind: 'Button', caption: 'Get Tasks', onclick: 'changeTitle'}
            ]}
        ]} 
      {name: "getWeather", kind: "WebService"
        url: "http://stillhope.com:8888/projects"
        headers: {
          'Accept': 'application/json'
          'Content-Type': 'application/json'
          'Cookie': 
        }
        onSuccess: "gotWeather"
        onFailure: "gotWeatherFailure"}
    ]
  changeTitle: ->
    console.log @$.getButton
}