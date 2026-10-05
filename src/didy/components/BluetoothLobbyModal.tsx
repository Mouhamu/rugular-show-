import React, { useState, useEffect } from 'react';
import { BluetoothPeer, BluetoothRoom, GameMode, PlayerProfile } from '../types';
import { bluetoothManager, BluetoothConnectionStatus } from '../network/bluetoothManager';
import { REGULAR_SHOW_CHARACTERS } from '../data/characters';
import { didyAudio } from '../audio/didyAudio';
import { getTranslations, SupportedLanguage, CHARACTER_AR_NAMES } from '../i18n/translations';
import {
  Bluetooth,
  Wifi,
  Shield,
  Users,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  X,
  Radio,
  Search,
  Plus,
  HelpCircle,
  Smartphone,
  Signal,
  Sparkles,
  Zap,
  Info
} from 'lucide-react';

interface BluetoothLobbyModalProps {
  profile: PlayerProfile;
  language?: SupportedLanguage;
  onStartMatch: (mode: GameMode) => void;
  onClose: () => void;
}

export const BluetoothLobbyModal: React.FC<BluetoothLobbyModalProps> = ({
  profile,
  language = 'ar',
  onStartMatch,
  onClose
}) => {
  const [room, setRoom] = useState<BluetoothRoom | null>(bluetoothManager.currentRoom);
  const [status, setStatus] = useState<BluetoothConnectionStatus>(bluetoothManager.status);
  const [statusMessage, setStatusMessage] = useState<string>(bluetoothManager.statusMessage);
  const [showPermissionsInfo, setShowPermissionsInfo] = useState(false);
  const [roomNameInput, setRoomNameInput] = useState(`${profile.name}'s DIDY Room`);
  const [selectedMode, setSelectedMode] = useState<'DROP_2V2' | 'DROP_4V4'>('DROP_2V2');
  const [isSearching, setIsSearching] = useState(false);

  const t = getTranslations(language);
  const isRtl = language === 'ar';

  useEffect(() => {
    bluetoothManager.setLocalPlayer(profile.name, profile.selectedCharacterId);

    const unsubscribe = bluetoothManager.subscribe((r, s, msg) => {
      setRoom(r);
      setStatus(s);
      setStatusMessage(msg);
    });

    const unsubscribeMatch = bluetoothManager.onMatchStart((mode) => {
      onStartMatch(mode);
    });

    return () => {
      unsubscribe();
      unsubscribeMatch();
    };
  }, [profile, onStartMatch]);

  const handleCreateRoom = () => {
    didyAudio.playButtonClick();
    bluetoothManager.createRoom(roomNameInput, selectedMode);
  };

  const handleStartDeviceSearch = () => {
    didyAudio.playButtonClick();
    setIsSearching(true);
    bluetoothManager.startDeviceSearch();
    setTimeout(() => setIsSearching(false), 1400);
  };

  const handleToggleReady = () => {
    didyAudio.playButtonClick();
    bluetoothManager.toggleReady();
  };

  const handleStartGame = () => {
    didyAudio.playButtonClick();
    bluetoothManager.startMatch();
  };

  const handleDisconnect = () => {
    didyAudio.playButtonClick();
    bluetoothManager.disconnect();
  };

  const localPeer = room?.players.find(p => p.id === bluetoothManager.localPeer.id) || bluetoothManager.localPeer;
  const isHost = bluetoothManager.isHost;
  const requiredPlayers = room?.maxPlayers || (selectedMode === 'DROP_2V2' ? 4 : 8);
  const canStartGame = isHost && room && room.players.length >= requiredPlayers && room.players.every(p => p.isReady);

  // Group players by Team
  const blueTeam = room?.players.filter(p => p.team === 'BLUE') || [];
  const redTeam = room?.players.filter(p => p.team === 'RED') || [];

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 md:p-6 select-none font-sans"
    >
      <div className="bg-[#0b1320] border-2 border-cyan-400/40 rounded-3xl max-w-4xl w-full p-5 md:p-7 shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col gap-5 max-h-[92vh] overflow-y-auto">
        {/* --- HEADER --- */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 shadow-md">
              <Bluetooth className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl md:text-2xl font-display font-black text-white tracking-wider">
                  {t.btTitle}
                </h2>
                <span className="bg-cyan-950 text-cyan-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-cyan-400/40">
                  {isRtl ? 'محلي 2–4 لاعبين' : 'OFFLINE 2–4 PLAYERS'}
                </span>
              </div>
              <p className="text-xs font-mono text-cyan-300">
                {t.btSubtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                didyAudio.playButtonClick();
                setShowPermissionsInfo(true);
              }}
              className="p-2.5 rounded-xl bg-slate-900 border border-cyan-500/30 text-cyan-300 hover:text-white flex items-center gap-1.5 text-xs font-mono transition-colors cursor-pointer"
              title={t.btSafetyTitle}
            >
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">{isRtl ? 'الأمان والصلاحيات' : 'Permissions & Safety'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* --- STATUS BANNER WITH DYNAMIC MESSAGES --- */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 border border-cyan-400/20 text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className={`w-3 h-3 rounded-full ${
              status === 'READY' ? 'bg-emerald-400 animate-ping' :
              status === 'SEARCHING' ? 'bg-amber-400 animate-pulse' :
              status === 'CONNECTED' ? 'bg-cyan-400' :
              status === 'DISCONNECTED' ? 'bg-rose-500' : 'bg-slate-400'
            }`} />
            <div>
              <span className="text-slate-400 uppercase tracking-widest block text-[10px]">{isRtl ? 'حالة الاتصال:' : 'Connection Status:'}</span>
              <span className="text-white font-bold text-sm tracking-wide">
                {statusMessage}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Signal className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-300 text-xs">{isRtl ? 'إشارة مباشرة بدون إنترنت' : 'RSSI: -38 dBm · Offline Direct'}</span>
          </div>
        </div>

        {/* --- MAIN LOBBY INTERFACE --- */}
        {!room ? (
          /* NO ROOM CREATED: CREATE OR JOIN LOBBY */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 py-2">
            {/* Create Room Card */}
            <div className={`p-5 rounded-3xl bg-slate-900/70 border border-white/10 flex flex-col justify-between gap-4 ${isRtl ? 'text-right' : 'text-left'}`}>
              <div>
                <div className="flex items-center gap-2 text-amber-400 mb-2">
                  <Plus className="w-5 h-5" />
                  <h3 className="text-lg font-display font-black text-white">{t.btCreateRoom}</h3>
                </div>
                <p className="text-xs text-slate-300 mb-4">
                  {isRtl ? 'استضف مباراة محلية بدون إنترنت. يمكن للأجهزة القريبة الاتصال مباشرة.' : 'Host an offline match. Nearby Android devices can connect directly without internet.'}
                </p>

                {/* Room Name Input */}
                <div className="mb-3">
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">{t.btRoomName}:</label>
                  <input
                    type="text"
                    value={roomNameInput}
                    onChange={(e) => setRoomNameInput(e.target.value)}
                    className="w-full bg-slate-950 border border-white/20 rounded-xl px-3 py-2 text-xs font-display text-white focus:outline-hidden focus:border-cyan-400"
                    placeholder={isRtl ? 'أدخل اسم الغرفة' : 'Enter Room Name'}
                  />
                </div>

                {/* Match Mode Selection: 2/2 or 4/4 */}
                <div className="mb-4">
                  <label className="text-[11px] font-mono text-slate-400 block mb-1.5">{isRtl ? 'وضع اللعبة الجماعية:' : 'MULTIPLAYER MODE:'}</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSelectedMode('DROP_2V2')}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${isRtl ? 'text-right' : 'text-left'} ${
                        selectedMode === 'DROP_2V2'
                          ? 'border-cyan-400 bg-cyan-500/20 text-white'
                          : 'border-white/10 bg-slate-950/60 text-slate-400'
                      }`}
                    >
                      <span className="text-xs font-display font-black block">{isRtl ? 'وضع 2 ضد 2' : '2/2 MODE'}</span>
                      <span className="text-[10px] font-mono">{isRtl ? '4 لاعبين · إنزال جوي' : '4 Players · 2v2 Air Drop'}</span>
                    </button>

                    <button
                      onClick={() => setSelectedMode('DROP_4V4')}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${isRtl ? 'text-right' : 'text-left'} ${
                        selectedMode === 'DROP_4V4'
                          ? 'border-amber-400 bg-amber-500/20 text-white'
                          : 'border-white/10 bg-slate-950/60 text-slate-400'
                      }`}
                    >
                      <span className="text-xs font-display font-black block">{isRtl ? 'وضع 4 ضد 4' : '4/4 MODE'}</span>
                      <span className="text-[10px] font-mono">{isRtl ? '8 لاعبين · فريق كامل' : '8 Players · Full Squad'}</span>
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCreateRoom}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-display font-black text-sm tracking-wide shadow-lg hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Radio className="w-5 h-5 fill-slate-950" />
                <span>{t.btCreateRoom}</span>
              </button>
            </div>

            {/* Discover & Join Room Card */}
            <div className={`p-5 rounded-3xl bg-slate-900/70 border border-white/10 flex flex-col justify-between gap-4 ${isRtl ? 'text-right' : 'text-left'}`}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-cyan-400">
                    <Search className="w-5 h-5" />
                    <h3 className="text-lg font-display font-black text-white">{t.btSearchDevices}</h3>
                  </div>
                  <button
                    onClick={handleStartDeviceSearch}
                    disabled={isSearching}
                    className="px-3 py-1 bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-xs font-mono rounded-lg hover:bg-cyan-900 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Radio className={`w-3.5 h-3.5 ${isSearching ? 'animate-spin' : ''}`} />
                    <span>{isSearching ? (isRtl ? 'جارٍ البحث...' : 'Scanning...') : (isRtl ? 'بحث قريب' : 'Search Nearby')}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-300 mb-3">
                  {isRtl ? 'البحث عن أجهزة أندرويد قريبة تفتح لعبة كأس ديدي عبر البلوتوث.' : 'Scan for nearby Android devices running DIDY CUP over Bluetooth.'}
                </p>

                {/* Discovered Devices List */}
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                  {bluetoothManager.discoveredDevices.length === 0 ? (
                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-dashed border-white/15 text-center text-xs text-slate-400">
                      <span>{isRtl ? 'اضغط "بحث قريب" لاكتشاف الأصدقاء أو أنشئ غرفة بالأعلى.' : 'Click "Search Nearby" to discover nearby players or create a room.'}</span>
                    </div>
                  ) : (
                    bluetoothManager.discoveredDevices.map(device => (
                      <div
                        key={device.id}
                        className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/80 border border-white/10 hover:border-cyan-400/40 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <Smartphone className="w-4 h-4 text-cyan-400" />
                          <div>
                            <span className="text-xs font-display font-bold text-white block">{device.name}</span>
                            <span className="text-[10px] font-mono text-slate-400">{device.deviceModel}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            didyAudio.playButtonClick();
                            bluetoothManager.createRoom(`${device.name}'s Party`, 'DROP_2V2');
                            bluetoothManager.addDiscoveredPeer(device);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display font-black text-xs cursor-pointer"
                        >
                          Join Device
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/50 border border-white/5 text-[11px] font-mono text-slate-400 flex items-center gap-2">
                <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Make sure Bluetooth and Location are switched ON on your Android device.</span>
              </div>
            </div>
          </div>
        ) : (
          /* ROOM CREATED: LIVE TEAM ROSTER & MATCH LAUNCH */
          <div className="flex flex-col gap-4">
            {/* Room Info Bar */}
            <div className="flex items-center justify-between p-3.5 bg-slate-950/70 rounded-2xl border border-white/10">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded-lg border border-cyan-500/30">
                  {room.mode === 'DROP_2V2' ? '2/2 MODE (4 PLAYERS)' : '4/4 MODE (8 PLAYERS)'}
                </span>
                <h3 className="text-base font-display font-black text-white">{room.name}</h3>
                <span className="text-xs font-mono text-slate-400">Host: {room.hostName}</span>
              </div>

              <div className="flex items-center gap-2">
                {isHost && (
                  <button
                    onClick={() => {
                      didyAudio.playButtonClick();
                      bluetoothManager.fillRemainingWithBots();
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono rounded-xl border border-white/15 cursor-pointer"
                  >
                    {isRtl ? '+ إضافة بوتات' : '+ Fill Bots'}
                  </button>
                )}
                <button
                  onClick={handleDisconnect}
                  className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-300 text-xs font-mono rounded-xl cursor-pointer"
                >
                  {t.btDisconnect}
                </button>
              </div>
            </div>

            {/* Team Roster Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* BLUE TEAM (Squad 1) */}
              <div className="p-4 rounded-3xl bg-blue-950/30 border border-blue-400/30 flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-blue-400/20 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                    <h4 className="text-sm font-display font-black text-blue-300">{t.btTeamBlue} ({blueTeam.length})</h4>
                  </div>
                  {localPeer.team !== 'BLUE' && (
                    <button
                      onClick={() => bluetoothManager.setTeam('BLUE')}
                      className="text-[11px] font-mono text-blue-300 hover:underline cursor-pointer"
                    >
                      {isRtl ? 'انضمام للأزرق' : 'Switch to Blue'}
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  {blueTeam.map(player => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-white/5"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/40 flex items-center justify-center font-display font-black text-blue-300 text-xs">
                          {player.name[0]}
                        </div>
                        <div className={isRtl ? 'text-right' : 'text-left'}>
                          <div className="flex items-center gap-1.5">
                         
              </button>
            </div>
          </div>
        )}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-display font-bold text-white">{player.name}</span>
                            {player.isHost && (
                              <span className="text-[9px] font-mono bg-amber-400/20 text-amber-300 px-1 rounded">HOST</span>
                            )}
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">{player.deviceModel}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          player.isReady ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {player.isReady ? 'READY' : 'WAITING'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Controls: Ready Button & Host Start Game Button */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
              <button
                onClick={handleToggleReady}
                className={`py-3 px-6 rounded-2xl font-display font-black text-xs tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                  localPeer.isReady
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md'
                    : 'bg-slate-800 hover:bg-slate-700 text-white border border-white/20'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{localPeer.isReady ? 'READY (CLICK TO CANCEL)' : 'SET READY'}</span>
              </button>

              {isHost && (
                <button
                  onClick={handleStartGame}
                  disabled={!canStartGame}
                  className={`py-3.5 px-8 rounded-2xl font-display font-black text-sm tracking-wider transition-all flex items-center gap-2.5 ${
                    canStartGame
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-slate-950 shadow-[0_0_30px_rgba(245,158,11,0.5)] cursor-pointer'
                      : 'bg-slate-800 text-slate-500 border border-white/10 cursor-not-allowed'
                  }`}
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>START GAME</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* --- BLUETOOTH SAFETY & PERMISSIONS DRAWER --- */}
        {showPermissionsInfo && (
          <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0b1320] border-2 border-cyan-400/50 rounded-3xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Shield className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-lg font-display font-black text-white">BLUETOOTH PERMISSIONS & SAFETY</h3>
                </div>
                <button
                  onClick={() => setShowPermissionsInfo(false)}
                  className="p-1.5 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-xs text-slate-300 flex flex-col gap-3 font-sans leading-relaxed">
                <div className="p-3 bg-cyan-950/40 border border-cyan-400/30 rounded-2xl">
                  <span className="font-bold text-cyan-300 block mb-1">Why Bluetooth is Needed:</span>
                  Bluetooth is used solely to discover and connect with nearby Android devices for offline multiplayer without consuming mobile cellular data or requiring an internet connection.
                </div>

                <div>
                  <span className="font-bold text-white block mb-1">Android Permissions Requested:</span>
                  <ul className="list-disc pl-5 space-y-1 text-slate-400 font-mono text-[11px]">
                    <li><strong className="text-slate-200">BLUETOOTH_SCAN:</strong> To discover nearby DIDY CUP players.</li>
                    <li><strong className="text-slate-200">BLUETOOTH_CONNECT:</strong> To exchange team positions and scores.</li>
                    <li><strong className="text-slate-200">ACCESS_FINE_LOCATION:</strong> Required on Android 11 and older to detect nearby Bluetooth hardware beacons.</li>
                  </ul>
                </div>

                <div className="p-3 bg-slate-900 border border-white/10 rounded-2xl">
                  <span className="font-bold text-white block mb-1">Troubleshooting Tips:</span>
                  <ul className="list-disc pl-5 space-y-0.5 text-slate-400 text-[11px]">
                    <li>Ensure Bluetooth is toggled ON in Android Quick Settings.</li>
                    <li>Keep devices within 10 meters of each other.</li>
                    <li>If Bluetooth is unavailable, the game automatically switches to an offline local hotspot mesh network without interruption!</li>
                  </ul>
                </div>
              </div>

              <button
                onClick={() => setShowPermissionsInfo(false)}
                className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display font-bold text-xs"
              >
                GOT IT
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
