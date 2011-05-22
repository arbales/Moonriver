enyo.kind {
  name: 'Launch'
  kind: "Pane"
  style: "height: 100%"                     
  transitionKind: "enyo.transitions.LeftRightFlyin"
  onSelectView: 'viewSelected'
  components: [
    {kind: "Home", style: 'background: #D8D8D8'}
    {kind: "TaskList", name: 'tasks', style: 'background: #D8D8D8'}    
    {kind: "TaskWindow", name: 'task', style: 'background: #D8D8D8', lazy: true}
  ]  
  showTask: (task) ->
    @['current_task'] = task
    @selectViewByName 'task'
  viewSelected: (sender, next_view, previous_view) ->
    console.log "hello"
    next_view.load()

  # this.owner.selectViewByName "task"
  # paneCreateView: (sender, name) ->
  #   if name is 'task'
  #     @$.pane.createComponent {kind: }
    
  
}

# enyo.kind {
#   name: 'Launch'
#   kind: "SlidingPane"
#   style: "height: 100%"
#   multiView: false
#   components: [
#     {kind: "Home"}
#     {kind: "TaskList", name: 'tasks'}
#     {kind: "TaskWindow", name: 'task', style: 'background: #D8D8D8'}
#   ]      
# } 
