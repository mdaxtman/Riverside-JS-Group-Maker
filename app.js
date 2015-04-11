kgb.state.construct({
  name: 'main', 
  template: '<p>this is the main state</p> <kgb></kgb> ', 
  path: '/main'
});

kgb.state.nest({
  name: 'nested', 
  template: '<p>this is the nested State <kgb></kgb></p>', 
  path: '/child'
}, 'main');

kgb.state.nest({
  name: 'deeper', 
  template: '<a id="anchor" title="my tool tip" href="http://www.google.com">poop</a>', 
  path: '/grandchild'
}, 'nested');

kgb.state.go('deeper');

var memberList,
  w = window,
  d = document,
  apiCallCount = 0,
  RSVPList = {};

var configureModel = function(){
  apiCallCount++;
  if(apiCallCount >= 4){
  //filter the memberList and create new array with rsvp members
  //this is necessary because the RSVP list doesn't have the skill list
    var attending = memberList.filter(function(obj){
      return RSVPList[obj.member_id] !== undefined;
    });

    //create model reference in framework
    kgb.model.construct('rosterModel', attending);
    kgb.view.construct('rosterView', 
    '<li class="list-group-item">'+ 
      '<p class="text-center">'+
        '<img class="thumbnail-photo pull-left" kgb-attr="src=value.photo.thumb_link">'+
        '<span kgb-render="value.name" class="name-tag">'+
        '</span>'+ 
        '<span kgb-render="parseInt(value.answers[0].answer)" class="badge pull-right alert-info">'+
        '</span>'+
      '</p>'+
    '</li>'
    );
    kgb.insert({
      model: 'rosterModel',
      view: 'rosterView',
      component: 'roster'
    });
  }
};


//jsonp callbacks
var groupData = function(results){
  //adds group image to banner and adds the name of the group
  var bannerImg, bannerHeadline;
  bannerImg = d.getElementById('banner-img');
  bannerImg.setAttribute('src', results.data.group_photo.highres_link);
  
  bannerHeadline = d.getElementById('banner-headline');
  bannerHeadline.innerText = results.data.name;
  configureModel();  
};

var eventData = function(data){
  var bannerMeeting, script, ID, source;
  
  //adds event title
  bannerMeeting = d.getElementById('banner-meeting');
  bannerMeeting.innerText = data.results[0].name;

  //picks up event id for upcomping event and adds another script tag to obtain rsvps for that event
  script = d.createElement('script');
  ID = data.results[0].id;
  source = 'https://api.meetup.com/2/rsvps/?format=json&key=53e53186ab3be513c6e1a2d6b1e79&event_id='+ ID + '&sign=true&callback=rsvpData';
  script.setAttribute('src', source);
  d.body.appendChild(script);
  configureModel();
};

var memberData = function(data){
  //retreives the full list of 200 most recently visiting members to the page
  memberList = data.results;
  configureModel();
};

var rsvpData = function(data){
  //retreives all rsvps for a particular event
  data.results.forEach(function(obj){
    RSVPList[obj.member.member_id] = obj.member.name; 
  });
  configureModel();
};

