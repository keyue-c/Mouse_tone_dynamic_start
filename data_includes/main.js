PennController.ResetPrefix(null)
DebugOff()
var showProgressBar = false;

Sequence("get_information","instruction", "experiment", SendResults(), "completion")

completionCode = [1,2].map(v=>Math.floor((1+Math.random())*0x10000).toString(16).substring(1)).join('-');

// Get demographic information
newTrial("get_information",
    defaultText
        .cssContainer({"margin-top":"1em"})
        .cssContainer({"margin-bottom":"1em"})
        .center()
        .print()
    ,
    newText("input_id", "实验ID")
    ,
    newTextInput("sub_id")
        .center()
        .size(200,25)
        .print()
        .wait(getTextInput("sub_id").test.text(/^[1-6][0-1][0-9]$/))
    ,
    newText("input_age", "年龄")
    ,
    newTextInput("sub_age")
        .center()
        .size(200,25)
        .print()
        .wait(getTextInput("sub_age").test.text(/^[1-2][0-9]$/))
    ,
    newText("input_sex", "性别")
    ,
    newTextInput("sub_sex")
        .center()
        .size(200,25)
        .print()
        .wait(getTextInput("sub_sex").test.text(/^[\u4e00-\u9fa5]+$/))
    ,
    newText("input_country", "您家乡所在省和市？")
    ,
    newTextInput("sub_country")
        .center()
        .size(200,25)
        .print()
        .wait(getTextInput("sub_country").test.text(/^[\u4e00-\u9fa5]+$/))
    ,
    newText("input_first_lang", "您的母语是什么？")
    ,
    newTextInput("sub_first_lang")
        .center()
        .size(200,25)
        .print()
        .wait(getTextInput("sub_first_lang").test.text(/^[\u4e00-\u9fa5]+$/))
    ,
    newText("input_other_lang", "您还掌握其他语言吗?")
    ,
    newTextInput("sub_other_lang")
        .center()
        .size(200,25)
        .print()
        .wait(getTextInput("sub_other_lang").test.text(/^[\u4e00-\u9fa5]+$/))
    ,
    newText("input_system", "您现在所使用的<b>电脑系统</b>是什么?")
    ,
    newTextInput("sub_system")
        .center()
        .size(200,25)
        .print()
        .wait(getTextInput("sub_system").test.text(/^(?!\s*$).+/))
    ,
    newText("input_browser", "您现在所使用的<b>浏览器</b>是什么?")
    ,
    newTextInput("sub_browser")
        .center()
        .size(200,25)
        .print()
        .wait(getTextInput("sub_browser").test.text(/^(?!\s*$).+/))
    ,
    newButton("continue", "请点击这里继续")
        .cssContainer({"margin-top":"2em"})
        .cssContainer({"margin-bottom":"10em"})
        .center()
        .print()
        .wait()
    ,
    newVar("id")
        .global()
        .set(getTextInput("sub_id"))
    ,  
    newVar("age")
        .global()
        .set(getTextInput("sub_age"))
    ,   
    newVar("sex")
        .global()
        .set(getTextInput("sub_sex"))
    ,
    newVar("country")
        .global()
        .set(getTextInput("sub_country"))
    ,
    newVar("first_lang")
        .global()
        .set(getTextInput("sub_first_lang"))
    ,
    newVar("other_lang")
        .global()
        .set(getTextInput("sub_other_lang"))
    ,
    newVar("system")
        .global()
        .set(getTextInput("sub_system"))
    ,
    newVar("browser")
        .global()
        .set(getTextInput("sub_browser"))
)
.log("id"           , getVar("id"))
.log("code"         , completionCode)
.log("age"          , getVar("age"))
.log("sex"          , getVar("sex"))
.log("country"      , getVar("country"))
.log("first_lang"   , getVar("first_lang"))
.log("other_lang"   , getVar("other_lang"))
.log("system"       , getVar("system"))
.log("browser"      , getVar("browser"))


// Instructions
newTrial("instruction",
    newHtml("instructions_word", "instructions.html")
        .center()
        .print()
    ,
    newImage("instructions_pic", "instruction_picture.jpg")
        .center()
        .print()
    ,
    newButton("continue", "请点击这里继续")
        .cssContainer({"margin-top":"2em"})
        .cssContainer({"margin-bottom":"10em"})
        .center()
        .print()
        .wait()
)

// Experiment
Template ("list1.csv", row => 
  newTrial("experiment",
    fullscreen()
    ,
    newTooltip("lateStartWarning", "点击按钮或启动鼠标太慢，请下次加快速度。")
    ,
    // All the images will have the same size: 250px*250px
    defaultImage.size(150,150)
    ,
    newCanvas("images", 1100, 700)  // 550px height: we will print the button at the bottom
        .color("white")             // Use a white background
        .add(  0 , 50, newImage("1", row.position1))
        .add(950 , 50, newImage("2", row.position2))
        .print("center at 50vw","top at 2em")
    ,
    newTimer("preview", 2000).start().wait()
    ,
    newVar("isLate", false)
    ,
    newTimer("lateStart", 1000).start()
    ,
    newVar("firstMove").global().set(f => Date.now())
    ,
    newButton("oneTrialStart", "播放")
        .print("center at 50%" , "bottom at 100%" , getCanvas("images"))
        .wait()
        .remove()
    ,
    // Start tracking mouse movements and clicks
    newMouseTracker("mouseFirst")
        .callback(getTimer("lateStart").test.ended().success(getVar("isLate").set(true)),
                // play the audio when the mouse moves
                newAudio("sentenceAudio", row.audio).play(),
                newVar("RT").global().set(v => Date.now()),
                getVar("firstMove").set(f => Date.now() - f),
                getMouseTracker("mouseFirst").stop())
        .start()
    ,
    newMouseTracker("mouse")
        .log()
        .start()
    ,
    // Make the images clickable
    newSelector("imageChoice")
        .add(getImage("1") , getImage("2"))
        .log("first")
        .wait()
    ,
    getVar("RT").set( v => Date.now() - v )
    ,
    // Stop the mouse tracker to avoid massive resuls files
    getMouseTracker("mouse").stop()
    ,
    // Make sure the sentences is done playing before proceeding
    getAudio("sentenceAudio").wait("first")
    ,
    getVar("isLate").test.is(true).success(
        getTooltip("lateStartWarning")
            .print( "center at 50%", "middle at 50%" , getCanvas("images"))
            .wait())
  )
  .log( "id"                   , getVar("id"))
  .log( "item"                 , row.item)
  .log( "condition"            , row.condition)
  .log( "numeral"              , row.numeral)
  .log( "same_different"       , row.same_different)
  .log( "target_position"      , row.target_position)
  .log( "first_move"           , getVar("firstMove")) // preview picture time
  .log( "RT"                   , getVar("RT")) // RT (time of first selection - time of audio play)
)

// show completion code
newTrial("completion", 
    newText("print_id", "<b>您的完成码是 "+completionCode+", 请填写问卷星获取实验报酬。</b>")
        .cssContainer({"margin-bottom":"2em"})
        .settings.css("font-size", "1.5em")
        .center()
        .print()
    ,
    newButton("void")
        .wait()
)