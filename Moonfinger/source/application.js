(function() {
  enyo.kind({
    name: "Moonfinger",
    kind: enyo.VFlexBox,
    components: [
      {
        kind: 'PageHeader',
        content: 'Moonfinger'
      }, {
        kind: 'RowGroup',
        caption: 'Task URL',
        components: [
          {
            kind: 'Input',
            name: 'getButton',
            components: [
              {
                kind: 'Button',
                caption: 'Get Tasks',
                onclick: 'changeTitle'
              }
            ]
          }
        ]
      }
    ],
    changeTitle: function() {
      return console.log(this.$.getButton);
    }
  });
}).call(this);
