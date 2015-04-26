// mvc.state.construct({
//   name: 'main', 
//   template: '<p>this is the main state</p> <mvc></mvc> ', 
//   path: '/main'
// });

// mvc.state.nest({
//   name: 'nested', 
//   template: '<p>this is the nested State <mvc></mvc></p>', 
//   path: '/child'
// }, 'main');

// mvc.state.nest({
//   name: 'deeper', 
//   template: '<a id="anchor" title="my tool tip" href="http://www.google.com">poop</a>', 
//   path: '/grandchild'
// }, 'nested');

// mvc.state.go('deeper');
var apiCallCount = 0, RSVPList = {}, memberList, attending,
    d = document, groupList = {};  

var apis = (function(){
  return {

    config : function(){
      apiCallCount++;
      if(apiCallCount >= 4){
      //filter the memberList and create new array with rsvp members
      //this is necessary because the RSVP list doesn't have the skill list
        attending = memberList.filter(function(obj){
          return RSVPList[obj.member_id] !== undefined;
        });
        attending.sort(this.sortBySkill);

        //create model reference in framework
        this.initializeApplication(attending);
      }
    },

    //jsonp callbacks
    groupData : function(results){
      //adds group image to banner and adds the name of the group
      var bannerImg, bannerHeadline;
      bannerImg = d.getElementById('banner-img');
      bannerImg.setAttribute('src', results.data.group_photo.highres_link);
      
      bannerHeadline = d.getElementById('banner-headline');
      bannerHeadline.innerText = results.data.name;
      this.config();  
    },

    eventData : function(data){
      var bannerMeeting, script, ID, source, prevEventScript = d.getElementById('previous-events');

      if(data.results && data.results.length > 0){
        //adds event title
        bannerMeeting = d.getElementById('banner-meeting');
        bannerMeeting.innerText = data.results[0].name;
        
        //picks up event id for upcoming event and adds another script tag to obtain rsvps for that event
        ID = data.results[0].id;
        source = 'https://api.meetup.com/2/rsvps/?format=json&key=53e53186ab3be513c6e1a2d6b1e79&event_id='+ ID + '&sign=true&callback=groupMaker.rsvpData';
        
        script = d.createElement('script');
        script.setAttribute('src', source);
        d.body.appendChild(script);
        this.config();
      }else if(!prevEventScript){
        prevEventScript = d.createElement('script');
        prevEventScript.setAttribute('src', "https://api.meetup.com/2/events/?format=json&key=53e53186ab3be513c6e1a2d6b1e79&sign=true&group_urlname=RiversideJS&status=past&desc=true&callback=groupMaker.eventData");
        prevEventScript.setAttribute('id', 'previous-events');
        d.body.appendChild(prevEventScript);
      }
    },

    memberData : function(data){
      //retreives the full list of 200 most recently visiting members to the page
      memberList = data.results;
      this.config();
    },

    rsvpData : function(data){
      //retreives all rsvps for a particular event
      data.results.forEach(function(obj){
        RSVPList[obj.member.member_id] = obj.member.name; 
      });
      this.config();
    }
  };



})();
