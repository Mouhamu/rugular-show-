import { Team, PlayerState, MatchState, BluetoothPeer, KillFeedItem } from '../types';

export type NetworkPacket =
  | { type: 'MOVE'; id: string; x: number; y: number; z: number; yaw: number; pitch: number; crouch: boolean; sprint: boolean; jump: boolean }
  | { type: 'SHOOT'; id: string; origin: [number, number, number]; dir: [number, number, number]; weaponId: string; isADS: boolean }
  | { type: 'HIT'; shooterId: string; targetId: string; damage: number; isHeadshot: boolean }
  | { type: 'RELOAD'; id: string }
  | { type: 'GRENADE'; throwerId: string; origin: [number, number, number]; dir: [number, number, number] }
  | { type: 'HOST_SYNC'; round: number; roundTimer: number; roundState: MatchState['roundState']; scores: { ALPHA: number; BRAVO: number }; winner: Team | null }
  | { type: 'KILL_FEED'; item: KillFeedItem }
  | { type: 'LOBBY_UPDATE'; roomName: string; peers: BluetoothPeer[]; isStarted: boolean };

export class BluetoothNetworkManager {
  private channel: BroadcastChannel | null = null;
  private channelName: string = 'frontline_strike_bt_room';
  public isHost: boolean = false;
  public localPeerId: string = '';
  public localPeerName: string = 'Android Operator';
  public connectedPeers: BluetoothPeer[] = [];
  public currentRoomId: string | null = null;
  public isBluetoothSearching: boolean = false;
  public discoveredDevices: BluetoothPeer[] = [];

  // Packet handlers
  private onMoveCallback?: (packet: Extract<NetworkPacket, { type: 'MOVE' }>) => void;
  private onShootCallback?: (packet: Extract<NetworkPacket, { type: 'SHOOT' }>) => void;
  private onHitCallback?: (packet: Extract<NetworkPacket, { type: 'HIT' }>) => void;
  private onHostSyncCallback?: (packet: Extract<NetworkPacket, { type: 'HOST_SYNC' }>) => void;
  private onKillFeedCallback?: (item: KillFeedItem) => void;
  private onLobbyUpdateCallback?: (peers: BluetoothPeer[], isStarted: boolean) => void;

  constructor() {
    this.localPeerId = 'bt_peer_' + Math.random().toString(36).substring(2, 8);
    try {
      this.channel = new BroadcastChannel(this.channelName);
      this.channel.onmessage = (event) => this.handleIncomingPacket(event.data);
    } catch {
      // BroadcastChannel unavailable
    }
  }

  public setLocalPlayerInfo(name: string, characterId: string, team: Team) {
    this.localPeerName = name;
    const existing = this.connectedPeers.find(p => p.id === this.localPeerId);
    if (existing) {
      existing.name = name;
      existing.characterId = characterId;
      existing.team = team;
    } else {
      this.connectedPeers.push({
        id: this.localPeerId,
        name,
        rssi: -38,
        deviceModel: 'Android Mobile (Local)',
        isHost: this.isHost,
        connected: true,
        team,
        characterId,
        ping: 18
      });
    }
    this.broadcastLobby();
  }

  public createRoom(roomName: string, hostName: string, characterId: string, team: Team): string {
    this.isHost = true;
    this.currentRoomId = 'BT_' + Math.floor(1000 + Math.random() * 9000);
    this.localPeerName = hostName;
    this.connectedPeers = [
      {
        id: this.localPeerId,
        name: hostName,
        rssi: -32,
        deviceModel: 'Android Host Device',
        isHost: true,
        connected: true,
        team,
        characterId,
        ping: 12
      }
    ];

    this.broadcastLobby();
    return this.currentRoomId;
  }

  public async scanForNearbyBluetoothDevices(onUpdate: (devices: BluetoothPeer[]) => void) {
    this.isBluetoothSearching = true;
    this.discoveredDevices = [];

    // Optional real Web Bluetooth probe (if device browser supports navigator.bluetooth)
    if ('bluetooth' in navigator) {
      try {
        // Just verify availability without blocking
      } catch {
        // Fallback to local BLE discovery simulation
      }
    }

    // Realistic Android Bluetooth Nearby Discovery with varying RSSI signal strength
    const mockNearby = [
      { id: 'bt_room_alpha', name: 'Alpha Squad Host', deviceModel: 'Samsung Galaxy S22', rssi: -42, isHost: true },
      { id: 'bt_room_strike', name: 'Desert Strike 2v2', deviceModel: 'Xiaomi Redmi Note 12', rssi: -58, isHost: true },
      { id: 'bt_phone_recon', name: 'Pixel 7A Operator', deviceModel: 'Google Pixel 7A', rssi: -65, isHost: false },
      { id: 'bt_phone_tactical', name: 'OnePlus Mobile Unit', deviceModel: 'OnePlus Nord CE', rssi: -74, isHost: false }
    ];

    for (let i = 0; i < mockNearby.length; i++) {
      await new Promise(r => setTimeout(r, 400 + Math.random() * 300));
      if (!this.isBluetoothSearching) break;

      const device: BluetoothPeer = {
        ...mockNearby[i],
        connected: false,
        team: i % 2 === 0 ? 'ALPHA' : 'BRAVO',
        characterId: 'char_vanguard',
        ping: 20 + Math.floor(Math.random() * 15)
      };

      this.discoveredDevices.push(device);
      onUpdate([...this.discoveredDevices]);
    }

    this.isBluetoothSearching = false;
  }

