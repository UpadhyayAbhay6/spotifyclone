let currentSong = new Audio();
let songs;
let currFolder;
function convertSecondsToMinutesAndSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00"
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://spotifyclone/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            console.log(element.href.split(`${folder}/`)[1])
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    console.log(songs)
    
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML="";
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
        
        <img class="invert" src="SVG/music.svg" alt="">
        <div class="info">
            <div>${song.replaceAll("%20", " ")}</div>
            <div>Abhay</div>
        </div>
        <div class="playnow">
            <span>Play Now</span>
            <img class="invert" src="SVG/play.svg" alt="">
        </div>
    
         </li>`;
    }


    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })
    
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/spotifyclone/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "SVG/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"

}
async function displayAlbums(){
    let a = await fetch(`http://spotifyclone/songsPlaylist/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardcontainer = document.querySelector(".cardcontainer")
    let array = Array.from(anchors)
    for(let index=0; index<array.length; index++){
        const e = array[index]
        if(e.href.includes("spotifyclone/songsPlaylist/") && !e.href.includes(".htaccess")){
            let folder = e.href.split("/").slice(-2)[1]
            console.log(folder)
            let a = await fetch(`/spotifyclone/songsPlaylist/${folder}/info.json`);
            console.log(a)
            let response = await a.json()
            

            cardcontainer.innerHTML = cardcontainer.innerHTML + `<div data-folder="${folder}" class="card">
            <div class="play">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
                    color="#000000" fill="none">
                    <path
                        d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                        stroke="currentColor" fill="#000" stroke-width="1.5" stroke-linejoin="round" />
                </svg>
            </div>
            <img src="songsPlaylist/${folder}/cover.jpg" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
        </div>`
        }
    }
    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        e.addEventListener("click", async item=>{
            songs = await getSongs(`songsPlaylist/${item.currentTarget.dataset.folder}`)
        })
    })
   
}
async function main() {
    await getSongs(`songsPlaylist/arijitsongs`);

    playMusic(songs[0], true)
   
    await displayAlbums();

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "SVG/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "SVG/play.svg"
        }
    })
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${convertSecondsToMinutesAndSeconds(currentSong.currentTime)}/
        ${convertSecondsToMinutesAndSeconds(currentSong.duration)}`

        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })
    
    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    // Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    // Add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

     // Add an event listener to previous
     previous.addEventListener("click", () => {
        currentSong.pause()
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    // Add an event listener to next
    next.addEventListener("click", () => {
        currentSong.pause() 
        console.log(currentSong.src.split("/").slice(-1))
            
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        
        if ((index + 1) < songs.length) {
            console.log(songs[index+1])
            playMusic(songs[index + 1])
        }
    })

    
    document.querySelector(".fullvolume").addEventListener("click", e=>{
        if(e.target.src.includes("SVG/volume.svg")){
            e.target.src = e.target.src.replace("SVG/volume.svg", "SVG/mute.svg")
            currentSong.volume=0
            document.querySelector(".range").getElementsByTagName("input")[0].value=0;
        }
        else{
            e.target.src = e.target.src.replace("SVG/mute.svg", "SVG/volumeless.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value=10;
        }
    })

    document.querySelector(".lessvolume").addEventListener("click", e=>{
        if(e.target.src.includes("SVG/volumeless.svg")){
            e.target.src = e.target.src.replace("SVG/volumeless.svg", "SVG/mute.svg")
            currentSong.volume=0
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("SVG/mute.svg", "SVG/volumeless.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value=10;
        }
    }) 
    
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e)=>{
        currentSong.volume = parseInt(e.target.value)/100
        if(document.querySelector(".range").getElementsByTagName("input")[0].value>=50){
            document.querySelector(".fullvolume").style.display="flex";
            document.querySelector(".lessvolume").style.display="none";
            document.querySelector(".mute").style.display="none";
        }
        else if(document.querySelector(".range").getElementsByTagName("input")[0].value==0){
            document.querySelector(".mute").style.display="flex";
            document.querySelector(".lessvolume").style.display="none";
            document.querySelector(".fullvolume").style.display="none";
        }
        else if(document.querySelector(".range").getElementsByTagName("input")[0].value>=1 && document.querySelector(".range").getElementsByTagName("input")[0].value<50){
            document.querySelector(".lessvolume").style.display="flex";
            document.querySelector(".fullvolume").style.display="none";
            document.querySelector(".mute").style.display="none";
        }
        
    })
    
}

main();
