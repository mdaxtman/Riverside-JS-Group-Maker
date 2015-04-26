var sizeSelect = d.getElementById('group-size'),
  numberOfGroupsSelect = d.getElementById('group-quantity');

sizeSelect.addEventListener('change', function(){
  if(mvc.model.get('rosterModel').data.length > 0){
    var numberOfGroups = Math.ceil(attending.length / this.value);
    groupMaker.groupModelConstructor(numberOfGroups);
    groupMaker.assignGroups(attending, this.value, null);
  }
    numberOfGroupsSelect.value = '';
});

numberOfGroupsSelect.addEventListener('change', function(){
  if(mvc.model.get('rosterModel').data.length > 0){
    groupMaker.groupModelConstructor(this.value);
    groupMaker.assignGroups(attending, null, this.value);
  }
    sizeSelect.value = '';
});

document.getElementById('name-button').addEventListener('click', function(){
  Array.prototype.sort.call(mvc.model.get('rosterModel').data, groupMaker.sortByName);
  groupMaker.updateRosterModel(); 
});

document.getElementById('experience-button').addEventListener('click', function(){
  console.log(mvc.model.get('rosterModel'));
  Array.prototype.sort.call(mvc.model.get('rosterModel').data, groupMaker.sortBySkill);
  groupMaker.updateRosterModel();
});

document.getElementById('create').addEventListener('click', groupMaker.createGroupsOnClick);

