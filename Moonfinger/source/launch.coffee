enyo.kind { 
  kind: enyo.VFlexBox
  name: "Launch"
  components: [  
    {
      name: 'pane'
      kind: "Pane" 
      onSelectView: 'viewSelected'
      transitionKind: "enyo.transitions.LeftRightFlyin"
      components: [
        {kind: "Home"}
        {kind: "TaskList"}
      ]   
    } 
  ] 
  viewSelected: (sender, view, previous_view) ->
    console.log view 
  home: ->
    @$.pane.selectViewByIndex(1)
    
}