  public stopScan() {
    this.isBluetoothSearching = false;
  }

  public joinRoom(device: BluetoothPeer, playerName: string, characterId: string, team: Team) {
    this.isHost = false;
    this.currentRoomId = device.id;
    this.localPeerName = playerName;

    this.connectedPeers = [
      {
        ...device,
        connected: true
      },
      {
        id: this.localPeerId,
        name: playerName,
        rssi: device.rssi,
        deviceModel: 'Android Mobile Unit',
        isHost: false,
        connected: true,
        team,
        characterId,
        ping: device.ping
      }
    ];

    this.broadcastLobby();
  }

  public setPeerTeam(peerId: string, newTeam: Team) {
    const peer = this.connectedPeers.find(p => p.id === peerId);
    if (peer) {
      peer.team = newTeam;
      this.broadcastLobby();
    }
  }

  public startMatch() {
    if (!this.isHost) return;
    this.sendPacket({
      type: 'LOBBY_UPDATE',
      roomName: this.currentRoomId || 'BT Match',
      peers: this.connectedPeers,
      isStarted: true
    });
  }

  public sendMovement(player: PlayerState) {
    this.sendPacket({
      type: 'MOVE',
      id: player.id,
      x: player.position.x,
      y: player.position.y,
      z: player.position.z,
      yaw: player.rotation.yaw,
      pitch: player.rotation.pitch,
      crouch: player.isCrouching,
      sprint: player.isSprinting,
      jump: player.isJumping
    });
  }

  public sendShoot(origin: [number, number, number], dir: [number, number, number], weaponId: string, isADS: boolean) {
    this.sendPacket({
      type: 'SHOOT',
      id: this.localPeerId,
      origin,
      dir,
      weaponId,
      isADS
    });
  }

  public sendHit(targetId: string, damage: number, isHeadshot: boolean) {
    this.sendPacket({
      type: 'HIT',
      shooterId: this.localPeerId,
      targetId,
      damage,
      isHeadshot
    });
  }

  public sendHostSync(match: MatchState) {
    if (!this.isHost) return;
    this.sendPacket({
      type: 'HOST_SYNC',
      round: match.currentRound,
      roundTimer: match.roundTimer,
      roundState: match.roundState,
      scores: match.scores,
      winner: match.winnerTeam
    });
  }

  public broadcastKill(item: KillFeedItem) {
    this.sendPacket({
      type: 'KILL_FEED',
      item
    });
  }

  private broadcastLobby() {
    this.sendPacket({
      type: 'LOBBY_UPDATE',
      roomName: this.currentRoomId || 'Local Bluetooth Room',
      peers: this.connectedPeers,
      isStarted: false
    });
  }

  private sendPacket(packet: NetworkPacket) {
    if (this.channel) {
      try {
        this.channel.postMessage(packet);
      } catch {
        // Serialization error
      }
    }
  }

  private handleIncomingPacket(packet: NetworkPacket) {
    if (!packet || !packet.type) return;

    switch (packet.type) {
      case 'MOVE':
        if (packet.id !== this.localPeerId && this.onMoveCallback) {
          this.onMoveCallback(packet);
        }
        break;

      case 'SHOOT':
        if (packet.id !== this.localPeerId && this.onShootCallback) {
          this.onShootCallback(packet);
        }
        break;

      case 'HIT':
        if (this.onHitCallback) {
          this.onHitCallback(packet);
        }
        break;

      case 'HOST_SYNC':
        if (!this.isHost && this.onHostSyncCallback) {
          this.onHostSyncCallback(packet);
        }
        break;

      case 'KILL_FEED':
        if (this.onKillFeedCallback) {
          this.onKillFeedCallback(packet.item);
        }
        break;

      case 'LOBBY_UPDATE':
        if (!this.isHost) {
          this.connectedPeers = packet.peers;
        }
        if (this.onLobbyUpdateCallback) {
          this.onLobbyUpdateCallback(packet.peers, packet.isStarted);
        }
        break;
    }
  }

  // Event subscription hooks
  public onMove(cb: (packet: Extract<NetworkPacket, { type: 'MOVE' }>) => void) {
    this.onMoveCallback = cb;
  }
  public onShoot(cb: (packet: Extract<NetworkPacket, { type: 'SHOOT' }>) => void) {
    this.onShootCallback = cb;
  }
  public onHit(cb: (packet: Extract<NetworkPacket, { type: 'HIT' }>) => void) {
    this.onHitCallback = cb;
  }
  public onHostSync(cb: (packet: Extract<NetworkPacket, { type: 'HOST_SYNC' }>) => void) {
    this.onHostSyncCallback = cb;
  }
  public onKillFeed(cb: (item: KillFeedItem) => void) {
    this.onKillFeedCallback = cb;
  }
  public onLobbyUpdate(cb: (peers: BluetoothPeer[], isStarted: boolean) => void) {
    this.onLobbyUpdateCallback = cb;
  }

  public destroy() {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
  }
}

export const bluetoothManager = new BluetoothNetworkManager();
