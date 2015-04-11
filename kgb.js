var KGB = function(){
  var body;
  var w = window;
  this.stateLog = {};
  this.modelLog = {};
  this.viewLog = {};
  var self = this;
  this.insert = function(obj){
    if(obj.model && obj.view && obj.component){
      var currentModel = self.modelLog[obj.model];
      var currentView = self.viewLog[obj.view];
      var componentList = document.getElementsByTagName('kgb-component');
      var component;
      for(var i = 0; i < componentList.length; i++){
        if(obj.component === componentList[i].getAttribute('which')){
          component = componentList[i];
        }
      }
      if(!currentModel){
        throw 'please provide reference to an existing model';
      }
      if(!currentView){
        throw 'please provide reference to an existing view';
      }
      if(!component){
        throw 'please provide reference to an existing component';
      }
      if(currentModel.type === 'array'){ 
        currentModel.data.forEach(function(value){
          var temp = document.createElement('div');
          temp.innerHTML = currentView;
          var addContent = temp.querySelectorAll('[kgb-render]');
          var addAttribute = temp.querySelectorAll('[kgb-attr]');
          var longer = addContent.length > addAttribute.length ? addContent.length : addAttribute.length;
          for(var i = 0; i < longer; i++){
            if(addAttribute[i]){
              var attr = addAttribute[i].getAttribute('kgb-attr').split('=');
              addAttribute[i].setAttribute(attr[0], eval(attr[1]));
              addAttribute[i].removeAttribute('kgb-attr');
            }
            if(addContent[i]){
              var content = addContent[i].getAttribute('kgb-render');
              addContent[i].innerHTML = eval(content);
              addContent[i].removeAttribute('kgb-render');
            }
          }
          console.log(component.parentElement);
          while(temp.children.length > 0){
            component.parentElement.insertBefore(temp.children[0], component);
          }
        });
      }
  /*
      insert model values into elements
  */
    }else{
      throw 'you must define a model, view and component';
    }
  };
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
        self.view.stateTemplate(currentState);
        while(children.length > 0){
          child = children.pop();
          w.location.hash = w.location.hash + child.path;
          self.view.stateTemplate(child);
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
    construct: function(name, viewString){
      if(!self.viewLog[name]){
        self.viewLog[name] = viewString;
      }else{
        throw 'view already exists, use the view.update method';
      }
    },
    update: function(name, viewString){
      if(self.viewLog[name]){
        this.destroy(name);
        this.construct(name, viewString);
      }else{
        throw 'view does not exist, please provide reference to an existing view';
      }
    },
    destroy: function(name){
      if(self.viewLog[name]){
        delete self.viewLog[name];
      }
    },
    stateTemplate : function(stateObject){
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
