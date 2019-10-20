/*
模块声明:
    名称: one-media
    作者: oneday
    时间: 2019.10.20
    注: 请不要删除此消息,尊重一下作者的劳动成功,感谢!
*/


/* 
使用说明: 
    必须调用build方法传入相关参数后返回一个Behavior,使用的页面注册当前behavior即可
参数说明(Object):
    *src(String): 播放的链接地址
    *duration(Number): 音频的总时长
    global(Boolean): 是否获取全局媒体对象
    autoStop(Boolean): 当组件被移除时是否停止音频播放  默认自动停止播放
    title(String): 当前音频标题仅global为true时有效 默认使用src
    自动注册的全局方法:
        mediaPlay 开始音频播放
        mediaPause 暂停音频播放
        mediaSeek 跳转相应的进度
            time 具体进度值
        getCurrentTime 获取当前播放的时间
        getMediaProgress 获取当前整体播放进度 0-1之间
        bindMediaEvent 
            type 事件类型 play pause update end
            ...callback 可以接任意触发函数 触发以队列方式执行
        getMediaSrc 获取当前播放链接
        _getCurrentMediaManager 获取当前播放引擎    

返回值说明(Behavior): 可以直接用于小程序
*/


/* 初始化函数 */
function initMediaManager(options){
    if (options.bool) options.mediaProxy.mediaManager = wx.getBackgroundmediaManager();
    else options.mediaProxy.mediaManager = wx.createInnerAudioContext();
    options.mediaProxy.mediaManager.onError(err=> console.error(err));
    options.mediaProxy.mediaManager.src = options.src;
    options.mediaProxy.src = options.src;
    if(options.bool)options.mediaProxy.title = options.title;
}

exports.build = function(options = {global: false,duration: -1,autoStop: true}){
    if(!options.src || !options.duration)throw new Error("请检查参数是否有误");
    let mediaProxy = {
        mediaManager: null,
        src: "",
        isEnd: false
    };
    let queues = {
        playFns: [
            function(){
                mediaProxy.isEnd = false;
            }
        ],
        pauseFns: [],
        updateFns: [],
        endFns: [
            function(){
                mediaProxy.isEnd = true;
            }
        ]
    };
    return Behavior({
        detached(){
            if(options.autoStop && (options.global == false))mediaProxy.mediaManager.stop();
        },
        methods: {
            mediaPlay(){
                if(mediaProxy.mediaManager == null) {
                    initMediaManager({
                        mediaProxy,
                        src: options.src,
                        global: options.global,
                        title: options.title || options.src
                    });
                    mediaProxy.mediaManager.onPlay(() => queues.playFns.forEach(fn=>fn(mediaProxy.mediaManager)));
                    mediaProxy.mediaManager.onPause(() => queues.pauseFns.forEach(fn=>fn(mediaProxy.mediaManager)));
                    mediaProxy.mediaManager.onTimeUpdate(() => queues.updateFns.forEach(fn=>fn(mediaProxy.mediaManager)));
                    mediaProxy.mediaManager.onEnded(() => queues.endFns.forEach(fn=>fn(mediaProxy.mediaManager)));
                }
                mediaProxy.mediaManager.play();
            },
            mediaPause(){
                if(mediaProxy.mediaManager == null)return console.warn("请至少播放过一次音频后再进行操作");
                mediaProxy.mediaManager.pause();
            },
            mediaSeek(time){
                if(time > options.duration)return console.warn("非法操作");
                mediaProxy.mediaManager.seek(time);
            },
            getCurrentTime(){
                if(mediaProxy.mediaManager == null)return 0;
                return mediaProxy.mediaManager.currentTime;
            },
            getMediaProgress(){
                if(mediaProxy.mediaManager == null)return 0;
                if(mediaProxy.isEnd)return 1;
                if(this.getCurrentTime() - options.duration > 0.1)console.warn("当前时间发生异常,请检查duration是否正确");
                return new Number((this.getCurrentTime() / options.duration)).toFixed(2) * 1;
            },
            bindMediaEvent(type,...callbacks){
                if(["play","pause","update","end"].indexOf === -1)return console.warn("当前绑定的事件类型不存在");
                callbacks.forEach(callback=>{
                    if(typeof(callback) == "function"){
                        queues[type + "Fns"].push(callback);
                    }else{
                        console.error("请检查是否传入了错误的事件类型");
                    }
                })
            },
            getMediaSrc(){
                return mediaProxy.src;
            },
            _getCurrentMediaManager(){
                return mediaProxy.mediaManager;
            }
        }
    })
}