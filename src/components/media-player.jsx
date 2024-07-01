import React, { useState, useEffect } from 'react'
import { PlayerInfo } from '../components/player-info'
import Sound from './sound'
// import SoundCloud from './sound-cloud'
import useMediaPlayer from "../hooks/useMediaPlayer"
import useBrowserData from '../hooks/useBrowserData'
import { apiObjGetStorage, apiObjSetStorage } from '../utils/api'

let styles = {
  floatingButton: {
    margin: 0,
    bottom: 330,
    left: 610,
    position: 'fixed',
    right: 'auto',
    zIndex: 1000,
  },
  footer: {
    display: 'block',
    zIndex: 3,
    fontSize: 18,
    height: 64,
    position: 'fixed',
    right: 0,
    left: 0,
    paddingLeft: 64,
    bottom: 0,
    margin: 0,
    cursor: 'pointer'
  },
}

const Footer = () => {
  const {width, height} = useBrowserData()
  const player = useMediaPlayer()
  const { curPlay,
          onStopPlaying, setIsPaused, onPlaying, onFinishedPlaying,
          isPaused, isWaitingForPlayInfo} = player
  let tmpPlay = player.curPlay
  if (!tmpPlay) tmpPlay = {curSerie: undefined, curEp: undefined}
  const {curSerie,curEp} = tmpPlay
  const curEpInx = 0
  if (curSerie && curSerie.epList && curEpInx) {
//    curEp = curSerie.epList[curEpInx-1]
  }
  const [hasFinishedPlay, setHasFinishedPlay] = useState(false)
  const [startPos, setStartPos] = useState(0)
  const [curMsPos, setCurMsPos] = useState(undefined)
  const [curPos, setCurPos] = useState()
  const [curDur, setCurDur] = useState()
  const storePos = (msPos) => apiObjSetStorage(curPlay,"mSec",msPos)
  const restorePos = async (obj) => {
    await apiObjGetStorage(obj,"mSec").then((value) => {
      if (value==null){
        value=0
      }
      if ((obj!=null)&&(obj.curSerie!=null)&&(obj.curSerie.fileList!=null)
          &&(obj.curEp!=null)&&((obj.curSerie.fileList.length-1)===obj.curEp.id)){
        apiObjGetStorage(obj,"mSecDur").then((dur) => {
          const marginSec = 3 // minimum sec for play - else repeat from beginning
          if (value+(marginSec*1000)>dur){
            value = 0
          }
          setStartPos(value)
          setCurMsPos(value)
        })
      } else {
        setStartPos(value)
        setCurMsPos(value)
      }
    }).catch((err) => {
      console.error(err)
    })
  }
  useEffect(() => {
    if (curPlay!=null){
      setHasFinishedPlay(false)
      restorePos(curPlay)
    }
  },[curPlay,curEp])

  const closeFooter = () => {
console.log(curMsPos)
    storePos(curMsPos)
    if (onStopPlaying) onStopPlaying()
  }

  const movePos = (percent) => {
    if (percent!=null){
      let newPos = 0
      if (curDur!=null){
        newPos = Math.floor(percent * curDur / 100) // Divide by 100 in order to get promille - i.e. milliseconds
      }
      setHasFinishedPlay(false)
      setStartPos(newPos)
      setCurMsPos(newPos)
    }
  }

  const handleStop = () => setHasFinishedPlay(false)
  const handleSetPaused = (isPaused) => {
console.log("handleSetPaused")
    setIsPaused(isPaused)
    if (!isPaused) setHasFinishedPlay(false)
  }

  const handleLoading = (cur) => {
    if (curDur !== cur.duration){
      apiObjSetStorage(curPlay,"mSecDur",cur.duration)
      setCurDur(cur.duration)
    }
  }

  const updatePos = (cur) => {
    const newPos = Math.floor(cur.position / 1000)
    if (curPos !== newPos) {
      storePos(cur.position)
    }
    if (curDur !== cur.duration){
      apiObjSetStorage(curPlay,"mSecDur",cur.duration)
      setCurMsPos(cur.position)
      setCurPos(newPos)
      setCurDur(cur.duration)
    } else {
      setCurMsPos(cur.position)
      setCurPos(newPos)
    }
  }

  const handlePlaying = (cur) => {
// BUG FIX !!!
    const soundPlayerBugFix = hasFinishedPlay
    if (!soundPlayerBugFix){
      updatePos(cur)
      if (onPlaying) onPlaying(cur)
    }
  }

  const handleFinishedVideoPlaying = () => {
    if (onFinishedPlaying) onFinishedPlaying()
  }

  const handleFinishedPlaying = () => {
console.log("handleFinishedPlaying")
    setHasFinishedPlay(true)
    handleFinishedVideoPlaying()
  }

  const topMargin = 60

  let curHeight = Math.trunc(width*9/16)
  if (curHeight>height-topMargin){
    curHeight = height-topMargin
  }

  let useSec
  let useDur
  let downloadName
  if (curMsPos!=null) useSec = Math.floor(curMsPos / 1000)
  if (curDur!=null) useDur = Math.floor(curDur / 1000)
  let locURL = ""
  let locPath = ""
  let curPlayState = isPaused ? Sound.status.PAUSED : Sound.status.PLAYING
  let idStr = "footer"
  if ((curPlay!=null)) {
    if ((curEp!=null)&&(curEp.filename!=null)) {
      locURL = curEp.filename
    } else if ((curSerie!=null)&&(curSerie.curPath!=null)) {
      locURL = curSerie.URL
    }
//    locPath = getLocalMediaFName(locURL)
    locPath = locURL
  }
  if (locURL.length>0) {
    return (
      <footer
        id={idStr}
        style={styles.footer}>
        <div>
          <Sound
            url={locPath}
            autoPlay
            playStatus={curPlayState}
            playFromPosition={startPos}
            onLoading={handleLoading}
            onPlaying={handlePlaying}
            onStop={handleStop}
            onFinishedPlaying={handleFinishedPlaying} />
          <PlayerInfo
            containerWidth={width}
            curSec={useSec}
            curDur={useDur}
            isPaused={isPaused}
            isWaitingForPlayInfo={isWaitingForPlayInfo}
            episode={curPlay.curEp}
            serie={curPlay.curSerie}
            onSetPaused={handleSetPaused}
            url={locPath}
            downloadName={downloadName}
            onMovePosCallback={movePos}
            onCloseCallback={closeFooter} />
        </div>
      </footer>
    )
  } else {
     return (
       <footer id="footer" style={{display: 'none' }}>
       </footer>
    )
  }

}

