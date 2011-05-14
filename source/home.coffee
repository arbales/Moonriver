entries = [
  {name: "Today + Overdue", image: "images/date-icon.png", viewName: "TaskList", viewPath: 'tasklist.html'}
  {name: "Open", image: "images/open-icon.png", viewName: "TaskList", viewPath: 'tasklist.html'}           
  {name: "Delegated", image: 'images/person-icon.png', viewName: "TaskList", viewPath: 'tasklist.html'}
  {name: "Completed", image: 'images/check-icon.png', viewName: "TaskList", viewPath: 'tasklist.html'}
]   

enyo.kind {
  name: "DataItem",
  kind: enyo.Item 
  published: {ViewName: "", ViewPath: ""}
}

enyo.kind {
  name: "Home"
  kind: enyo.VFlexBox
  components: [
      {kind: 'Dashboard', name: 'dashboard'}
      {
        kind: 'PageHeader',
        content: 'Manymoon', 
        pack: "center"
        style: "background: url('images/bar-top@2x.png'); background-size: auto 100%; -webkit-border-image: none;"
        components: [
          {kind: "Image", src: "images/logo.png", style: 'margin-bottom: -20px'}
        ]
      }
      {flex: 1, name: "list", kind: "VirtualList", className: "list", onSetupRow: "listSetupRow", components: [
        {kind: "Item", className: "item", components: [
          {kind: "HFlexBox", components: [
            {kind: "Image", src: "", name: 'itemImage', style: 'margin-right: 10px;margin-top:2px'}
            {name: "itemName", flex: 1, onclick: 'openView'},
            {name: "itemIndex", className: "item-index"}
          ]},
          {name: "itemSubject", className: "item-subject"}
        ]}
      ]},
  ]   
  openView: (sender, index) ->
    enyo.windows.activate("TaskList", "tasklist.html");
    
  windowParamsChangeHandler: ->
    @$.list.refresh()  
  windowActivatedHandler: ->
    @$.list.refresh()  
  listSetupRow: (sender, index) ->
    record = entries[index]
    if (record)               
      @$.itemImage.setSrc record.image            
      @.$.itemIndex.setContent("")
      @.$.itemIndex.applyStyle("color", "#3A8BCB")
      @.$.itemIndex.applyStyle("font-size", "85%")
      @.$.itemName.setContent(record.name)
      true    
}