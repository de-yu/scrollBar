
function ScrollBar(selector)
{
    var content = document.getElementById(selector.content);
    var scrollAndContent = document.getElementById(selector.scrollAndContent);
    var scroll = document.getElementById(selector.scroll);
    var slider =  document.getElementById(selector.slider);
    
    var sliderPosTop = 0;
    var contentPosTop = 0;
    var draging = false;
    var inRange = false;
    var animationId = 0;
    
    var cssStyle = {
            scroll:{
            background: 'rgba(200,200,200,0.8)',
            "border-radius": '15px',
            width: '7px',
            height: getHeight(scrollAndContent) + "px",
            maxHeight: '100%',
            position:'absolute',
            right:'0px',
            top:'0px'
        }, slider:{
            position:'absolute',
            width:'7px',
            background:'#555',
            right:'0px',
            "border-radius":'15px',
            height: sliderHeight() + 'px'
        }}
    

    setCss(scroll , cssStyle.scroll);
    setCss(slider , cssStyle.slider);    
    
    windowSizeChange();
    childChange();
    touchEvent();
    dragEvent();
    wheelEvent();
    
    function getHeight(element)
    {
        var style = window.getComputedStyle(element);
        var height = style.getPropertyValue("height");
        height = height.match(/[-0-9]+/);
        return parseInt(height);
    }
    
    function setCss(element , css)
    {
          var elementCss = element.getAttribute("style");
          var oldCss , newCss = {};
          if(elementCss!=null)
          {
            oldCss = elementCss.split(";");
            for(var i=0;i<oldCss.length-1;i++)
            {           
                oldCss[i] = oldCss[i].trim();
                var a = oldCss[i].replace(":" ,"\":\"");
                a = "{\""+ a +"\"}";
                var b = JSON.parse(a);
                for(var key in b)
                {
                    newCss[key] = b[key];
                }
            }
          }
            var cssString = "";
            for (var name in css)
            {
               newCss[name] =  css[name];
            }
            for (var name in newCss)
            {
               cssString = cssString  + name + ":" + newCss[name]+";";
            }
            element.setAttribute("style",  cssString);
    }
    function sliderHeight()
    {
        var contentHeight = getHeight(content);
        var scroll = getHeight(scrollAndContent);
        return parseInt((scroll/contentHeight)*scroll);
    }
    function contentTopAndSliderTopChange(topValue)
    {
        setCss(content , {top:topValue + "px"});
        setCss(slider , {top: -getHeight(scroll)*topValue/getHeight(content) + "px"});
    }
    function contentTopAndSliderTopAnimation(state , newContentPosTop)
    {
        animationId = window.requestAnimationFrame(animation);
        var move = (newContentPosTop- contentPosTop)/20;
        function animation()
        {
            if(state > 0)
            {
                contentPosTop = contentPosTop + move;

                if(contentPosTop >= newContentPosTop)
                {
                   contentTopAndSliderTopChange(newContentPosTop);   
                   animationId = window.cancelAnimationFrame(animationId);
                }
                else{
                    contentTopAndSliderTopChange(contentPosTop);
                    animationId = window.requestAnimationFrame(animation);
                }
            }
            else if(state < 0)
            {
                contentPosTop += move;

                if(contentPosTop <= newContentPosTop)
                {
                   contentTopAndSliderTopChange(newContentPosTop);  
                   animationId = window.cancelAnimationFrame(animationId);
                }
                else{
                    contentTopAndSliderTopChange(contentPosTop);
                    animationId = window.requestAnimationFrame(animation);
                }
            }
        }
    }
    function limit(value , min , max)
    {
        if(value < min)
           value = min;
       if(value > max)
           value = max;
       return value;
    }
    function selectProhibit(prohibit)
    {
        if(prohibit == true)
        {
            document.onselectstart = function() { return false; };
            document.body.style.MozUserSelect = 'none';
        }
        else if(prohibit == false)
        {
            document.onselectstart = null;
            document.body.style.MozUserSelect = '';
        }
    }
    function showState(state)
    {
        if(state == 0)
        {
            scroll.style.visibility = "hidden";
            slider.style.visibility = "hidden";
        }
        else
        {
            scroll.style.visibility = "visible";
            slider.style.visibility = "visible"; 
        }
    }
    function windowSizeChange()
    {
        window.addEventListener("resize" , function(){

            setCss(slider , {height:sliderHeight() + "px"});
            setCss(scroll , {height: getHeight(scrollAndContent) + "px"})
             contentTopAndSliderTopChange(contentPosTop);
             if (getHeight(content) <= getHeight(scrollAndContent))
             {
                 contentTopAndSliderTopChange(0);
                 showState(0);
             }else
             {
                 showState(1);
             }
        });
        

    }
    function childChange()
    {
        var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
        var MutationObserverConfig = {
            childList: true,
            subtree: true,
            characterData: true
        };
        var observer = new MutationObserver(function (mutations) {
            
            setCss(slider , {height:sliderHeight() + "px"});
            contentTopAndSliderTopChange(contentPosTop);
            
            if (getHeight(content) <= getHeight(scrollAndContent))
            {
                contentTopAndSliderTopChange(0);
                showState(0);
            }else
            {
                showState(1);
            }
        });
        observer.observe(content, MutationObserverConfig);
    }
    
    function touchEvent()
    {
        var touchScreen = scrollAndContent;
        var startY = 0;
        var changeY = 0 , oldChangeY = 0;
        
       var touchStartEvent = function(event) {
            event.preventDefault();
            var touch = event.touches[0];
            startY = touch.pageY;

        }
        var touchMoveEvent = function(event)
        {
            event.preventDefault();
            var touch = event.touches[0];
            changeY = touch.pageY - startY;
            contentPosTop = contentPosTop + changeY - oldChangeY;
            oldChangeY = changeY;
  
            contentPosTop = limit(contentPosTop , getHeight(scrollAndContent) - getHeight(content) , 0);   
            contentTopAndSliderTopChange(contentPosTop);
        }
        var touchEndEvent = function(event) {
            event.preventDefault();
            startY = changeY = oldChangeY = 0;
        }
        
        touchScreen.addEventListener("touchstart", touchStartEvent, false);
        touchScreen.addEventListener("touchmove", touchMoveEvent, false);
        touchScreen.addEventListener("touchend", touchEndEvent, false);
    }
    function dragEvent()
    {
        var drag = new Drag(slider);

        drag.Draggable.create({axis: "y"
            ,start:function(ui)
            {                
                selectProhibit(true);
            }
            ,drag: function (ui)
            {       

                if (ui.top() <= 0)
                {
                    ui.top(0);
                }
                if (ui.top() + getHeight(slider) > getHeight(scroll))
                {
                    ui.top(getHeight(scroll) - getHeight(slider));
                }
                contentPosTop = -ui.top() * getHeight(content) / getHeight(scroll);

                setCss(content , {top: contentPosTop + "px"});
               // now_slider.show();
                draging = true;
                
            }
            , end: function () {
                draging = false;
                /*if (leave)
                {
                    now_slider.hide('fast');
                    now_scroll.hide('fast');
                }*/
                selectProhibit(false);
            }
        });
    }
    function wheelEvent()
    {       
        scrollAndContent.addEventListener('wheel', function (e) {


            if (getHeight(scrollAndContent) < getHeight(content))
            {
                var newContentPosTop = contentPosTop
                        ,newSliderPosTop = sliderPosTop
                            ,state = 0;
                if (e.deltaY < 0)
                {
                    newContentPosTop = newContentPosTop + (newContentPosTop + 200 > 0 ? -newContentPosTop : 200);
                    state = 1;
                } else
                {
                    newContentPosTop = newContentPosTop - 200;
                    newContentPosTop = Math.max(newContentPosTop, -getHeight(content) + getHeight(scrollAndContent));
                    state = -1;
                }
                
                contentTopAndSliderTopAnimation(state , newContentPosTop);                      
                return false;
            }
        });
    }
}
ScrollBar.prototype.setScrollTop = function(top)
{
    
};
function Drag(element) {

    (function (Draggable) {

        var x = 0 , y = 0;
        var move_x = 0, move_y = 0;
        var moving = false;
        var start_x = 0, start_y = 0;

        var style = window.getComputedStyle(element);
       
        var features = {
            start: function (ui) {},
            drag: function (ui) {},
            end: function (ui) {},
            axis: "s"
        };

        var ui = {
            regex: /[-0-9]*/ 
            
            ,regexValue:function(value)
            {
                value = value.match(ui.regex);
                if(value == "")
                    return 0;
                return parseInt(value);
            }
            ,top: function (val) {
                
                
                if (val === undefined)
                {
                    var t = style.getPropertyValue('top').toString();                   
                    return  ui.regexValue(t);
                }
                element.style.top = val + "px";
            }
            ,left: function (val) {
                
                if (val === undefined)
                {
                    var t = style.getPropertyValue('left').toString();                 
                    return  ui.regexValue(t);                   
                }
                element.style.left = val + "px";
            }
        };

        Draggable.create = function (func)
        {
            extend();

            element.addEventListener("mousedown", function (event) {

                x = event.clientX;
                y = event.clientY;
                start_x = ui.left();
                start_y = ui.top();
                moving = true;
                features.start(ui);

            });

            element.addEventListener("mousemove", function (event) {
                if (moving) {
                    moveValue(event);
                    move();
                    features.drag(ui);
                }
            });
            window.addEventListener("mousemove", function (event) {
                if (moving) {
                    moveValue(event);
                    move();
                    features.drag(ui);
                }
            });
            element.addEventListener("mouseup", function (event) {
                features.end(ui);
                moving = false;
            });
            window.addEventListener("mouseup", function (event) {
                features.end(ui);
                moving = false;
            });

            function moveValue(event)
            {
                move_x = event.clientX;
                move_y = event.clientY;

                move_x = move_x - x + start_x;
                move_y = move_y - y + start_y;
            }

            function move()
            {
                if(features.axis=="y" || features.axis=="s") 
                   ui.top(move_y);
                if(features.axis=="x" || features.axis=="s")
                   ui.left(move_x);
            }
            function extend()
            {
                for (var key in func)
                {
                    features[key] = func[key];
                }
            }
        }
    }(this.Draggable = {}))
};