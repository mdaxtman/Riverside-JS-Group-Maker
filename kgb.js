var KGB = function(){
  var body;
  var w = window;
  this.stateLog = {};
  this.modelLog = {};
  var self = this;
  this.state = {
    construct: function(stateParams){
      if(Object.prototype.toString.apply(stateParams) === '[object Object]'){
        if(stateParams.name && stateParams.path){
          var clone = {};
          for (var prop in stateParams){
            if(prop !== name){
              clone[prop] = stateParams[prop];
            }
          }
          self.stateLog[stateParams.name] = clone;
          return stateParams; 
        }else{
          throw 'must include a named state and path';
        }
      }
    },
    listStates: function(){
      var stateList = [];
      var kids = [];
      for (var prop in self.stateLog){
        stateList.push(self.stateLog[prop]);
        if(self.stateLog[prop].children){
          kids = kids.concat(self.stateLog[prop].children);
        }
      }
      if(kids.length > 0){
        return stateList.concat(kids.reduce(function(p, c){
          return p.concat(c.state.listStates());
        }, []));
      }else{
        return stateList;
      }
    },
    go: function(stateName, children){
      if(body === undefined){
        body = document.body.innerHTML;
      }else{
        document.body.innerHTML = body;
      }
      var currentState;
      var list = self.state.listStates();
      var child;
      children = typeof children === 'undefined' ? [] : children;  
      currentState = list.filter(function(val){
        return val.name === stateName;
      }).reduce(function(prev, curr){
        return curr;
      });
      if(currentState.parent){
        children.push(currentState);
        self.state.go(currentState.parent, children);
      }else{
        w.location.hash = currentState.path;
        self.view.insertTemplate(currentState);
        while(children.length > 0){
          child = children.pop();
          w.location.hash = w.location.hash + child.path;
          self.view.insertTemplate(child);
        }
      }
    },
    nest: function(stateParams, to){
      var stateList = self.state.listStates();
      var toState;
      var isState = stateList.some(function(val){
        toState = val;
        return val.name === to;
      });
      if(isState){
        toState.children = typeof toState.children === 'undefined' ? [] : toState.children; 
        var n = new KGB();
        stateParams.parent = to;
        n.state.construct(stateParams);
        toState.children.push(n);
      }else{
        throw 'must supply a state to nest to';
      }
    },
    reload: function(){}
  };
  this.model = {
    construct : function(name, dataStructure){
      var type,
        log;
      if(self.modelLog[name] === undefined){
        self.modelLog[name] = {}; 
        // self.modelLog[name] = {}; 
        if(typeof dataStructure ==='string'){
          type = 'string';
        }else if(Array.isArray(dataStructure)){
          type = 'array';
        }else if(Object.prototype.toString.apply(dataStructure) === '[object Object]'){
          type = 'object';
        }else if(typeof dataStructure === 'number'){
          type = 'number';
        }else{
          throw 'must provide data that is an array, object, string or integer';
        }
        self.modelLog[name].data = dataStructure;
        self.modelLog[name].type = type;
      }else{
        throw 'model already exists, use the model.update method';
      }
    },
    update : function(name, dataStructure){
      var log = self.modelLog[name];
      if(log){
        this.destroy(name);
        this.construct(name, dataStructure);
      }else{
        throw 'model does not exist, provide reference to an existing model';
      }
    },
    destroy : function(name){
      if(self.modelLog[name]){
        delete self.modelLog[name];
      }
    }

  };
  this.view = {
    insertTemplate : function(stateObject){
      var elem = document.getElementsByTagName('kgb')[0];
      var parentNode = elem.parentElement;
      var s = stateObject;
      var tempElement = document.createElement('div');
      
      tempElement.innerHTML = s.template;
      while(tempElement.children.length > 0){
        parentNode.insertBefore(tempElement.children[0], elem);  
      }
      elem.remove();
    }
  }; 
};

var kgb = new KGB();
