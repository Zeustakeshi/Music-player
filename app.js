
const PLAYER_STORAGE_KEY = 'MUSIC_PLAYER'
const API = 'http://localhost:3000/songs'
const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)
const cdThumb = $(".cd-thumb")
const header = $("header>h2")
const audio = $("#audio")
const playList = $(".playlist")
const btnPlay = $(".btn-toggle-play")
const progress = $('#progress')
const btnNext = $(".btn-next")
const btnPrev = $(".btn-prev")
const btnRandom = $(".btn-random")
const btnRepeat = $(".btn-repeat")
const smallWave = $(".small-wave")
const app = {
    currentIndex: 0,
    isPlaying : false,
    isRanDom: false,
    isRepeat: false,
    isNextPrev: false,
    isBtnNone : false,
    config : JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    setConfig : function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    }, 
    songs :[],
    historySong: [],
    render:function(){
        const htmls = this.songs.map(function(song, index){
            return (
               `<div class="song" data-index = "${index}">
                    <div class="thumb"
                        style="background-image: url(${song.image})">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>` 
            )
        })
        playList.innerHTML = htmls.join("")
    },
    handleEvents: function(){
        const _this = this
        const cd = $(".cd")
        const cdWidth = cd.offsetWidth
        //event handling rotate 
        const rotate = cdThumb.animate(
            [{transform: "rotate(360deg)"}],
            {   
                duration: 20000,
                iterations: Infinity,
            }
        )
        rotate.pause()
        // event handling scroll
        document.onscroll = function(){
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const cdNewWidth = cdWidth - scrollTop
            cd.style.width = cdNewWidth > 0 ?`${cdNewWidth}px` : 0
            cd.style.opacity = cdNewWidth / cdWidth
            if(_this.isPlaying){
                cd.style.width == "0px" ? smallWave.style.opacity = 1 : smallWave.style.opacity = 0
            }
        }
        //event handling when end song
        const endSong = () =>{
            if(audio.ended){
                if (_this.isRanDom){
                    _this.randomSong() 
                }else if( this.isRepeat){
                    _this.repeatSong()
                }
                if (!_this.isRanDom && !_this.isRepeat){
                    setTimeout(() => {
                        _this.nextSong()
                        setTimeout(() => {
                            progress.max = audio.duration
                        }, 1000);
                        audio.play()
                    }, 1200)
                } 
            }
        }
        // event handling update song time 
        const SongTimeUpdate = () =>{
            audio.ontimeupdate = ()=>{
                progress.value = audio.currentTime
                endSong()
            }
        }
        // event handling click button play 
        btnPlay.addEventListener("click", function(){
            progress.max = audio.duration
            const player = $(".player")
            if (_this.isPlaying){
                audio.pause()
                rotate.pause()
            }
            else{
                audio.play()
                rotate.play()
            }   
            audio.onplay = function(){
                _this.isPlaying = true
                player.classList.add("playing")
            }
            audio.onpause = function(){
                _this.isPlaying = false
                player.classList.remove("playing")
                smallWave.style.opacity = 0
            }
            progress.onchange = function(e){
                audio.currentTime = e.target.value 
            }
            SongTimeUpdate()
        })
        //event handling click button next, prev
        btnNext.addEventListener("click", function(){
            _this.nextSong()
            setTimeout(() => {
                progress.max = audio.duration
            }, 1000);
            if (_this.isPlaying){
                audio.play()
            }
        })
        btnPrev.addEventListener("click", function(){
            if(this.classList[2] === "btn-none"){
                return false
            }
            _this.prevSong()
            setTimeout(() => {
                progress.max = audio.duration
            }, 1000);
            if (_this.isPlaying){
                audio.play()
            }
        })
        // event handling random
        btnRandom.addEventListener("click", function(){
            if(!_this.isRanDom){
                btnRandom.classList.add("active")
                _this.isRanDom = true
                _this.isRepeat = false
                btnRepeat.classList.remove("active")
                SongTimeUpdate()
                _this.setConfig("isRepeat" , _this.isRepeat)
                _this.setConfig("isRandom" , _this.isRanDom)
            }else{
                btnRandom.classList.remove("active")
                _this.isRanDom = false
                _this.setConfig("isRepeat" , _this.isRepeat)
                _this.setConfig("isRandom" , _this.isRanDom)
            }
        })
        //event handling repeat
        btnRepeat.addEventListener("click", function(){
            if(!_this.isRepeat){
                btnRepeat.classList.add("active")
                _this.isRepeat = true
                _this.isRanDom = false
                btnRandom.classList.remove("active")
                SongTimeUpdate()
                _this.setConfig("isRepeat" , _this.isRepeat)
                _this.setConfig("isRandom" , _this.isRanDom)
            }else{
                btnRepeat.classList.remove("active")
                _this.isRepeat = false
                _this.setConfig("isRepeat" , _this.isRepeat)
                _this.setConfig("isRandom" , _this.isRanDom)
            }

        })
        playList.addEventListener("click", function(e){
            const songNode = e.target.closest(".song:not(.active)") 
            const songOption = e.target.closest(".option") 
            if(songNode || songOption){
                // click on the song item not active
                if(songNode && !songOption){
                    _this.selectSong(songNode)  
                    setTimeout(() => {
                        progress.max = audio.duration
                    }, 1000); 
                    if(_this.isPlaying){
                        audio.play()
                        rotate.play()
                    }
                }
                // click on the option
                if(songOption){

                }
            }
        })
    },
    defineproperty: function(){
        Object.defineProperty(this, "currentSong" ,{
            get: function(){
                return this.songs[this.currentIndex]
            }
        })
    },
    loadCurrentSong: function(){
        cdThumb.style.cssText = `background-image: url(${this.currentSong.image})`
        header.innerText = this.currentSong.name 
        audio.src = this.currentSong.path
        this.activeSong(this.currentIndex)
    },
    nextSong : function(){
        this.currentIndex ++
        if (btnPrev.classList[2] === "btn-none"){
            btnPrev.classList.remove("btn-none") 
        }
        if (this.currentIndex >= this.songs.length + 1){
            this.currentIndex = 0
        }
        else if (this.historySong.length < this.songs.length ){
            this.currentIndex = this.historySong.length + 1
        }
        this.updateHistorySong(this.songs[this.currentIndex -1])
        if(this.songs[this.currentIndex]){
            this.loadCurrentSong()
        }
        ////////////////////////////////////////////////////////////////////////////////////////////////
        // else{                                                                                      //
        //     const aa = this.historySong                                                            //
        //     this.historySong.splice(0, Math.floor(this.historySong.length / 2))
        //     let idSong = this.historySong[this.historySong.length - 1].id 
        //     this.currentIndex = parseInt(idSong) - 1
        // }
        ////////////////////////////////////////////////////////////////////////////////////////////////
    },
    prevSong : function(){
        this.currentIndex--
        if (this.historySong.length !== 1 && this.historySong[this.historySong.length - 1]){
            let idSong = this.historySong[this.historySong.length - 1].id
            this.currentIndex = parseInt(idSong) - 1
            this.updateHistorySong()
        }
        else{
            this.currentIndex = 0
            btnPrev.classList.add("btn-none") 
        }
        this.loadCurrentSong()
    },
    randomSong : function(){
        setTimeout(() => {
            let newIndex
            let oldCurrentIndex = this.currentIndex
            do{
               newIndex = Math.floor(Math.random() * this.songs.length)
            } while (this.currentIndex === newIndex)
                if (this.currentIndex !== newIndex){
                    this.currentIndex = newIndex
                    if (this.currentIndex !== oldCurrentIndex ){
                        this.updateHistorySong(this.songs[oldCurrentIndex])
                        if (btnPrev.classList[2] === "btn-none"){
                            btnPrev.classList.remove("btn-none") 
                        }
                    }
                }
                this.loadCurrentSong()
                setTimeout(() => {
                    progress.max = audio.duration
                }, 1000);
                audio.play() 
        }, 1200);
    },
    repeatSong: function(){
        setTimeout(() => {
            audio.play()
        },1200);
    },
    activeSong: function(index){
        const songItem = $$(".song")
        songItem.forEach(function(ele, i){
            if(ele.classList[1] === "active" && i !== index){
                songItem[i].classList.remove("active")
            }
            else if(i === index){
                songItem[index].classList.add("active")
            }
        })
        this.scrollToActiveSong()
    },
    updateHistorySong: function(item){
        if (arguments.length === 1) {
            if(item){
                this .historySong.push(item);
            }
        }else{
            if (this.historySong.length > 0){
                this.historySong.pop();
            }
        }
        // console.log(this.historySong);
    },
    loadFirstSong: function(){
        if (this.historySong.length === 0){
            btnPrev.classList.add("btn-none") 
        }
    },
    scrollToActiveSong: function(){
        setTimeout(() => {
            if(this.currentIndex < Math.floor(this.songs.length / 4)){
                $(".song.active").scrollIntoView({behavior: "smooth", block: "end", inline: "center"});
            }else{
                $(".song.active").scrollIntoView({behavior: "smooth", block: "center", inline: "center"});
            }
        },100)
    },
    selectSong: function(songNode){
        this.updateHistorySong(this.songs[this.currentIndex])
        if (btnPrev.classList[2] === "btn-none"){
            btnPrev.classList.remove("btn-none") 
        }
        this.currentIndex = Number(songNode.dataset.index )
        if(this.songs[this.currentIndex]){
            this.loadCurrentSong()
        }
    },
    loadConfig: function(){
        this.isRanDom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
        btnRandom.classList.toggle("active", this.isRanDom)
        btnRepeat.classList.toggle("active", this.isRepeat)
    },
    start: function(){
        this.loadConfig()
        this.render();
        this.loadFirstSong()
        this.defineproperty()
        this.loadCurrentSong()
        this.handleEvents()
    }
}


