const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)
const cdThumb = $(".cd-thumb")
const header = $("header>h2")
const audio = $("#audio")
const btnPlay = $(".btn-toggle-play")
const progress = $('#progress')
const btnNext = $(".btn-next")
const btnPrev = $(".btn-prev")
const btnRandom = $(".btn-random")
const btnRepeat = $(".btn-repeat")
const app = {
    currentIndex: 0,
    isPlaying : false,
    isRanDom: false,
    isRepeat: false,
    songs : [
        {
            id : "1",
            name : "Monsters",
            path: "./song/Monsters.mp3",
            image : "https://avatar-ex-swe.nixcdn.com/song/2019/09/05/2/6/c/4/1567654853186_640.jpg",
            singer : "Timeflies, Katie Sky"
        },
        {
            id : "2",
            name : "Into Your Arms",
            path: "./song/IntoYourArms.mp3",
            image : "https://angartwork.akamaized.net/?id=88180482&size=640",
            singer : "Lev Akro & Allen Wish"
        },
        {
            id : "3",
            name : "Reality",
            path: "./song/Reality.mp3",
            image : "https://www.voca.vn/assets/img/news/avt%20cover%20ytb-1545703316.jpg",
            singer : "Lost Frequencies, Janieck Devy"
        },
        {
            id : "4",
            name : "Đế Vương",
            path: "./song/de-vuong.mp3",
            image : "https://kienthucmoi.net/img/2021/12/13/loi-bai-hat-de-vuong-al.jpg",
            singer: "Đình Dũng"
        },
        {
            id : "5",
            name : "The Fat Rat Remix",
            path: "./song/TheFatRat.mp3",
            image : "https://avatar-nct.nixcdn.com/singer/avatar/2016/09/28/b/3/d/c/1475049690234.jpg",
            singer : "TheFatRat"
        },
        {
            id : "6",
            name : "Yêu Đương Khó Quá Thì Chạy Về Khóc Với Anh",
            path: "./song/YeuDuongKhoQuaThiChayVeKhocVoiAnh.mp3",
            image : "https://avatar-nct.nixcdn.com/song/2022/01/26/4/e/f/e/1643184497199.jpg",
            singer : "ERIK"
        },
        {
            id : "7",
            name : "Talking To The Moon",
            path: "./song/TalkingToTheMoon.mp3",
            image : "https://avatar-nct.nixcdn.com/song/2020/08/06/6/0/8/0/1596678685153.jpg",
            singer : "Bruno Mars"
        },
    ],
    render:function(){
        const htmls = this.songs.map(function(song){
            return (
               `<div class="song">
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
        $(".playlist").innerHTML = htmls.join("")
    },
    handleEvents: function(){
        const cd = $(".cd")
        const cdWidth = cd.offsetWidth
        const _this = this
        //xử lí sự kiện quay 
        const rotate = cdThumb.animate(
            [{transform: "rotate(360deg)"}],
            {   
                duration: 20000,
                iterations: Infinity,
            }
        )
        rotate.pause()
        // xử lí sự kiện scroll
        document.onscroll = function(){
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const cdNewWidth = cdWidth - scrollTop
            cd.style.width = cdNewWidth > 0 ?`${cdNewWidth}px` : 0
            cd.style.opacity = cdNewWidth / cdWidth
        }
        //xử kí sự kien khi kết thúc bài hát
        const  endSong = () =>{
            if(audio.ended){
                if (_this.isRanDom && !_this.isRepeat){
                    _this.randomSong() 
                }else if( this.isRepeat && !this.isRanDom){
                    _this.repeatSong()
                }
                if (!_this.isRanDom && !_this.isRepeat){
                    rotate.cancel()
                } 
            }
        }
        // xử lí sự kiện update time bài hát
        const SongTimeUpdate = () =>{
            audio.ontimeupdate = ()=>{
                progress.value = audio.currentTime
                endSong()
            }
        }
        // xử lí sự kiện click vào nút play 
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
            }
            progress.onchange = function(e){
                audio.currentTime = e.target.value 
            }
            SongTimeUpdate()
        })
        //xử lí sự kiện next, prev
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
            _this.prevSong()
            setTimeout(() => {
                progress.max = audio.duration
            }, 1000);
            if (_this.isPlaying){
                audio.play()
            }
        })
        // xử lí sự kiện random
        btnRandom.addEventListener("click", function(){
            if(!_this.isRanDom){
                btnRandom.classList.add("active")
                _this.isRanDom = true
                _this.isRepeat = false
                SongTimeUpdate()
            }else{
                btnRandom.classList.remove("active")
                _this.isRanDom = false
                
            }
        })
        //xử lí sự kiện repeat
        btnRepeat.addEventListener("click", function(){
            if(!_this.isRepeat){
                btnRepeat.classList.add("active")
                _this.isRepeat = true
                _this.isRanDom = false
                btnRandom.classList.remove("active")
                SongTimeUpdate()
            }else{
                btnRepeat.classList.remove("active")
                _this.isRepeat = false
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
    },
    nextSong : function(){
        this.currentIndex++
        if (this.currentIndex >= this.songs.length){
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },
    prevSong : function(){
        this.currentIndex--
        if (this.currentIndex <  0){
            this.currentIndex = this.songs.length -1
        }
        this.loadCurrentSong()
    },
    randomSong : function(){
        setTimeout(() => {
            let newIndex
            do{
               newIndex = Math.floor(Math.random() * this.songs.length)
            } while (this.currentIndex === newIndex)
            this.currentIndex = newIndex
            this.loadCurrentSong()
            setTimeout(() => {
                progress.max = audio.duration
            }, 1000);
            audio.play() 
        }, 1000);
    },
    repeatSong: function(){
        audio.play()
    },
    start: function(){
        this.defineproperty()
        this.loadCurrentSong()
        this.handleEvents()
        this.render();
    }
}

app.start()


