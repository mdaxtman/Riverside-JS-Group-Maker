// kgb.state.construct({
//   name: 'main', 
//   template: '<p>this is the main state</p> <kgb></kgb> ', 
//   path: '/main'
// });

// kgb.state.nest({
//   name: 'nested', 
//   template: '<p>this is the nested State <kgb></kgb></p>', 
//   path: '/child'
// }, 'main');

// kgb.state.nest({
//   name: 'deeper', 
//   template: '<a id="anchor" title="my tool tip" href="http://www.google.com">poop</a>', 
//   path: '/grandchild'
// }, 'nested');

// kgb.state.go('deeper');

var memberList,
  attending,
  groupList = {},
  d = document,
  apiCallCount = 0,
  RSVPList = {},
  sizeSelect = d.getElementById('group-size'),
  numberOfGroupsSelect = d.getElementById('group-quantity');

var configureModel = function(){
  apiCallCount++;
  if(apiCallCount >= 4){
  //filter the memberList and create new array with rsvp members
  //this is necessary because the RSVP list doesn't have the skill list
    attending = memberList.filter(function(obj){
      return RSVPList[obj.member_id] !== undefined;
    });

    attending.sort(sortBySkill);

    //create model reference in framework
    initializeApplication(attending);
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
  var bannerMeeting, script, ID, source, prevEventScript = d.getElementById('previous-events');

  if(data.results && data.results.length > 0){
    //adds event title
    bannerMeeting = d.getElementById('banner-meeting');
    bannerMeeting.innerText = data.results[0].name;
    
    //picks up event id for upcoming event and adds another script tag to obtain rsvps for that event
    ID = data.results[0].id;
    source = 'https://api.meetup.com/2/rsvps/?format=json&key=53e53186ab3be513c6e1a2d6b1e79&event_id='+ ID + '&sign=true&callback=rsvpData';
    
    script = d.createElement('script');
    script.setAttribute('src', source);
    d.body.appendChild(script);
    configureModel();
  }else if(!prevEventScript){
    prevEventScript = d.createElement('script');
    prevEventScript.setAttribute('src', "https://api.meetup.com/2/events/?format=json&key=53e53186ab3be513c6e1a2d6b1e79&sign=true&group_urlname=RiversideJS&status=past&desc=true&callback=eventData");
    prevEventScript.setAttribute('id', 'previous-events');
    d.body.appendChild(prevEventScript);
  }
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

