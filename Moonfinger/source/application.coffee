compare_tasks = (a, b) ->
  if a.status <= b.status
    -1
  if a.status > b.status
    1
  return 0
  
enyo.kind {
  name: "DataCheckBox",
  kind: enyo.CheckBox 
  published: {TaskID: "", Index: ""}
}
    
enyo.kind {
  name: "Moonfinger"
  kind: enyo.VFlexBox
  components: [
      {kind: 'Dashboard', name: 'dashboard'}
      {kind: 'PageHeader', content: 'Manymoon', components: [
        {kind: "Image", src: "header-image.png"}
        {content: "", flex: 1}
        {kind: "Button", caption: "Refresh", onclick: "changeTitle"}             
      ]},
      {flex: 1, name: "list", kind: "VirtualList", className: "list", onSetupRow: "listSetupRow", components: [
        {kind: "Divider"},
        {kind: "Item", className: "item", components: [
          {kind: "HFlexBox", components: [
            {name: "itemName", flex: 1, onclick: "viewTask"},
            {name: "itemIndex", className: "item-index"}
            {kind: "DataCheckBox", onChange: "checkboxClicked", name:'itemCheck'}
          ]},
          {name: "itemSubject", className: "item-subject"}
        ]}
      ]},
      {
        name: "getTasks", kind: "WebService",
        url: "http://ec2-50-17-136-168.compute-1.amazonaws.com/tasks.json", 
        handleAs: 'json'
        headers: {
         'Accept': 'application/json',
         'Content-Type': 'application/json',
         'Cookie': "_midnight_session=BAh7CEkiEF9jc3JmX3Rva2VuBjoGRUZJIjFKS3hvMVY1Ri84eG9SRkRGYlNNbEVCSlRWcUFhOG91R0Fmdm9GQ1V2R2tvPQY7AEZJIhl3YXJkZW4udXNlci51c2VyLmtleQY7AFRbCEkiCVVzZXIGOwBGWwZpA575HEkiCmR1bW15BjsARkkiD3Nlc3Npb25faWQGOwBGIiVhOGI1N2RlNDZlZjBmYjA2N2FiOGIwOWFjNzA0YmVhYg%3D%3D--db1cfdcfb86708d79a6b13d6ab9b16704f3e57ad",
        },
        onSuccess: "receiveTasks",
        onFailure: "failToReceiveTasks"
      }
      {
        name: "sendTask", kind: "WebService",                       
        method: 'post'
        url: "http://ec2-50-17-136-168.compute-1.amazonaws.com/tasks.json", 
        handleAs: 'json'
        headers: {
         'Accept': 'application/json',
         'Content-Type': 'application/json',
         'Cookie': "_midnight_session=BAh7CEkiEF9jc3JmX3Rva2VuBjoGRUZJIjFKS3hvMVY1Ri84eG9SRkRGYlNNbEVCSlRWcUFhOG91R0Fmdm9GQ1V2R2tvPQY7AEZJIhl3YXJkZW4udXNlci51c2VyLmtleQY7AFRbCEkiCVVzZXIGOwBGWwZpA575HEkiCmR1bW15BjsARkkiD3Nlc3Npb25faWQGOwBGIiVhOGI1N2RlNDZlZjBmYjA2N2FiOGIwOWFjNzA0YmVhYg%3D%3D--db1cfdcfb86708d79a6b13d6ab9b16704f3e57ad",
        }
      }
    ] 
  viewTask: (sender) ->
    enyo.windows.activate("TaskWindow", "task.html");
    
  checkboxClicked: (sender) ->
    # task_id = sender.getTaskID()
    index = sender.getIndex()  
    @data[index].status = if sender.checked then "Completed" else "Open"    
    @.$.list.reset()
    #@.$.sendTask.call({task: @data[index]})   
    
  listSetupRow: (inSender, index) ->
    record = this.data[index]
    if (record)                   
      # bind data to item controls
      @.setupDivider(index)                     
      # date = enyo.g11n.DateFmt::formatRelativeDate new Date(record.date_created), new Date()
      @.$.itemIndex.setContent("")
      @.$.itemIndex.applyStyle("color", "#3A8BCB")
      @.$.itemIndex.applyStyle("font-size", "85%")
      @.$.itemCheck.setTaskID record.id
      @.$.itemCheck.setIndex index
      @.$.itemCheck.setChecked (record.status is "Completed")
      @.$.itemName.setContent(record.name)
      # @.$.itemSubject.setContent(record.status)
      true
      
  setupDivider: (index) ->
    # use group divider at group transition, otherwise use item border for divider
    #var group = this.getGroupName(inIndex)
    group = @data[index].status          
    if @data[(index - 1)]?.status isnt group
      this.$.divider.setCaption(group)
      this.$.divider.canGenerate = Boolean(group)
      this.$.item.applyStyle("border-top", Boolean(group) ? "none" : "1px solid silver;")
    else
      this.$.divider.hide()

  receiveTasks: (sender, response) ->                    
    enyo.scrim.hide()   
    #data = enyo.json.parse response
    @.data = response  
    @.$.list.refresh()

    #publish item for item in response
    
    # @.$.dashboard.push {
    #   icon: 'notification-icon.png'
    #   title: "Welcome"
    #   text: "Thanks for using Manymoon."
    # }    
      
  changeTitle: -> 
    enyo.scrim.show()
    @.$.getTasks.call()
}