import React, { useState, useEffect } from 'react';
import { BluetoothPeer, Team, PlayerProfile } from '../types';
import { bluetoothManager } from '../network/bluetoothManager';
import { CHARACTERS } from '../data/gameData';
import { Bluetooth, Wifi, Users, Shield, RefreshCw, Play, ArrowLeft, Radio, Check } from 'lucide-react';

interface BluetoothLobbyProps {
  profile: PlayerProfile;
  onStartMatch: (isHost: boolean, team: Team, characterId: string, botFillCount: number) => void;
  onBack: () => void;
  onOpenLoadout: () => void;
}

export const BluetoothLobby: React.FC<BluetoothLobbyProps> = ({
  profile,
  onStartMatch,
  onBack,
  onOpenLoadout
}) => {
  const [activeTab, setActiveTab] = useState<'HOST' | 'JOIN'>('HOST');
  const [roomName, setRoomName] = useState(`${profile.name}'s Match`);
  const [selectedTeam, setSelectedTeam] = useState<Team>('ALPHA');
  const [selectedCharId, setSelectedCharId] = useState(profile.selectedCharacterId);
  const [botFillCount, setBotFillCount] = useState<number>(3); // Total 4 players (1 human + 3 bots or other peers)
  const [isScanning, setIsScanning] = useState(false);
  const [discoveredRooms, setDiscoveredRooms] = useState<BluetoothPeer[]>([]);
  const [connectedPeers, setConnectedPeers] = useState<BluetoothPeer[]>([]);
  const [isInRoom, setIsInRoom] = useState(false);
  const [isHost, setIsHost] = useState(true);

  useEffect(() => {
    bluetoothManager.setLocalPlayerInfo(profile.name, selectedCharId, selectedTeam);

    bluetoothManager.onLobbyUpdate((peers, isStarted) => {
      setConnectedPeers(peers);
      if (isStarted) {
        onStartMatch(false, selectedTeam, selectedCharId, 0);
      }
    });

    return () => {
      bluetoothManager.stopScan();
    };
  }, [profile.name, selectedCharId, selectedTeam, onStartMatch]);

  const handleCreateRoom = () => {
    setIsHost(true);
    const roomId = bluetoothManager.createRoom(roomName, profile.name, selectedCharId, selectedTeam);
    setConnectedPeers(bluetoothManager.connectedPeers);
    setIsInRoom(true);
  };

  const handleStartScan = async () => {
    setIsScanning(true);
    await bluetoothManager.scanForNearbyBluetoothDevices((devices) => {
      setDiscoveredRooms(devices);
    });
    setIsScanning(false);
  };

  const handleJoinDevice = (device: BluetoothPeer) => {
    setIsHost(false);
    bluetoothManager.joinRoom(device, profile.name, selectedCharId, selectedTeam);
    setConnectedPeers(bluetoothManager.connectedPeers);
    setIsInRoom(true);
  };

  const handleLaunchMatch = () => {
    if (isHost) {
      bluetoothManager.startMatch();
      onStartMatch(true, selectedTeam, selectedCharId, botFillCount);
    }
  };

  const selectedChar = CHARACTERS.find(c => c.id === selectedCharId) || CHARACTERS[0];

  return (
    <div className="fixed inset-0 z-40 bg-[#080b0f] flex flex-col justify-between p-4 md:p-6 select-none overflow-y-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Bluetooth className="w-5 h-5 text-cyan-400" />
              <h1 className="text-xl font-display font-bold text-white tracking-wider">
                BLUETOOTH LOCAL MULTIPLAYER
              </h1>
            </div>
            <p className="text-xs font-mono text-slate-400">
              Direct peer connection · 100% Offline gameplay · Low latency protocol
            </p>
          </div>
        </div>

        {/* Tab switch (Host vs Join) */}
        {!isInRoom && (
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-white/10 rounded-xl">
            <button
              onClick={() => setActiveTab('HOST')}
              className={`px-5 py-2 rounded-lg text-xs font-display font-bold transition-all ${
                activeTab === 'HOST' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              CREATE ROOM (HOST)
            </button>
            <button
              onClick={() => {
                setActiveTab('JOIN');
                handleStartScan();
              }}
              className={`px-5 py-2 rounded-lg text-xs font-display font-bold transition-all ${
                activeTab === 'JOIN' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              SEARCH NEARBY
            </button>
          </div>
        )}
      </div>

      {/* Main Container */}
      {!isInRoom ? (
        <div className="flex-1 my-6 max-w-4xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Player & Team Configuration */}
          <div className="flex flex-col gap-5 bg-slate-900/60 border border-white/10 p-6 rounded-3xl backdrop-blur-md">
            <h2 className="text-sm font-mono text-cyan-400 uppercase tracking-wider font-semibold">
              01. OPERATOR & SQUAD SETUP
            </h2>

            {/* Team Selection: Alpha vs Bravo */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-mono text-slate-400">Choose Team:</span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedTeam('ALPHA')}
                  className={`p-4 rounded-2xl border flex flex-col items-center gap-1 transition-all ${
                    selectedTeam === 'ALPHA'
                      ? 'border-blue-400 bg-blue-500/20 ring-2 ring-blue-500/40'
                      : 'border-white/10 bg-slate-950/60 hover:border-white/20'
                  }`}
                >
                  <span className="text-xs font-display font-bold text-blue-400 tracking-wider">TEAM ALPHA</span>
                  <span className="text-[10px] font-mono text-slate-300">Blue Vanguard</span>
                </button>

                <button
                  onClick={() => setSelectedTeam('BRAVO')}
                  className={`p-4 rounded-2xl border flex flex-col items-center gap-1 transition-all ${
                    selectedTeam === 'BRAVO'
                      ? 'border-rose-400 bg-rose-500/20 ring-2 ring-rose-500/40'
                      : 'border-white/10 bg-slate-950/60 hover:border-white/20'
                  }`}
                >
                  <span className="text-xs font-display font-bold text-rose-400 tracking-wider">TEAM BRAVO</span>
                  <span className="text-[10px] font-mono text-slate-300">Red Strike</span>
                </button>
              </div>
            </div>

            {/* Character Selector */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-mono text-slate-400">Select Character:</span>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {CHARACTERS.map(c => {
                  const isSelected = c.id === selectedCharId;
                  const isUnlocked = profile.unlockedCharacterIds.includes(c.id);

                  return (
                    <div
                      key={c.id}
                      onClick={() => isUnlocked && setSelectedCharId(c.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                        isUnlocked ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'
                      } ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-500/20 text-white'
                          : 'border-white/10 bg-slate-950/40 text-slate-300 hover:border-white/20'
                      }`}
                    >
                      <div>
                        <span className="font-display font-bold block">{c.callsign}</span>
                        <span className="text-[10px] font-mono text-slate-400">{c.role}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Loadout button */}
            <button
              onClick={onOpenLoadout}
              className="mt-auto py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-display font-bold text-white border border-white/10 transition-colors flex items-center justify-center gap-2"
            >
              <span>CUSTOMIZE WEAPON LOADOUT</span>
            </button>
          </div>

          {/* Right Column: Host or Join Actions */}
          <div className="flex flex-col gap-5 bg-slate-900/60 border border-white/10 p-6 rounded-3xl backdrop-blur-md justify-between">
            {activeTab === 'HOST' ? (
              <>
                <div className="flex flex-col gap-4">
                  <h2 className="text-sm font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                    02. CREATE LOCAL ROOM
                  </h2>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-mono text-slate-400">Room Name:</label>
                    <input
                      type="text"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      className="px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-sm font-mono text-white focus:outline-hidden focus:border-cyan-400"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-mono text-slate-400">Tactical Match Fill (Bots):</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[0, 1, 2, 3].map(cnt => (
                        <button
                          key={cnt}
                          onClick={() => setBotFillCount(cnt)}
                          className={`py-2 rounded-xl text-xs font-mono font-bold border transition-colors ${
                            botFillCount === cnt
                              ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                              : 'bg-slate-950 text-slate-300 border-white/10'
                          }`}
                        >
                          {cnt === 0 ? 'No Bots' : `+${cnt} Bots`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 text-xs text-slate-300 leading-relaxed">
                    Hosting enables your mobile device as the local authoritative match coordinator. Other nearby phones connect directly via Bluetooth without needing an internet router.
                  </div>
                </div>

                <button
                  onClick={handleCreateRoom}
                  className="w-full py-4 rounded-2xl text-sm font-display font-bold tracking-wider text-slate-950 bg-cyan-400 hover:bg-cyan-300 shadow-xl transition-all cursor-pointer"
                >
                  CREATE BLUETOOTH ROOM
                </button>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                      02. NEARBY BLUETOOTH DEVICES
                    </h2>
                    <button
                      onClick={handleStartScan}
                      disabled={isScanning}
                      className="flex items-center gap-1.5 text-xs font-mono text-slate-300 hover:text-white"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-cyan-400' : ''}`} />
                      Scan
                    </button>
                  </div>

                  {/* Discovered Rooms List */}
                  <div className="flex flex-col gap-2.5 max-h-72 overflow-y-auto pr-1">
                    {discoveredRooms.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-500 font-mono">
                        {isScanning ? 'Searching for nearby Bluetooth hosts...' : 'No Bluetooth rooms found nearby.'}
                      </div>
                    ) : (
                      discoveredRooms.map(dev => (
                        <div
                          key={dev.id}
                          className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 border border-white/10 hover:border-cyan-400/50 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
                            <div>
                              <span className="text-sm font-display font-bold text-white block">{dev.name}</span>
                              <span className="text-[10px] font-mono text-slate-400">
                                {dev.deviceModel} · {dev.rssi} dBm · {dev.ping}ms
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleJoinDevice(dev)}
                            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-display font-bold rounded-xl shadow-md transition-colors"
                          >
                            JOIN
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 font-mono">
                  Make sure nearby devices have Bluetooth turned on and are in the Create Room screen.
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        /* IN ROOM / LOBBY ROSTER SCREEN */
        <div className="flex-1 my-6 max-w-4xl w-full mx-auto flex flex-col gap-6 bg-slate-900/60 border border-white/10 p-6 md:p-8 rounded-3xl backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
                ROOM CONNECTED · BT DIRECT
              </span>
              <h2 className="text-2xl font-display font-black text-white mt-1">{roomName}</h2>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              OFFLINE BLUETOOTH MESH ACTIVE
            </div>
          </div>

          {/* Roster Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Team Alpha Slot */}
            <div className="p-4 rounded-2xl border border-blue-500/30 bg-blue-950/20 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-blue-500/20 pb-2">
                <span className="text-xs font-display font-bold text-blue-400 tracking-wider">TEAM ALPHA</span>
                <span className="text-[10px] font-mono text-blue-300">Vanguard Strike</span>
              </div>
              <div className="flex flex-col gap-2">
                {connectedPeers.filter(p => p.team === 'ALPHA').map(peer => (
                  <div key={peer.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-400" />
                      <span className="text-xs font-semibold text-white">{peer.name}</span>
                      {peer.isHost && <span className="text-[9px] font-mono bg-blue-900 text-blue-200 px-1 rounded">HOST</span>}
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{peer.ping}ms</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Bravo Slot */}
            <div className="p-4 rounded-2xl border border-rose-500/30 bg-rose-950/20 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-rose-500/20 pb-2">
                <span className="text-xs font-display font-bold text-rose-400 tracking-wider">TEAM BRAVO</span>
                <span className="text-[10px] font-mono text-rose-300">Red Assault</span>
              </div>
              <div className="flex flex-col gap-2">
                {connectedPeers.filter(p => p.team === 'BRAVO').map(peer => (
                  <div key={peer.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-400" />
                      <span className="text-xs font-semibold text-white">{peer.name}</span>
                      {peer.isHost && <span className="text-[9px] font-mono bg-rose-900 text-rose-200 px-1 rounded">HOST</span>}
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{peer.ping}ms</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-auto">
            <button
              onClick={() => setIsInRoom(false)}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/30 transition-colors"
            >
              Leave Room
            </button>

            {isHost ? (
              <button
                onClick={handleLaunchMatch}
                className="px-8 py-3 rounded-2xl text-sm font-display font-bold tracking-wider text-slate-950 bg-cyan-400 hover:bg-cyan-300 shadow-2xl transition-all cursor-pointer flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                START BATTLE ({connectedPeers.length} Players + {botFillCount} Bots)
              </button>
            ) : (
              <div className="text-xs font-mono text-amber-400 animate-pulse">
                Waiting for room host to initiate combat...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-white/5 pt-3">
        <span>FRONTLINE STRIKE 3D · BLUETOOTH ENGINE v2.4</span>
        <span>PEER PACKETS: LIGHTWEIGHT STREAMING</span>
      </div>
    </div>
  );
};
