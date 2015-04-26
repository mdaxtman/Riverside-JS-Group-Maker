/*ChildNode polyfill*/
(function() {
  var buildDOM = function() {
    var nodes = Array.prototype.slice.call(arguments),
      frag = document.createDocumentFragment(),
      div, node;

    while(node = nodes.shift()){
      if(typeof node == "string") {
        div = document.createElement("div");
        div.innerHTML = node;
        while (div.firstChild){
          frag.appendChild(div.firstChild);
        }
      }else{
        frag.appendChild(node);
      }
    }
    return frag;
  };

  var proto = {
    before: function(){
      var frag = buildDOM.apply(this, arguments);
      this.parentNode.insertBefore(frag, this);
    },
    after: function(){
      var frag = buildDOM.apply(this, arguments);
      this.parentNode.insertBefore(frag, this.nextSibling);
    },
    replaceWith: function(){
      if(this.parentNode){
        var frag = buildDOM.apply(this, arguments);
        this.parentNode.replaceChild(frag, this);
      }
    },
    remove:function(){
      if(this.parentNode){
        this.parentNode.removeChild(this);
      }
    }
  };

  var a = ["Element", "DocumentType", "CharacterData"]; // interface
  var b = ["before", "after", "replaceWith", "remove"]; // methods
  a.forEach(function(v){
    b.forEach(function(func) {
      if(window[v]){
        if(window[v].prototype[func]) { return; }
        window[v].prototype[func] = proto[func];
      }
    });
  });
})();



var MVC = function(){
  var body;
  var d = document;
  this.stateLog = {};
  this.modelLog = {};
  this.viewLog = {};
  var self = this;
  this.update = function(obj){
    if(obj.model && obj.toView && obj.component){
      var currentModel = self.modelLog[obj.model];
      var currentView = self.viewLog[obj.toView];
      var componentList = d.getElementsByTagName('mvc-component');
      var component;
      if(typeof obj.fromView === 'undefined'){
        currentModel.elements.forEach(function(elem){
          elem.remove();
        });
        currentModel.elements = [];  
      }
      for(var i = 0; i < componentList.length; i++){
        if(obj.component === componentList[i].getAttribute('which')){
          component = componentList[i];
          break;
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
      //handle templating values in an array
      if(currentModel.type === 'array'){ 
        currentModel.data.forEach(function(value){
          var temp = d.createElement('div');
          temp.innerHTML = currentView;
          var addContent = temp.querySelectorAll('[mvc-render]');
          var addAttribute = temp.querySelectorAll('[mvc-attr]');
          var longer = addContent.length > addAttribute.length ? addContent.length : addAttribute.length;
          for(var i = 0; i < longer; i++){
            if(addAttribute[i]){
              var attr = addAttribute[i].getAttribute('mvc-attr').split('=');
              addAttribute[i].setAttribute(attr[0], eval(attr[1]));
              addAttribute[i].removeAttribute('mvc-attr');
            }
            if(addContent[i]){
              var content = addContent[i].getAttribute('mvc-render');
              addContent[i].innerHTML = eval(content);
              addContent[i].removeAttribute('mvc-render');
            }
          }
          // var elementArray = Array.prototype.slice.call(temp.children);
          // elementArray.forEach(function(element){
          //   component.insertAdjacentElement('afterbegin', element);
          // });
          while(temp.children.length > 0){
            currentModel.elements.push(temp.children[0]);
            component.parentElement.insertBefore(temp.children[0], component);
          }
        });
      }
    }else{
      throw 'you must define a model, toView and component';
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
        body = d.body.innerHTML;
      }else{
        d.body.innerHTML = body;
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
        var n = new MVC();
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
      if(typeof self.modelLog[name] === 'undefined'){
        self.modelLog[name] = {};  
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
        self.modelLog[name].elements = [];
      }else{
        this.destroy(name);
        this.construct(name, dataStructure);
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
        for(var i = 0; i < self.modelLog[name].elements.length; i++){
          self.modelLog[name].elements[i].remove();  
        }
        delete self.modelLog[name];
      }
    },
    get: function(name){
      if(self.modelLog[name]){
        return self.modelLog[name];
      }else{
        return null;
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
      var elem = d.getElementsByTagName('mvc')[0];
      var parentNode = elem.parentElement;
      var s = stateObject;
      var tempElement = d.createElement('div');
      
      tempElement.innerHTML = s.template;
      while(tempElement.children.length > 0){
        parentNode.insertBefore(tempElement.children[0], elem);  
      }
      elem.remove();
    }
  }; 
};

var mvc = new MVC();
