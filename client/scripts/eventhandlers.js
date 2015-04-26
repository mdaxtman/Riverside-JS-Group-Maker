sizeSelect.addEventListener('change', function(){
  if(mvc.model.get('rosterModel').data.length > 0){
    var numberOfGroups = Math.ceil(attending.length / this.value);
    groupModelConstructor(numberOfGroups);
    assignGroups(attending, this.value, null);
  }
    numberOfGroupsSelect.value = '';
});

numberOfGroupsSelect.addEventListener('change', function(){
  if(mvc.model.get('rosterModel').data.length > 0){
    groupModelConstructor(this.value);
    assignGroups(attending, null, this.value);
  }
    sizeSelect.value = '';
});

document.getElementById('name-button').addEventListener('click', function(){
  mvc.model.get('rosterModel').data.sort(sortByName);
  updateRosterModel(); 
});

document.getElementById('experience-button').addEventListener('click', function(){
  mvc.model.get('rosterModel').data.sort(sortBySkill);
  updateRosterModel();
});

document.getElementById('create').addEventListener('click', createGroupsOnClick);

