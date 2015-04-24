var sortBySkill = function(a, b){
  var left = parseInt(a.answers[0].answer); 
  var right = parseInt(b.answers[0].answer);
  if(isNaN(left)){
    left = 0;
  }
  if(isNaN(right)){
    right = 0;
  }
  if(right - left !== 0){
    return right - left;
  }else{
    return sortByName(a, b);
  }
};

var sortByName = function(a, b){
  if(a.name < b.name){
    return -1;
  }else if(a.name > b.name){
    return 1;
  }else{
    return 0;
  }
};

var groupModelConstructor = function(num){
  var model = [];
  for(var i = 1; i <= num; i++){
    var obj = {
      groupNumber: i,
      members : [],
    };
    model.push(obj);
  }
  kgb.model.construct('groupModel', model);
};

var assignGroups = function(attendModel, groupSize, numberOfGroups){
  var i, j, currentNumber, workFromFront, len = attendModel.length;
  if(groupSize){
    var size = 0;
    var number = 1;
    for(i = 0, j = len-1; i <= j; i++, j--){
      attendModel[i].groupNumber = number;
      size++;
      if(size === parseInt(groupSize)){
        j++;
      }else{
        attendModel[j].groupNumber = number;
        size++;
      }
      if(size === parseInt(groupSize)){
        number++;
        size = 0;
      }
    } 
  }else if(numberOfGroups){
    currentNumber = 1;
    workFromFront = true;
    i = 0;
    j = len - 1;
    while(i <= j){
      if(workFromFront){
        attendModel[i++].groupNumber = currentNumber++;
        if(currentNumber > parseInt(numberOfGroups)){
          currentNumber = 1;
          workFromFront = false;
        }
      }else{
        attendModel[j--].groupNumber = currentNumber++;
        if(currentNumber > parseInt(numberOfGroups)){
          currentNumber = 1;
          workFromFront = true;
        }
      }
    }
  }
};

var combineViews = function(){ 
  attending.forEach(function(member){
    if(!groupList['group-' + member.groupNumber]){
      groupList['group-' + member.groupNumber] = [];
    }
    groupList['group-' + member.groupNumber].push(member);
  });
   for(var prop in groupList){
      kgb.model.construct(prop, groupList[prop]);
      kgb.update({
        model: prop,
        toView: 'rosterView',
        component: prop
      });
   }
   kgb.model.update('rosterModel', []);
   updateRosterModel();
};

var updateRosterModel = function(){
  kgb.update({
      model: 'rosterModel',
      toView: 'rosterView',
      component: 'roster'
    });
};

var updateGroupModel = function(){
  kgb.update({
    model: 'groupModel',
    toView: 'groupsView',
    component: 'groups'
  });
};

var resetRosterOnClick = function(){
  var rosterModel = [];
  for(var key in groupList){
    var clone = groupList[key].slice();
    rosterModel =rosterModel.concat(clone);
  }
  groupList = {};
  rosterModel.sort(sortBySkill);
  kgb.model.update('rosterModel', rosterModel);
  kgb.model.construct('groupModel', []);
  this.removeEventListener('click', resetRosterOnClick);
  this.addEventListener('click', createGroupsOnClick);
  this.innerText = 'Create Groups';
  sizeSelect.value = '';
  numberOfGroupsSelect.value = '';
  updateGroupModel();
  updateRosterModel();
};
var createGroupsOnClick = function(){
  if(sizeSelect.value.length === 0 && numberOfGroupsSelect.value.length === 0){
    alert('please select number of groups or the group sizes you wish to create');
  }else{
    updateGroupModel();
    combineViews();
    this.removeEventListener('click', createGroupsOnClick);
    this.addEventListener('click', resetRosterOnClick);
    this.innerText = 'Reset Roster';
  }
};
