const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)
const cdThumb = $(".cd-thumb")
const header = $("header>h2")
const audio = $("#audio")
const btnPlay = $(".btn-toggle-play")
const progress = $('#progress')
const btnNext = $(".btn-next")
const btnPrev = $(".btn-prev")
const app = {
    currentIndex: 0,
    isPlaying : false,
    songs : [
        {
            id : "1",
            name : "Đế Vương",
            path: "./song/de-vuong.mp3",
            image : "https://kienthucmoi.net/img/2021/12/13/loi-bai-hat-de-vuong-al.jpg",
            singer: "Đình Dũng"
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
        // xử lí sự kiện click vào nút play 
        btnPlay.addEventListener("click", function(){
            const player = $(".player")
            progress.max = audio.duration
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
            audio.ontimeupdate = function(){
                progress.value = audio.currentTime
                if(audio.ended){
                    rotate.cancel()
                }
            }
        })
        //xử lí sự kiện next, prev
        btnNext.addEventListener("click", function(){
            _this.nextSong()
            audio.play()

        })
        btnPrev.addEventListener("click", function(){
            _this.prevSong()
            audio.play()
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
            this.currentSong = 0
        }
        this.loadCurrentSong()
    },
    prevSong : function(){
        this.currentIndex--
        if (this.currentIndex <  0){
            this.currentIndex = this.songs.length -1
            this.currentSong = this.songs.length - 1
        }
        this.loadCurrentSong()
    },
    start: function(){
        this.defineproperty()
        this.handleEvents()
        this.loadCurrentSong()
        this.render();
    }
}

app.start()


