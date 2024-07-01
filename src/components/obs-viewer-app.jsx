import React from 'react'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import OBSNavigation from './obs-navigation'
import useMediaPlayer from "../hooks/useMediaPlayer"
import { pad } from '../utils/obj-functions'

const theme = createTheme({
  palette: {
    mode: 'dark',
  },
})

const defaultBackgroundStyle = {
  height: 'auto',
  minHeight: '100vh',
  background: '#181818',
  padding: 0,
  color: 'whitesmoke',
}

const OBSPictureNavigationApp = () => {
  const mPlayObj = useMediaPlayer()
  const { startPlay, isPaused } = mPlayObj

  const handleStartBiblePlay = (curSerie,bookObj,id) => {
    const useSerie = { title: "OBSStory"}
    const bk = "Gen"
    const curEp = {
      bibleType: true,
      bk,
      id,
      filename: `/audio/en_obs_${pad(id)}_32kbps.mp3`
    }
    startPlay(id,useSerie,curEp)
  }
return (
    <div style={defaultBackgroundStyle}>
      <ThemeProvider theme={theme}>
        <OBSNavigation
          isPaused={isPaused}
          onReset={() => console.log("onReset")}
          onExitNavigation={() => console.log("onExitNavigation")}
          onStartPlay={handleStartBiblePlay}
        />
      </ThemeProvider>
    </div>
  )
}

export default OBSPictureNavigationApp
