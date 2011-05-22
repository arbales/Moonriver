enyo.kind {
  name: "TaskWindow"
  flex: 1
  kind: enyo.VFlexBox
  create: ->
    @inherited arguments
    @loadData()

  viewSelected: ->
    console.log "selected"
    
  loadData: ->         
    if not @owner.current_task
      console.log "empty"
    else  
      @task = @owner.current_task
      @$.task_name.setContent @task.name               
      @$.assignee.setContent "#{@task.task_assignees[0].assignee.first_name} #{@task.task_assignees[0].assignee.last_name} "
    
  components: [
        kind: 'Dashboard'
        name: 'dashboard'
      ,
        kind: 'PageHeader'
        content: 'Manymoon'
        components: [
          content: "Task"
          flex: 1
          name: 'task_name'
        ]
      , 
        flex: 1
        kind: 'Group'
        caption: 'Assigned to&hellip;'
        components: [
            kind: 'Item'
            content: ''
            name: 'assignee'
            style: 'border-top: none'
          ,
            kind: 'Item'
            content: ''
        ]
      ,
        flex: 1
        kind: 'Group'
        caption: 'Details'
        components: [
          kind: 'Item'
          style: 'border-top: none'
          content: 'Created at: <strong>June 1st 2010</strong>'
        ]
  ]
}