
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
  name: "TaskList"
  kind: enyo.VFlexBox
  flex: 1
  edgeDragging: true
  components: [
      {kind: 'Dashboard', name: 'dashboard'}
      {kind: 'PageHeader', content: 'Manymoon', components: [
        {content: "Tasks", flex: 1}
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
        method: 'put'
        url: "http://ec2-50-17-136-168.compute-1.amazonaws.com/tasks.json", 
        handleAs: 'json'
        headers: {
         'Accept': 'application/json',
         'Content-Type': 'application/json',
         'Cookie': "_midnight_session=BAh7CEkiEF9jc3JmX3Rva2VuBjoGRUZJIjFKS3hvMVY1Ri84eG9SRkRGYlNNbEVCSlRWcUFhOG91R0Fmdm9GQ1V2R2tvPQY7AEZJIhl3YXJkZW4udXNlci51c2VyLmtleQY7AFRbCEkiCVVzZXIGOwBGWwZpA575HEkiCmR1bW15BjsARkkiD3Nlc3Npb25faWQGOwBGIiVhOGI1N2RlNDZlZjBmYjA2N2FiOGIwOWFjNzA0YmVhYg%3D%3D--db1cfdcfb86708d79a6b13d6ab9b16704f3e57ad",
        }
        onSuccess: "receiveUpdates"
      }
    ] 
  viewTask: (sender) -> 
    @owner.showTask Manymoon.tasks[sender.parent.controls[2]['Index']]
    
  receiveUpdates: (sender, response) ->
    @.$.list.refresh()
    
  checkboxClicked: (sender) ->
    task_id = sender.getTaskID()
    index = sender.getIndex()  
    Manymoon.tasks[index].status = if sender.checked then "Completed" else "Open"    
    Manymoon.tasks[name] = "hello"
    Manymoon.tasks[index].assignee_user_id = Manymoon.tasks[index].task_assignees[0].assignee_id
    Manymoon.tasks[index].task_assignees_set = [{
      assignee_id: Manymoon.tasks[index].task_assignees[0].assignee_id
      user_id: Manymoon.tasks[index].task_assignees[0].assignee_id
      completed: true
    }]
    delete Manymoon.tasks[index]['task_assignees']
    @.$.sendTask.url = "http://ec2-50-17-136-168.compute-1.amazonaws.com/tasks/#{task_id}"
    payload = enyo.json.stringify {task: Manymoon.tasks[index]}
    @.$.sendTask.call(payload)   
    @.$.list.reset()
  
  create: ->
    @inherited arguments
    @loadData()
                   
  loadData: ->  
    @$.list.reset()
    @$.getTasks.call()
      
  listSetupRow: (inSender, index) ->
    if not Manymoon.tasks
      @.$.getTasks.call()
      false
      
    record = Manymoon.tasks[index]
    if (record)                   
      # bind data to item controls
      @.setupDivider(index)                     
      # date = enyo.g11n.DateFmt::formatRelativeDate new Date(record.date_created), new Date()
      #@$.setIndex index
      
      @.$.itemCheck.setTaskID record.id
      @.$.itemCheck.setIndex index
      @.$.itemCheck.setChecked (record.status is "Completed")
                        
      @.$.itemName.setContent(record.name)
      # @.$.itemSubject.setContent(record.status)
      true
      
  setupDivider: (index) ->
    # use group divider at group transition, otherwise use item border for divider
    #var group = this.getGroupName(inIndex)
    group = Manymoon.tasks[index].status          
    if Manymoon.tasks[(index - 1)]?.status isnt group
      this.$.divider.setCaption(group)
      this.$.divider.canGenerate = Boolean(group)
      this.$.item.applyStyle("border-top", Boolean(group) ? "none" : "1px solid silver;")
    else
      this.$.divider.hide()

  receiveTasks: (sender, response) ->                    
    enyo.scrim.hide()   
    #data = enyo.json.parse response
    Manymoon.tasks = response  
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