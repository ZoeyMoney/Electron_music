import { Routes, Route } from 'react-router-dom'
import Recommend from '@renderer/view/Recommend' //为你推荐
import MusicLibrary from '@renderer/view/MusicLibrary'
import SettingMusic from '@renderer/components/SettingMusic'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ContentDetails from '@renderer/components/ContentDetails' //电台音乐列表详情
import LocalMusic from '@renderer/view/LocalMusic'
import HistoryMusic from '@renderer/view/HistoryMusic'
import AllMusic from '@renderer/view/AllMusic'
// import SearchTable from '@renderer/components/SearchTable'
import ViewMore from '@renderer/components/ViewMore' //显示更多
import MyLikeMusic from '@renderer/view/MyLikeMusic' //自建歌单


import InterMusicTable from '@renderer/components/InterMusicTable'

const AppRoutes = (): JSX.Element => {
  const location = useLocation()
  const pageVariants = {
    initial: { opacity: 0, x: 100 }, //向右偏移
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: 100 } //向左偏移
  }
  console.log(location.pathname)
  return (
    <AnimatePresence mode={'wait'}>
      <motion.div
        key={location.pathname + location.key}
        variants={pageVariants}
        initial="initial"
        animate="in"
        exit="out"
        transition={{ duration: 0.2 }}
        style={{ position: 'relative', width: '100%' }}
      >
        <Routes location={location}>
          <Route path="/" element={<Recommend />} />
          <Route path="/ViewMore" element={<ViewMore />} />
          <Route path="/ContentDetails" element={<ContentDetails />} />
          <Route path="/MusicLibrary" element={<MusicLibrary />} />
          <Route path="/SettingMusic" element={<SettingMusic />} />
          <Route path="/LocalMusic" element={<LocalMusic />} />
          <Route path="/HistoryMusic" element={<HistoryMusic />} />
          <Route path="/AllMusic" element={<AllMusic />} />
          {/*<Route path="/SearchTable" element={<SearchTable />} />*/}
          <Route path="/InterMusicTable" element={<InterMusicTable />} />
          <Route path="/MyLikeMusic" element={<MyLikeMusic />} />
          {/*<Route path="/Like" element={<Like />} />*/}
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

export default AppRoutes
