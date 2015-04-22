function initializeApplication (){
  kgb.model.construct('rosterModel', attending);
  kgb.view.construct('groupsView', 
    '<div class="col-md-3">'+
      '<div class="panel panel-default">'+        
        '<div class="panel-heading">'+          
          '<div class="panel-title" kgb-render="\'Group \' + value.groupNumber">'+
          '</div>'+
        '</div>'+
        '<div class="panel-body">'+
          '<kgb-component kgb-attr="which=\'group-\' + value.groupNumber"></kgb-component>'+
        '</div>'+
      '</div>'+
    '</div>'
    );
  kgb.view.construct('rosterView', 
  '<li class="list-group-item names" kgb-attr="title=value.bio || \'I did not bother writing a bio\'">'+ 
    '<p class="text-center">'+
      '<img class="thumbnail-photo pull-left" kgb-attr="src=value.photo.thumb_link">'+
      '<a kgb-attr="href=value.profile_url" target="_blank" kgb-render="value.name" class="name-tag">'+
      '</a>'+ 
      '<span kgb-render="parseInt(value.answers[0].answer) || 0" class="badge pull-right alert-info">'+
      '</span>'+
    '</p>'+
  '</li>'
  );
  kgb.update({
    model: 'rosterModel',
    toView: 'rosterView',
    component: 'roster'
  });
}

