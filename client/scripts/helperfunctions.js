var helperFunctions = (function(){

  return {

    sortBySkill : function(a, b){
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
        return helperFunctions.sortByName(a, b);
      }
    },

    sortByName : function(a, b){
      if(a.name < b.name){
        return -1;
      }else if(a.name > b.name){
        return 1;
      }else{
        return 0;
      }
    },
    
    groupModelConstructor : function(num){
      var model = [];
      for(var i = 1; i <= num; i++){
        var obj = {
          groupNumber: i,
          members : [],
        };
        model.push(obj);
      }
      mvc.model.construct('groupModel', model);
    },
    
    assignGroups : function(attendModel, groupSize, numberOfGroups){
      var i, j, currentNumber, workFromFront, len = attendModel.length;
      if(groupSize){
        return this.assignGroups(attendModel, null, Math.ceil(len/groupSize));
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
    },

    combineViews : function(){ 
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
       this.updateRosterModel();
    },

    updateRosterModel : function(){
      mvc.update({
        model: 'rosterModel',
        toView: 'rosterView',
        component: 'roster'
      });
    },

    updateGroupModel : function(){
      mvc.update({
        model: 'groupModel',
        toView: 'groupsView',
        component: 'groups'
      });
    },

    resetRosterOnClick : function(){
      var rosterModel = [];
      for(var key in groupList){
        var clone = groupList[key].slice();
        rosterModel = rosterModel.concat(clone);
      }
      groupList = {};
      rosterModel.sort(this.sortBySkill);
      mvc.model.update('rosterModel', rosterModel);
      mvc.model.update('groupModel', []);
      this.removeEventListener('click', groupMaker.resetRosterOnClick);
      this.addEventListener('click', groupMaker.createGroupsOnClick);
      this.innerText = 'Create Groups';
      sizeSelect.removeAttribute('disabled');
      numberOfGroupsSelect.removeAttribute('disabled');
      sizeSelect.value = '';
      numberOfGroupsSelect.value = '';
      groupMaker.updateGroupModel();
      groupMaker.updateRosterModel();
    },
  
    createGroupsOnClick : function(){
      if(sizeSelect.value.length === 0 && numberOfGroupsSelect.value.length === 0){
        alert('please select number of groups or the group sizes you wish to create');
      }else{
        groupMaker.updateGroupModel();
        groupMaker.combineViews();
        this.removeEventListener('click', groupMaker.createGroupsOnClick);
        this.addEventListener('click', groupMaker.resetRosterOnClick);
        this.innerText = 'Reset Roster';
        sizeSelect.setAttribute('disabled', 'true');
        numberOfGroupsSelect.setAttribute('disabled', 'true');
      }
    }
  };

})();