export const MediaPlayer = (props) => {
  const [isWaitingForPlayInfo, setIsWaitingForPlayInfo] = useState(false)
  const [isPaused, setIsPaused] = useState(true)
  const [curCheckPos, setCurCheckPos] = useState(undefined)
  const [curPos, setCurPos] = useState()
  const player = useMediaPlayer()
  const {curSerie, curEp} = player

  const handlePlaying = (cur) => {
    if ((cur!=null) && (cur.position!=null)
      && isWaitingForPlayInfo){
      if (cur.position!==curCheckPos){
        setCurCheckPos(cur.position)
        setIsWaitingForPlayInfo(false)
      } else {
        setCurCheckPos(cur.position)
      }
    }
    const {curSerie} = props
    if ((curSerie!=null)&&(curSerie.nextLevelPos!=null)){
console.log(cur)
      if (cur.position-(curSerie.nextLevelPos*1000)>=cur.duration){
        if (props.onEndOfLevel!=null) props.onEndOfLevel()
      }
    }
    if (props.onPlaying) props.onPlaying({position: cur.position, duration: cur.duration})
    setCurPos(cur)
  }

  const handleStopPlaying = () => {
    player.onStopPlaying()
    setIsPaused(false)
    setIsWaitingForPlayInfo(false)
    setCurCheckPos(undefined)
    if (props.onStopPlaying) props.onStopPlaying()
  }

  return (
      <Footer
        curSerie={curSerie}
        curEp={curEp}
        isPaused={isPaused}
        isWaitingForPlayInfo={isWaitingForPlayInfo}
        curPos={curPos}
        onSetPaused={(isPaused) => setIsPaused(isPaused)}
        onPlaying={handlePlaying}
        onFinishedPlaying={() => props.onFinishedPlaying()}
        onStopPlaying={handleStopPlaying}
      />
  )
}

export default MediaPlayer
