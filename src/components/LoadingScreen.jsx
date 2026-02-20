import { motion as Motion } from 'framer-motion';

export default function LoadingScreen() {
  return (
    <Motion.div
      key="loading"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
    >
      {/* Vignette overlay */}
      <div className="absolute inset-0 bg-radial from-transparent via-black/30 to-black/70 pointer-events-none" />

      <div className="relative flex flex-col items-center gap-8">
        {/* Logo */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="text-center"
        >
          <h1 className="text-7xl font-black italic tracking-tighter">
            <span className="bg-gradient-to-br from-violet-300 via-purple-400 to-fuchsia-500 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(168,85,247,0.6)]">
              PONG PING
            </span>
          </h1>
          <p className="mt-3 text-purple-300/60 text-sm font-mono tracking-widest uppercase">
            Setting up the game...
          </p>
        </Motion.div>

        {/* Loading bar */}
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="w-48 h-px bg-purple-900/60 rounded-full overflow-hidden"
        >
          <Motion.div
            className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.4, ease: 'easeInOut', delay: 0.2 }}
          />
        </Motion.div>
      </div>
    </Motion.div>
  );
}
