enyo.kind
  name: "DataItem"
  kind: enyo.Item 
  published: 
    ViewName: ""
    ViewPath: ""

enyo.kind
  name: "Home"
  kind: enyo.VFlexBox
  flex: 1
  components: [
      kind: 'Dashboard'
      name: 'dashboard'
    ,
      kind: 'PageHeader'
      content: 'Manymoon'
      pack: "center"
      style: "background: url('images/bar-top@2x.png'); background-size: auto 100%; -webkit-border-image: none;"
      components: [
         kind: "Image",
         src: "images/logo.png"
         style: 'margin-bottom: -20px'
      ]
    ,
      flex: 3
      name: "first-list"
      kind: "Group"
      className: "list"
      components: [
          kind: "Item"
          className: "item"
          style: 'padding: 12px 18px'
          onclick: 'openView'
          components: [
            kind: 'HFlexBox', components: [
                kind: "Image"
                src: "images/date-icon-30.png"
                style: 'margin-right: 18px;'
              ,
                content: "Today & Upcoming"
                style: 'line-height: 30px'              
            ]                                                          
          ]
        ,
          kind: "Item", className: "item", style: 'padding: 12px 18px', onclick: 'openView', components: [
            kind: 'HFlexBox', components: [
                kind: "Image"
                src: "images/inbox-icon-30.png"
                style: 'margin-right: 18px;'
              ,              
                content: "Inbox"
                style: 'line-height: 30px'
            ]
          ]
        ,  
          kind: "Item", className: "item", style: 'padding: 12px 18px', onclick: 'openView', components: [
            kind: 'HFlexBox', components: [
                kind: "Image"
                src: "images/person-icon-30.png"
                style: 'margin-right: 18px;'
              ,              
                content: "Delegated"
                style: 'line-height: 30px'
            ]
          ]
      ]
    ,
      flex: 1
      name: "project_list"
      kind: "Group"
      className: "list"
      components: [
        kind: "Item"
        className: "item"
        style: 'padding: 12px 18px'
        onclick: 'openView'
        components: [
          kind: 'HFlexBox', components: [          
              kind: "Image"
              src: "images/project-icon-30.png"
              style: 'margin-right: 18px;'
            ,  
              content: "Projects"
              style: 'line-height: 30px'
          ]
        ]
      ]   
  ]   
  openView: (sender, index) ->
    #enyo.windows.activate("TaskList", "tasklist.html");
    console.log @owner
    this.owner.selectViewByName "tasks"
    
  listSetupRow: (sender, index) ->
    record = @entries[index]
    if (record)               
      @$.itemImage.setSrc record.image            
      @.$.itemIndex.setContent("")
      @.$.itemIndex.applyStyle("color", "#3A8BCB")
      @.$.itemIndex.applyStyle("font-size", "85%")
      @.$.itemName.setContent(record.name)
      true    
