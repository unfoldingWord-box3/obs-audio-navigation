import React, { useState, useEffect, useCallback  } from 'react'
import { apiSetStorage, apiObjGetStorage, apiObjSetStorage } from '../utils/api'
import { unique } from 'shorthash'
import { pad } from '../utils/obj-functions'

const MediaPlayerContext = React.createContext([{}, () => {}])
const MediaPlayerProvider = (props) => {
  const [state, setState] = useState({
    isPlaying: false,
  })
  const setStateKeyVal = (key,val) => setState(state => ({ ...state, [key]: val }))

  const [isPaused, setIsPaused] = useState(false)
  const [imgPos, setImgPos] = useState({});

  const fetchJSONDataFrom = useCallback(async (inx) => {
    const response = await fetch(`data/img_pos${pad(inx +1)}.json`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      }
    });
    const data = await response.json();
    setImgPos((prev) => ({
      ...prev,
      [inx]: data,
    }));
  }, []);

  useEffect(() => {
    const getDataForAllStories = async () => {
      const maxStories = 50
      for(let i=0; i < maxStories; i++) {
        // Wait for each task to finish
        await fetchJSONDataFrom(i);
      }      
    }
    getDataForAllStories()
  }, [fetchJSONDataFrom]);

  const togglePlay = () => {
//    state.isPlaying ? player.pause() : player.play()
    setStateKeyVal( "isPlaying", !state.isPlaying )
  }

  const skipToNextTrack = () => {
//    playTrack(newIndex)
  }

  const onFinishedPlaying = () => {
console.log("onFinishedPlaying")
    if (state.curPlay) {
      const {curSerie, curEp} = state.curPlay
      if (curSerie){
        if ((curSerie.episodeList!=null) && (curSerie.episodeList.length>0)
            && (curEp!=null)){
          // This serie has episodes
          let epInx = curEp.id
          epInx+=1
          let newPlayObj = {curSerie}
          apiObjSetStorage(newPlayObj,"curEp",epInx)
          if (curSerie.episodeList[epInx]!=null){
            newPlayObj.curEp=curSerie.episodeList[epInx]
          }
          setStateKeyVal( "curPlay", newPlayObj)
        }
      }
    }
  }

  const onStopPlaying = () => {
    setStateKeyVal( "curPlay", undefined )
    setStateKeyVal( "curSerie", undefined )
    setStateKeyVal( "curEp", undefined )
  }

  const updateImgBasedOnPos = ( curInx, msPos ) => {
    let checkMsPosArray = []
    if (imgPos) {
      checkMsPosArray = imgPos[ curInx ]
    }
    let retImgSrc = `${pad(curInx+1)}-01`
    checkMsPosArray?.map(checkObj => {
      const checkMs = parseInt(checkObj.pos) * 1000
      if (msPos>=checkMs) retImgSrc = checkObj.img
    })
    return `obsIcons/obs-en-${retImgSrc}.jpg`
  }

  const onPlaying = (curPos) => {
    const curImgSrc = state?.syncImgSrc
    const curInx = state?.curEp?.id
    const msPos = curPos?.position
    const nextImgSrc = updateImgBasedOnPos( curInx, msPos )
    if (nextImgSrc!==curImgSrc) setStateKeyVal( "syncImgSrc", nextImgSrc )
    setStateKeyVal( "curPos", curPos )
  }

  const updateStorage = async (idStr,val) => {
    await apiSetStorage(idStr,val)
  }

  const startPlay = async (inx,curSerie,curEp) => {
    if (!curSerie){ // stop playing
      let newPlayObj
      setStateKeyVal( "curPlay", newPlayObj)
    } else {
      let tmpEp = curEp
      if ((!tmpEp) && (curSerie.episodeList!=null)
          && (curSerie.episodeList[inx]!=null)){
        tmpEp=curSerie.episodeList[inx]
      }
      // This serie has episodes
      let newPlayObj = {curSerie,curEp}
      if (curEp!=null){
//          props.onStartPlay && props.onStartPlay(curSerie,curEp)
        await apiObjSetStorage({curSerie},"curEp",curEp.id)
        setStateKeyVal( "curPlay", newPlayObj)
      } else {
        apiObjGetStorage(newPlayObj,"curEp").then((value) => {
          if ((value==null)||(curSerie && curSerie.episodeList && curSerie.episodeList[value]==null)){
            value=0
            apiObjSetStorage(newPlayObj,"curEp",0)
          }
          if (curSerie && curSerie.episodeList && curSerie.episodeList[value]!=null){
            newPlayObj.curEp=curSerie.episodeList[value]
          }
//            props.onStartPlay && props.onStartPlay(curSerie,curSerie.episodeList[value])
          setStateKeyVal( "curPlay", newPlayObj)
        }).catch((err) => {
          console.error(err)
        })
      }
      const curSerId = unique(curSerie.title)
// navHist is not yet fully implemented
//      const navHist = {...state.navHist, [curSerId]: epIdStr}
//      await updateStorage("navHist",navHist)
      await updateStorage("curSerId",curSerId)
//      setState(state => ({...state, navHist,  curSerId, curSerie, curEp: tmpEp}))
      const curInx = tmpEp?.id
      const syncImgSrc = updateImgBasedOnPos( curInx, 0 )
      setState(state => ({...state, syncImgSrc, curSerId, curSerie, curEp: tmpEp}))
    }
  }

  const value = {
    state: {
      ...state,
      isPaused,
    },
    actions: {
      setState,
      startPlay,
      togglePlay,
      onStopPlaying,
      onPlaying,
      onFinishedPlaying,
      setIsPaused,
      skipToNextTrack,
    }
  }

  return (
    <MediaPlayerContext.Provider value={value}>
      {props.children}
    </MediaPlayerContext.Provider>
  )
}

//viewLibrary,

export {MediaPlayerContext, MediaPlayerProvider}
