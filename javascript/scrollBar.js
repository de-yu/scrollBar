
var scroll_id = 0;

$.fn.scrollBar = function(allcontentname){
	
            
           scroll_id++;  //if you use many times in a page
           
	    $(allcontentname).append("<div id=scroll-"+scroll_id+"><div id=slider-"+scroll_id+"></div></div>");	
	
		var scroll = 0
			,now = $(this)
			,now_obj = $(allcontentname)
			,now_scroll = $('#scroll-'+ scroll_id)
			,now_slider = $('#slider-'+ scroll_id)
			,height_all = now.height()
			,height_scroll = now_obj.height()
			,slider_top = 0
                     ,draging = false
                     ,leave = true
                     ,last_obj_height = height_all;
                

		now_obj.css({
                    
			position:'relative',
			overflow:'hidden'
		});
		
		now_scroll.css({
			width:'7px',
			height:now_obj.height(),
			maxHeight:'100%',
	 		position:'absolute',
			right: '0px',
			top:'0px'
		});
		
		now_slider.css({
			position:'absolute',
			width:'7px',
			background:'#555',
			right:'0px',
			borderRadius:'15px',
			height:(height_scroll/height_all)*height_scroll+'px'
		});
              
		now_slider.hide();
		
		var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
		
		var  option = {
  			attributes:true,
			subtree: true
			} ;

		var observer = new MutationObserver(function(){
				height_all = now.height();
			 	height_scroll = now_scroll.height();
				
				// use now_slider.css('height',((height_scroll/height_all)*height_scroll)+'px') firfox crash	
		});
			
		observer.observe(document.querySelector(allcontentname) , option);
		
		setInterval(function()   // if content will change
                {
                    now_slider.css('height',((height_scroll/height_all)*height_scroll)+'px');
                    if(last_obj_height!=height_all)
                    {
                            //now_slider.show();
                            if(now_slider.height()>=now_obj.height())
                            {
                                now_slider.hide();
                                scroll = 0;
                                slider_top = 0;
                                now_obj.css({top : scroll});
                                now_slider.css({top: -slider_top});
                            }
                    }
              },16);
                        
		now_slider.draggable({
                    
			drag: function( event, ui ) 
			{
				ui.position.left = 0;
				ui.position.top = Math.max(0 , ui.position.top);
                                         
				if((ui.position.top + $(this).height())>now_scroll.height())
				{
					 ui.position.top = now_scroll.height() - $(this).height();
				}
                                         
				scroll =  -ui.position.top*height_all/height_scroll;					 
				now.css({top : scroll});
                            now_slider.show();
                            draging = true;        
                            
			}
                     ,stop:function(){
                         draging = false;
                         if(leave)
                         {
                            now_slider.hide('fast');
                         }
                     }   
		});


                
		now_obj.on('wheel', function(e){
                    

                    if(height_scroll < height_all)
                    {
                            if(e.originalEvent.deltaY<0)	
                            {
                               scroll = scroll + (scroll+200>0?-scroll:200);
                            }
                            else
                            {
                                scroll = scroll - 200;				
                                scroll = Math.max(scroll , -height_all + now_obj.height());
                            }

                            slider_top = height_scroll * scroll/height_all;


                            now.animate({top : scroll},{
                                    easing:'linear',
                                    duration:'fast',
                                    queue:false
                            });
                            
                            now_slider.animate({top: -slider_top},{
                                    easing:'linear',
                                    duration:'fast',
                                    queue:false
                            });

                            return false;
                }

		
    	});
       $(allcontentname).hover(function(){
           if(!(height_scroll > height_all))
           {
                now_slider.show('fast');
           }
           leave = false;
        },
        function(){
            if(!draging)
            {
                now_slider.hide('fast');
            }
            leave = true;
        });
};