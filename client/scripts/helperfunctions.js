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
  mvc.model.construct('groupModel', model);
};

var assignGroups = function(attendModel, groupSize, numberOfGroups){
  var i, j, currentNumber, workFromFront, len = attendModel.length;
  if(groupSize){
    return assignGroups(attendModel, null, Math.ceil(len/groupSize));
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
      mvc.model.construct(prop, groupList[prop]);
      mvc.update({
        model: prop,
        toView: 'rosterView',
        component: prop
      });
   }
   mvc.model.update('rosterModel', []);
   updateRosterModel();
};

var updateRosterModel = function(){
  mvc.update({
      model: 'rosterModel',
      toView: 'rosterView',
      component: 'roster'
    });
};

var updateGroupModel = function(){
  mvc.update({
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
  mvc.model.update('rosterModel', rosterModel);
  mvc.model.construct('groupModel', []);
  this.removeEventListener('click', resetRosterOnClick);
  this.addEventListener('click', createGroupsOnClick);
  this.innerText = 'Create Groups';
  sizeSelect.removeAttribute('disabled');
  numberOfGroupsSelect.removeAttribute('disabled');
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
    sizeSelect.setAttribute('disabled', 'true');
    numberOfGroupsSelect.setAttribute('disabled', 'true');
  }
};