fetch(API)
    .then((response) => response.json())
    .then((sons)=>{
            app.songs = sons
            app.start()
            
        })
    .catch ((error) => {
        app.songs = [
            {
                "id" : "1",
                "name" : "Monsters",
                "path": "./song/Monsters.mp3",
                "image" : "https://avatar-ex-swe.nixcdn.com/song/2019/09/05/2/6/c/4/1567654853186_640.jpg",
                "singer" : "Timeflies, Katie Sky"
            },
            {
                "id" : "2",
                "name" : "HALLOWEEN MONSTERS",
                "path": "http://api.mp3.zing.vn/api/streaming/audio/ZU7EEOF9/320",
                "image" : "https://photo-resize-zmp3.zmdcdn.me/w240_r1x1_webp/cover/5/9/b/1/59b166c19132c0020d8745c3c5841b54.jpg",
                "singer" : "Larva"
            },
            {
                "id" : "3",
                "name" : "Reality",
                "path": "./song/Reality.mp3",
                "image" : "https://www.voca.vn/assets/img/news/avt%20cover%20ytb-1545703316.jpg",
                "singer" : "Lost Frequencies, Janieck Devy"
            },
            {
                "id" : "4",
                "name" : "The Fat Rat Remix",
                "path": "./song/TheFatRat.mp3",
                "image" : "https://avatar-nct.nixcdn.com/singer/avatar/2016/09/28/b/3/d/c/1475049690234.jpg",
                "singer" : "TheFatRat"
            },
            {
                "id" : "5",
                "name" : "Talking To The Moon",
                "path": "./song/TalkingToTheMoon.mp3",
                "image" : "https://avatar-nct.nixcdn.com/song/2020/08/06/6/0/8/0/1596678685153.jpg",
                "singer" : "Bruno Mars"
            },
            {
                "id" : "6",
                "name" : "The Joker And The Queen ",
                "path": "./song/TheJokerAndTheQueen.mp3",
                "image" : "https://avatar-ex-swe.nixcdn.com/song/2022/02/11/4/8/f/8/1644547789570_640.jpg",
                "singer" : "Ed Sheeran"
            },
            {
                "id" : "7",
                "name" : "STAY",
                "path": "http://api.mp3.zing.vn/api/streaming/audio/ZUWIB0AW/320",
                "image" : "https://photo-resize-zmp3.zmdcdn.me/w240_r1x1_webp/cover/f/8/8/f/f88f4e0c0e6972c00bfa535ad06019e6.jpg",
                "singer" : "The Kid LAROI, Justin Bieber"
            },
            {
                "id" : "8",
                "name" : "Into Your Arms",
                "path": "./song/IntoYourArms.mp3",
                "image" : "https://angartwork.akamaized.net/?id=88180482&size=640",
                "singer" : "Lev Akro & Allen Wish"
            },
            {
                "id" : "9",
                "name" : "Yume to Hazakura",
                "path": "http://api.mp3.zing.vn/api/streaming/audio/ZW66AZB0/320",
                "image" : "https://wallpaperaccess.com/full/6165380.jpg",
                "singer" : "WOIM Collection"
            },
            {
                "id" : "10",
                "name" : "Đế Vương",
                "path": "./song/de-vuong.mp3",
                "image" : "https://kienthucmoi.net/img/2021/12/13/loi-bai-hat-de-vuong-al.jpg",
                "singer": "Đình Dũng"
            },
            {
                "id" : "11",
                "name" : "TGSN - Siren (feat. Tlinh & RZ Mas)",
                "path": "./song/Siren-TGSN-Tlinh.mp3",
                "image" : "https://o.vdoc.vn/data/image/2021/06/04/loi-bai-hat-siren-tgsn-tlinh-rzmas-700-size-640x335-znd.jpg",
                "singer" : "feat. Tlinh & RZ Mas"
            },
            {
                "id" : "12",
                "name" : "Yêu Đương Khó Quá Thì Chạy Về Khóc Với Anh",
                "path": "./song/YeuDuongKhoQuaThiChayVeKhocVoiAnh.mp3",
                "image" : "https://avatar-nct.nixcdn.com/song/2022/01/26/4/e/f/e/1643184497199.jpg",
                "singer" : "ERIK"
            },
            {
                "id" : "13",
                "name" : "Đám Cưới Nha?",
                "path": "http://api.mp3.zing.vn/api/streaming/audio/ZZ8FBUW9/320",
                "image" : "https://photo-resize-zmp3.zmdcdn.me/w240_r1x1_webp/cover/5/b/8/b/5b8b7cd3d1434afa3b2b9854efdc8756.jpg",
                "singer" : "Hồng Thanh, DJ Mie"
            },
            {
                "id" : "14",
                "name" : "Roots",
                "path": "http://api.mp3.zing.vn/api/streaming/audio/ZWAE6DBB/320",
                "image" : "https://photo-resize-zmp3.zmdcdn.me/w240_r1x1_webp/cover/4/2/f/1/42f15c18e2b4ad65bac570a29a09d477.jpg",
                "singer" : "Valerie Broussard, Galantis"
            },
            {
                "id" : "15",
                "name" : "THATS WHAT I WANT",
                "path": "http://api.mp3.zing.vn/api/streaming/audio/ZU6BI00F/320",
                "image" : "https://photo-resize-zmp3.zmdcdn.me/w240_r1x1_webp/cover/6/4/b/a/64bae79a86925614bdfa77e31368603e.jpg",
                "singer" : "Lil Nas X"
            },
            {
                "id" : "16",
                "name" : "Pinocchio",
                "path": "http://api.mp3.zing.vn/api/streaming/audio/ZWZEEA9I/320",
                "image" : "https://photo-resize-zmp3.zmdcdn.me/w240_r1x1_webp/covers/9/1/91e33dc6e0235fa1d2f2cd8e013fbe54_1326638023.jpg",
                "singer" : "Crazy Frog"
            },
            {
                "id" : "17",
                "name" : "Daddy DJ",
                "path": "http://api.mp3.zing.vn/api/streaming/audio/ZWZEE7OD/320",
                "image" : "https://photo-resize-zmp3.zmdcdn.me/w240_r1x1_webp/covers/f/d/fd2999414db6b4b2e0e4003902e264bc_1325914689.jpg",
                "singer" : "Crazy Frog"
            },
            {
                "id" : "18",
                "name" : "POOPOO",
                "path": "http://api.mp3.zing.vn/api/streaming/audio/ZU7EEOFB/320",
                "image" : "https://photo-resize-zmp3.zmdcdn.me/w240_r1x1_webp/cover/1/c/a/4/1ca4a7679da1210fd96dae82b61d1912.jpg",
                "singer" : "Larva"
            },
            {
                "id" : "19",
                "name" : "As It Was",
                "path": "http://api.mp3.zing.vn/api/streaming/audio/ZZ9AUFD7/320",
                "image" : "https://photo-resize-zmp3.zmdcdn.me/w240_r1x1_webp/cover/a/7/7/4/a774fcf4e0d30ef6c689c7c65ff941bc.jpg",
                "singer" : "Harry Styles"
            }
        ] 
        app.start()
    }) 
