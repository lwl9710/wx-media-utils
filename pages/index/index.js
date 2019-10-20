const MediaFactory = require("../../utils/wx/MediaFactory");
Component({
    behaviors: [
        MediaFactory.build({
            global: false,
            src: "" /* Enter a media src. */,
            duration: 0 /* Enter media duration. */
        })
    ],
    data: {
        message: "Please click button start.",
        time: 0
    },
    lifetimes: {
        ready(){
            this.bindMediaEvent("play",()=>{
                console.log("Media start.");
            })
            this.bindMediaEvent("update",()=>{
                this.setData({
                    time: this.getCurrentTime()
                })
            })
            this.bindMediaEvent("pause",()=>{
                console.log("media stop.");
            })
        }
    },
    methods: {
        seekProgress(){
            this.mediaSeek(this.getCurrentTime() + 10);
        },
    }
})