import React, { useState, useEffect, useRef } from 'react';
import { sound } from './audio/SoundEngine';
import { GameScene } from './game/engine/GameScene';
import {
  AudioSettings,
  ControlSettings,
  GameState,
  GraphicsSettings,
  InventoryItem,
  Objective,
  PlayerStats,
} from './types/game';
import { VirtualControls } from './ui/VirtualControls';
import { HUD } from './ui/HUD';
import { MainMenu } from './ui/MainMenu';
import { PauseModal } from './ui/PauseModal';
import { InventoryModal } from './ui/InventoryModal';
import { PuzzleModal } from './ui/PuzzleModal';
import { NoteInspectModal } from './ui/NoteInspectModal';
import { GameOverModal } from './ui/GameOverModal';
import { EndingModal } from './ui/EndingModal';
import { SettingsModal } from './ui/SettingsModal';
import { ChaptersModal } from './ui/ChaptersModal';
import { ControlsGuideModal } from './ui/ControlsGuideModal';

const OBJECTIVES: Objective[] = [
  {
    id: 'obj_1',
    title: 'Escape Room 402',
    description: 'Find your flashlight, 9V battery, and the Ward 4 Key inside Room 402.',
    completed: false,
  },
  {
    id: 'obj_2',
    title: 'Search Nurse Station',
    description: "Use the Brass Key to unlock the Nurse's Station and find pharmacy code memos.",
    completed: false,
  },
  {
    id: 'obj_3',
    title: 'Restore Auxiliary Breaker',
    description: 'Rebalance the 480V circuit breaker switches in Closet 4B to power magnetic doors.',
    completed: false,
  },
  {
    id: 'obj_4',
    title: 'Unlock Pharmacy (Code: 4812)',
    description: 'Enter the security code on the Pharmacy keypad and retrieve the Morgue Keycard.',
    completed: false,
  },
  {
    id: 'obj_5',
    title: 'Recover Ambulance Key in Morgue',
    description: 'Swipe the keycard at the Morgue entrance and recover the Ambulance ignition key.',
    completed: false,
  },
  {
    id: 'obj_6',
    title: 'Escape to Ambulance Bay',
    description: 'Sprint to the rear storm bay doors and start the ambulance engine!',
    completed: false,
  },
];

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const gameSceneRef = useRef<GameScene | null>(null);

  // Core Game State
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [hasSaveGame, setHasSaveGame] = useState<boolean>(false);

  // Settings
  const [graphicsSettings, setGraphicsSettings] = useState<GraphicsSettings>({
    preset: 'high',
    fpsCap: 60,
    shadows: true,
    renderScale: 1.0,
    filmGrain: true,
    vignette: true,
    particles: true,
  });

  const [controlSettings, setControlSettings] = useState<ControlSettings>({
    touchSensitivity: 1.2,
    invertY: false,
    hapticsEnabled: true,
    joystickDynamic: false,
  });

  const [audioSettings, setAudioSettings] = useState<AudioSettings>({
    masterVolume: 0.8,
    sfxVolume: 0.9,
    musicVolume: 0.65,
  });

  // Modal Toggles
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showChapters, setShowChapters] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(false);

  // In-Game State
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [currentObjIdx, setCurrentObjIdx] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeInteractive, setActiveInteractive] = useState<any>(null);
  const [timeSurvived, setTimeSurvived] = useState<number>(0);

  // Sub-Modals
  const [activePuzzle, setActivePuzzle] = useState<'breaker' | 'keypad' | null>(null);
  const [puzzleData, setPuzzleData] = useState<any>(null);
  const [inspectNote, setInspectNote] = useState<any>(null);

  // Player Stats for HUD
  const [playerStats, setPlayerStats] = useState<PlayerStats>({
    health: 100,
    stamina: 100,
    sanity: 100,
    flashlightOn: true,
    battery: 85,
    isCrouching: false,
    isSprinting: false,
    isHiding: false,
  });

  const [monsterDistance, setMonsterDistance] = useState<number>(999);

  // Keyboard Movement State (Desktop fallback)
  const keysDown = useRef<{ [key: string]: boolean }>({});
  const moveInput = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Check saved game in localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('the_last_night_save');
      if (saved) {
        setHasSaveGame(true);
      }
    } catch {}
  }, []);

  // Initialize GameScene once
  useEffect(() => {
    if (!canvasMountRef.current) return;

    const scene = new GameScene(canvasMountRef.current, graphicsSettings);
    gameSceneRef.current = scene;

    scene.onPlayerCaught = () => {
      setGameState('GAME_OVER');
      sound.stopDarkAmbience();
    };

    scene.onEndingReached = () => {
      setGameState('VICTORY');
      sound.stopDarkAmbience();
    };

    scene.onInteractiveChange = (target) => {
      setActiveInteractive(target);
    };

    const handleResize = () => {
      if (canvasMountRef.current && gameSceneRef.current) {
        gameSceneRef.current.resize(
          canvasMountRef.current.clientWidth,
          canvasMountRef.current.clientHeight
        );
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      scene.dispose();
      gameSceneRef.current = null;
    };
  }, []);

  // Update Settings in GameScene
  useEffect(() => {
    if (gameSceneRef.current) {
      gameSceneRef.current.updateSettings(graphicsSettings);
    }
  }, [graphicsSettings]);

  // Update Audio Volumes
  useEffect(() => {
    sound.updateVolumes(
      audioSettings.masterVolume,
      audioSettings.sfxVolume,
      audioSettings.musicVolume
    );
  }, [audioSettings]);

  // Game Loop Poller for HUD & Desktop controls
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    let timerId: number;
    let secCounter = 0;

    const pollStats = () => {
      if (gameSceneRef.current) {
        const p = gameSceneRef.current.player;
        const m = gameSceneRef.current.monster;

        setPlayerStats({ ...p.stats });
        setMonsterDistance(m.distanceToPlayer);

        // Update movement from keyboard if keys down
        if (
          keysDown.current['KeyW'] ||
          keysDown.current['KeyS'] ||
          keysDown.current['KeyA'] ||
          keysDown.current['KeyD']
        ) {
          let kx = 0;
          let ky = 0;
          if (keysDown.current['KeyW']) ky += 1;
          if (keysDown.current['KeyS']) ky -= 1;
          if (keysDown.current['KeyD']) kx += 1;
          if (keysDown.current['KeyA']) kx -= 1;
          p.update(0.016, { x: kx, y: ky });
        } else {
          p.update(0.016, moveInput.current);
        }
      }

      secCounter += 0.05;
      if (secCounter >= 1.0) {
        setTimeSurvived((t) => t + 1);
        secCounter = 0;
      }

      timerId = requestAnimationFrame(pollStats);
    };

    timerId = requestAnimationFrame(pollStats);
    return () => cancelAnimationFrame(timerId);
  }, [gameState]);

  // Desktop Keyboard and Pointer Lock controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysDown.current[e.code] = true;

      if (e.code === 'KeyF' && gameState === 'PLAYING') {
        gameSceneRef.current?.player.toggleFlashlight();
      }
      if (e.code === 'KeyC' && gameState === 'PLAYING') {
        gameSceneRef.current?.player.toggleCrouch();
      }
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        gameSceneRef.current?.player.setSprinting(true);
      }
      if (e.code === 'KeyE' && gameState === 'PLAYING') {
        handleInteract();
      }
      if (e.code === 'Tab' && gameState === 'PLAYING') {
        e.preventDefault();
        setGameState('INVENTORY');
      }
      if (e.code === 'Escape') {
        if (gameState === 'PLAYING') setGameState('PAUSED');
        else if (gameState === 'PAUSED' || gameState === 'INVENTORY') setGameState('PLAYING');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysDown.current[e.code] = false;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        gameSceneRef.current?.player.setSprinting(false);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement && gameSceneRef.current && gameState === 'PLAYING') {
        const deltaX = e.movementX * 0.0025 * controlSettings.touchSensitivity;
        const deltaY = e.movementY * 0.0025 * controlSettings.touchSensitivity;
        gameSceneRef.current.player.rotateCamera(deltaX, deltaY, controlSettings.invertY);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [gameState, controlSettings, activeInteractive, inventory]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  const startNewGame = () => {
    setInventory([]);
    setCurrentObjIdx(0);
    setTimeSurvived(0);
    gameSceneRef.current?.restartGame();
    gameSceneRef.current?.startLoop();
    sound.startDarkAmbience();
    setGameState('PLAYING');
    showToast('Objective: Search Room 402 for flashlight and Ward 4 Key.');
  };

  const continueGame = () => {
    try {
      const saved = localStorage.getItem('the_last_night_save');
      if (saved) {
        const data = JSON.parse(saved);
        setInventory(data.inventory || []);
        setCurrentObjIdx(data.currentObjIdx || 0);
        setTimeSurvived(data.timeSurvived || 0);
      }
    } catch {}
    gameSceneRef.current?.startLoop();
    sound.startDarkAmbience();
    setGameState('PLAYING');
    showToast('Checkpoint Loaded.');
  };

  const saveCheckpoint = (newObjIdx: number, newInv: InventoryItem[]) => {
    try {
      localStorage.setItem(
        'the_last_night_save',
        JSON.stringify({
          currentObjIdx: newObjIdx,
          inventory: newInv,
          timeSurvived,
        })
      );
      setHasSaveGame(true);
    } catch {}
  };

  const handleInteract = () => {
    if (!gameSceneRef.current) return;

    const invIds = inventory.map((i) => i.id);
    const res = gameSceneRef.current.handleInteract(invIds);

    if (res.message) {
      showToast(res.message);
    }

    if (res.type === 'item_picked' && res.data) {
      const newInv = [...inventory, res.data];
      setInventory(newInv);
      showToast(`Added to inventory: ${res.data.name}`);

      // Check objective progression
      if (res.data.id === 'key_ward4' && currentObjIdx === 0) {
        setCurrentObjIdx(1);
        saveCheckpoint(1, newInv);
        showToast('Objective updated: Search Nurse Station.');
      } else if (res.data.id === 'morgue_keycard' && currentObjIdx <= 3) {
        setCurrentObjIdx(4);
        saveCheckpoint(4, newInv);
        showToast('Objective updated: Unlock Sub-Basement Morgue.');
      } else if (res.data.id === 'ambulance_key' && currentObjIdx <= 4) {
        setCurrentObjIdx(5);
        saveCheckpoint(5, newInv);
        showToast('Objective updated: Escape to the ambulance bay!');
      }
    } else if (res.type === 'note_inspect' && res.data) {
      setInspectNote(res.data);
      setGameState('NOTE_INSPECT');

      // Add to evidence inventory
      const docItem: InventoryItem = {
        id: `note_${Date.now()}`,
        name: res.data.title,
        description: res.data.text.slice(0, 80) + '...',
        category: 'document',
        icon: 'file-text',
        content: res.data.text,
      };
      if (!inventory.some((i) => i.name === docItem.name)) {
        setInventory([...inventory, docItem]);
      }
    } else if (res.type === 'breaker_puzzle') {
      setActivePuzzle('breaker');
      setPuzzleData(res.data);
      setGameState('PUZZLE');
    } else if (res.type === 'keypad_puzzle') {
      setActivePuzzle('keypad');
      setPuzzleData(res.data);
      setGameState('PUZZLE');
    }
  };

  const handleSolvePuzzle = (type: 'breaker' | 'keypad') => {
    setActivePuzzle(null);
    setGameState('PLAYING');

    if (type === 'breaker') {
      gameSceneRef.current?.solveBreakerPuzzle();
      showToast('Auxiliary power restored! Morgue magnetic locks energized.');
      if (currentObjIdx <= 2) {
        setCurrentObjIdx(3);
        saveCheckpoint(3, inventory);
      }
    } else if (type === 'keypad') {
      gameSceneRef.current?.unlockPharmacyDoor();
      showToast('Access Granted! Pharmacy door unlocked.');
    }
  };

  const handleUseInventoryItem = (itemId: string) => {
    if (itemId.includes('battery')) {
      gameSceneRef.current?.player.rechargeBattery(50);
      setInventory(inventory.filter((i) => i.id !== itemId));
      showToast('Flashlight recharged +50%');
      setGameState('PLAYING');
    }
  };

  // Click on canvas to lock mouse for PC testing
  const handleCanvasClick = () => {
    if (gameState === 'PLAYING' && !document.pointerLockElement) {
      canvasMountRef.current?.requestPointerLock?.();
    }
  };

  return (
    <div className="relative w-full h-full bg-[#030305] overflow-hidden select-none touch-none">
      {/* 1. Dedicated WebGL Canvas Container */}
      <div
        ref={canvasMountRef}
        onClick={handleCanvasClick}
        className="absolute inset-0 z-0 cursor-crosshair"
      />

      {/* 2. IN-GAME HUD & OVERLAYS */}
      {gameState === 'PLAYING' && (
        <>
          <HUD
            playerStats={playerStats}
            currentObjective={OBJECTIVES[currentObjIdx]}
            monsterDistance={monsterDistance}
            toastMessage={toastMessage}
            graphicsSettings={graphicsSettings}
          />

          <VirtualControls
            playerStats={playerStats}
            activeInteractive={activeInteractive}
            settings={controlSettings}
            onMoveInput={(x, y) => {
              moveInput.current = { x, y };
            }}
            onLookInput={(deltaYaw, deltaPitch) => {
              gameSceneRef.current?.player.rotateCamera(
                deltaYaw,
                deltaPitch,
                controlSettings.invertY
              );
            }}
            onFlashlightToggle={() => {
              gameSceneRef.current?.player.toggleFlashlight();
            }}
            onCrouchToggle={() => {
              gameSceneRef.current?.player.toggleCrouch();
            }}
            onSprintToggle={(sprint) => {
              gameSceneRef.current?.player.setSprinting(sprint);
            }}
            onInteract={handleInteract}
            onOpenInventory={() => setGameState('INVENTORY')}
            onPause={() => setGameState('PAUSED')}
          />
        </>
      )}

      {/* 3. MAIN MENU */}
      {gameState === 'MENU' && (
        <MainMenu
          hasSaveGame={hasSaveGame}
          onNewGame={startNewGame}
          onContinue={continueGame}
          onOpenSettings={() => setShowSettings(true)}
          onOpenChapters={() => setShowChapters(true)}
          onOpenControls={() => setShowControls(true)}
        />
      )}

      {/* 4. PAUSE MENU */}
      {gameState === 'PAUSED' && (
        <PauseModal
          onResume={() => setGameState('PLAYING')}
          onOpenInventory={() => setGameState('INVENTORY')}
          onOpenSettings={() => setShowSettings(true)}
          onRestart={startNewGame}
          onQuit={() => {
            sound.stopDarkAmbience();
            setGameState('MENU');
          }}
        />
      )}

      {/* 5. INVENTORY & DOSSIER */}
      {gameState === 'INVENTORY' && (
        <InventoryModal
          items={inventory}
          onClose={() => setGameState('PLAYING')}
          onUseItem={handleUseInventoryItem}
        />
      )}

      {/* 6. PUZZLE MODAL (Breaker / Keypad) */}
      {gameState === 'PUZZLE' && activePuzzle && (
        <PuzzleModal
          puzzleType={activePuzzle}
          puzzleData={puzzleData}
          onSolve={handleSolvePuzzle}
          onClose={() => {
            setActivePuzzle(null);
            setGameState('PLAYING');
          }}
        />
      )}

      {/* 7. NOTE INSPECTION MODAL */}
      {gameState === 'NOTE_INSPECT' && inspectNote && (
        <NoteInspectModal
          noteData={inspectNote}
          onClose={() => {
            setInspectNote(null);
            setGameState('PLAYING');
          }}
        />
      )}

      {/* 8. GAME OVER MODAL */}
      {gameState === 'GAME_OVER' && (
        <GameOverModal
          onRetry={() => {
            gameSceneRef.current?.restartGame();
            sound.startDarkAmbience();
            setGameState('PLAYING');
          }}
          onMainMenu={() => {
            sound.stopDarkAmbience();
            setGameState('MENU');
          }}
        />
      )}

      {/* 9. VICTORY / ESCAPE MODAL */}
      {gameState === 'VICTORY' && (
        <EndingModal
          timeSurvivedSeconds={timeSurvived}
          itemsFoundCount={inventory.length}
          sanityRemaining={playerStats.sanity}
          onReplay={startNewGame}
          onMainMenu={() => {
            sound.stopDarkAmbience();
            setGameState('MENU');
          }}
        />
      )}

      {/* 10. SYSTEM SETTINGS MODAL */}
      {showSettings && (
        <SettingsModal
          graphics={graphicsSettings}
          controls={controlSettings}
          audio={audioSettings}
          onUpdateGraphics={setGraphicsSettings}
          onUpdateControls={setControlSettings}
          onUpdateAudio={setAudioSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* 11. CHAPTERS SELECTION MODAL */}
      {showChapters && (
        <ChaptersModal
          onSelectChapter={(id) => {
            setShowChapters(false);
            if (id === 1) startNewGame();
          }}
          onClose={() => setShowChapters(false)}
        />
      )}

      {/* 12. HOW TO PLAY / CONTROLS GUIDE MODAL */}
      {showControls && (
        <ControlsGuideModal onClose={() => setShowControls(false)} />
      )}
    </div>
  );
}
