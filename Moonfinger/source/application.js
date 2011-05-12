(function() {
  var compare_tasks;
  compare_tasks = function(a, b) {
    if (a.status <= b.status) {
      -1;
    }
    if (a.status > b.status) {
      1;
    }
    return 0;
  };
  enyo.kind({
    name: "DataCheckBox",
    kind: enyo.CheckBox,
    published: {
      TaskID: "",
      Index: ""
    }
  });
  enyo.kind({
    name: "Moonfinger",
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
            kind: "Image",
            src: "header-image.png"
          }, {
            content: "",
            flex: 1
          }, {
            kind: "Button",
            caption: "Refresh",
            onclick: "changeTitle"
          }
        ]
      }, {
        flex: 1,
        name: "list",
        kind: "VirtualList",
        className: "list",
        onSetupRow: "listSetupRow",
        components: [
          {
            kind: "Divider"
          }, {
            kind: "Item",
            className: "item",
            components: [
              {
                kind: "HFlexBox",
                components: [
                  {
                    name: "itemName",
                    flex: 1,
                    onclick: "viewTask"
                  }, {
                    name: "itemIndex",
                    className: "item-index"
                  }, {
                    kind: "DataCheckBox",
                    onChange: "checkboxClicked",
                    name: 'itemCheck'
                  }
                ]
              }, {
                name: "itemSubject",
                className: "item-subject"
              }
            ]
          }
        ]
      }, {
        name: "getTasks",
        kind: "WebService",
        url: "http://ec2-50-17-136-168.compute-1.amazonaws.com/tasks.json",
        handleAs: 'json',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Cookie': "_midnight_session=BAh7CEkiEF9jc3JmX3Rva2VuBjoGRUZJIjFKS3hvMVY1Ri84eG9SRkRGYlNNbEVCSlRWcUFhOG91R0Fmdm9GQ1V2R2tvPQY7AEZJIhl3YXJkZW4udXNlci51c2VyLmtleQY7AFRbCEkiCVVzZXIGOwBGWwZpA575HEkiCmR1bW15BjsARkkiD3Nlc3Npb25faWQGOwBGIiVhOGI1N2RlNDZlZjBmYjA2N2FiOGIwOWFjNzA0YmVhYg%3D%3D--db1cfdcfb86708d79a6b13d6ab9b16704f3e57ad"
        },
        onSuccess: "receiveTasks",
        onFailure: "failToReceiveTasks"
      }, {
        name: "sendTask",
        kind: "WebService",
        method: 'post',
        url: "http://ec2-50-17-136-168.compute-1.amazonaws.com/tasks.json",
        handleAs: 'json',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Cookie': "_midnight_session=BAh7CEkiEF9jc3JmX3Rva2VuBjoGRUZJIjFKS3hvMVY1Ri84eG9SRkRGYlNNbEVCSlRWcUFhOG91R0Fmdm9GQ1V2R2tvPQY7AEZJIhl3YXJkZW4udXNlci51c2VyLmtleQY7AFRbCEkiCVVzZXIGOwBGWwZpA575HEkiCmR1bW15BjsARkkiD3Nlc3Npb25faWQGOwBGIiVhOGI1N2RlNDZlZjBmYjA2N2FiOGIwOWFjNzA0YmVhYg%3D%3D--db1cfdcfb86708d79a6b13d6ab9b16704f3e57ad"
        }
      }
    ],
    viewTask: function(sender) {
      return enyo.windows.activate("TaskWindow", "task.html");
    },
    checkboxClicked: function(sender) {
      var index;
      index = sender.getIndex();
      this.data[index].status = sender.checked ? "Completed" : "Open";
      return this.$.list.reset();
    },
    listSetupRow: function(inSender, index) {
      var record;
      record = this.data[index];
      if (record) {
        this.setupDivider(index);
        this.$.itemIndex.setContent("");
        this.$.itemIndex.applyStyle("color", "#3A8BCB");
        this.$.itemIndex.applyStyle("font-size", "85%");
        this.$.itemCheck.setTaskID(record.id);
        this.$.itemCheck.setIndex(index);
        this.$.itemCheck.setChecked(record.status === "Completed");
        this.$.itemName.setContent(record.name);
        return true;
      }
    },
    setupDivider: function(index) {
      var group, _ref, _ref2;
      group = this.data[index].status;
      if (((_ref = this.data[index - 1]) != null ? _ref.status : void 0) !== group) {
        this.$.divider.setCaption(group);
        this.$.divider.canGenerate = Boolean(group);
        return this.$.item.applyStyle("border-top", (_ref2 = Boolean(group)) != null ? _ref2 : {
          "none": "1px solid silver;"
        });
      } else {
        return this.$.divider.hide();
      }
    },
    receiveTasks: function(sender, response) {
      enyo.scrim.hide();
      this.data = response;
      return this.$.list.refresh();
    },
    changeTitle: function() {
      enyo.scrim.show();
      return this.$.getTasks.call();
    }
  });
}).call(this);
