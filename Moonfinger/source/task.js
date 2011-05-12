(function() {
  enyo.kind({
    name: "TaskWindow",
    kind: enyo.VFlexBox,
    components: [
      {
        kind: 'Dashboard',
        name: 'dashboard'
      }, {
        kind: 'PageHeader',
        content: 'Manymoon',
        components: [
          {
            content: "Task",
            flex: 1
          }
        ]
      }
    ]
  });
}).call(this);
