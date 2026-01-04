/**
 * 音效系统支持
 * 提供战役可视化的3D空间音效、环境音效和战斗音效
 */

class AudioSystem {
    constructor() {
        this.audioContext = null;
        this.soundBuffers = new Map();
        this.activeSounds = new Map();
        this.audioSources = new Map();
        this.musicVolume = 0.5;
        this.effectsVolume = 0.7;
        this.ambientVolume = 0.3;
        this.isMuted = false;
        
        this.initialized = false;
        this.setupAudioContext();
    }
    
    async setupAudioContext() {
        try {
            // 创建音频上下文
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // 检查浏览器支持
            if (!this.audioContext) {
                console.warn("浏览器不支持Web Audio API");
                return false;
            }
            
            // 初始化音频系统
            await this.initializeAudioSystem();
            
            this.initialized = true;
            console.log("音效系统初始化成功");
            return true;
            
        } catch (error) {
            console.error("音效系统初始化失败:", error);
            return false;
        }
    }
    
    async initializeAudioSystem() {
        // 创建声音组
        this.soundGroups = {
            ambient: this.createSoundGroup('ambient', this.ambientVolume),
            effects: this.createSoundGroup('effects', this.effectsVolume),
            music: this.createSoundGroup('music', this.musicVolume),
            tactical: this.createSoundGroup('tactical', 0.8)
        };
        
        // 预加载音效
        await this.preloadSounds();
    }
    
    createSoundGroup(name, baseVolume) {
        return {
            name: name,
            baseVolume: baseVolume,
            gainNode: this.audioContext.createGain(),
            filters: []
        };
    }
    
    // 预加载音效
    async preloadSounds() {
        const soundList = {
            // 环境音效
            ambient: {
                'wind_gentle': this.generateAmbientWind(0.5),
                'wind_strong': this.generateAmbientWind(1.0),
                'rain_light': this.generateRainSound(0.3),
                'rain_heavy': this.generateRainSound(0.8),
                'thunder': this.generateThunderSound(),
                'fire_crackling': this.generateFireSound(),
                'forest_ambience': this.generateForestSound()
            },
            
            // 战斗音效
            effects: {
                'sword_clash': this.generateSwordClash(),
                'arrow_whistle': this.generateArrowSound(),
                'cavalry_charge': this.generateCavalrySound(),
                'explosion': this.generateExplosionSound(),
                'battle_cry': this.generateBattleCry(),
                'siege_impact': this.generateSiegeImpact(),
                'fire_attack': this.generateFireAttackSound()
            },
            
            // 兵种音效
            tactical: {
                'footsteps': this.generateFootstepSound(),
                'shield_bump': this.generateShieldSound(),
                'spear_thrust': this.generateSpearSound(),
                'bow_release': this.generateBowRelease(),
                'cavalry_hooves': this.generateHorseSound(),
                'formation_move': this.generateFormationSound()
            },
            
            // 音乐
            music: {
                'ancient_theme': this.generateAncientMusic(),
                'medieval_theme': this.generateMedievalMusic(),
                'battle_theme': this.generateBattleMusic(),
                'victory_theme': this.generateVictoryMusic(),
                'tactical_theme': this.generateTacticalMusic()
            }
        };
        
        // 生成并缓存所有音效
        for (const [groupName, sounds] of Object.entries(soundList)) {
            const soundGroup = this.soundGroups[groupName];
            if (!soundGroup) continue;
            
            for (const [soundName, audioData] of Object.entries(sounds)) {
                const buffer = await this.generateAudioBuffer(audioData);
                if (buffer) {
                    this.soundBuffers.set(`${groupName}_${soundName}`, buffer);
                }
            }
        }
    }
    
    // 生成环境音效
    
    generateAmbientWind(intensity) {
        return {
            type: 'noise',
            duration: 30,
            parameters: {
                frequency: 200 + intensity * 300,
                amplitude: intensity * 0.3,
                envelope: 'sustain'
            }
        };
    }
    
    generateRainSound(intensity) {
        return {
            type: 'rain',
            duration: 60,
            parameters: {
                dropIntensity: intensity,
                frequency: 800 + intensity * 400,
                amplitude: intensity * 0.2
            }
        };
    }
    
    generateThunderSound() {
        return {
            type: 'noise',
            duration: 3,
            parameters: {
                frequency: 50,
                amplitude: 0.8,
                envelope: 'decay',
                decay: 2.0
            }
        };
    }
    
    generateFireSound() {
        return {
            type: 'fire',
            duration: 20,
            parameters: {
                crackleIntensity: 0.6,
                baseFrequency: 300,
                amplitude: 0.4
            }
        };
    }
    
    generateForestSound() {
        return {
            type: 'forest',
            duration: 45,
            parameters: {
                birdCalls: true,
                rustling: true,
                amplitude: 0.3
            }
        };
    }
    
    // 生成战斗音效
    
    generateSwordClash() {
        return {
            type: 'metallic',
            duration: 0.5,
            parameters: {
                frequency: 800,
                attack: 0.01,
                decay: 0.3,
                amplitude: 0.6
            }
        };
    }
    
    generateArrowSound() {
        return {
            type: 'whistle',
            duration: 1.0,
            parameters: {
                frequency: 1200,
                vibrato: 5,
                amplitude: 0.4
            }
        };
    }
    
    generateCavalrySound() {
        return {
            type: 'horse',
            duration: 3.0,
            parameters: {
                hoovesIntensity: 0.7,
                gallopSpeed: 2.5,
                amplitude: 0.5
            }
        };
    }
    
    generateExplosionSound() {
        return {
            type: 'explosion',
            duration: 2.0,
            parameters: {
                initialBoom: 60,
                debrisNoise: true,
                amplitude: 0.9
            }
        };
    }
    
    generateBattleCry() {
        return {
            type: 'vocal',
            duration: 1.5,
            parameters: {
                pitch: 400,
                volume: 0.7,
                vibrato: 3
            }
        };
    }
    
    generateSiegeImpact() {
        return {
            type: 'impact',
            duration: 1.0,
            parameters: {
                frequency: 200,
                impactStrength: 0.8,
                resonance: true
            }
        };
    }
    
    generateFireAttackSound() {
        return {
            type: 'fire_attack',
            duration: 4.0,
            parameters: {
                crackling: true,
                whoosh: true,
                intensity: 0.6
            }
        };
    }
    
    // 生成兵种音效
    
    generateFootstepSound() {
        return {
            type: 'footstep',
            duration: 0.3,
            parameters: {
                surface: 'ground',
                weight: 'medium',
                amplitude: 0.3
            }
        };
    }
    
    generateShieldSound() {
        return {
            type: 'shield',
            duration: 0.4,
            parameters: {
                material: 'wood',
                impact: 'medium',
                amplitude: 0.4
            }
        };
    }
    
    generateSpearSound() {
        return {
            type: 'spear',
            duration: 0.8,
            parameters: {
                thrustSpeed: 'fast',
                whooshIntensity: 0.5,
                amplitude: 0.4
            }
        };
    }
    
    generateBowRelease() {
        return {
            type: 'bow',
            duration: 0.6,
            parameters: {
                stringTension: 'medium',
                releaseForce: 0.6,
                amplitude: 0.3
            }
        };
    }
    
    generateHorseSound() {
        return {
            type: 'horse',
            duration: 2.0,
            parameters: {
                gait: 'gallop',
                breathing: true,
                amplitude: 0.5
            }
        };
    }
    
    generateFormationSound() {
        return {
            type: 'formation',
            duration: 5.0,
            parameters: {
                footsteps: true,
                coordination: 'high',
                amplitude: 0.4
            }
        };
    }
    
    // 生成音乐
    
    generateAncientMusic() {
        return {
            type: 'music',
            duration: 60,
            parameters: {
                style: 'ancient',
                instruments: ['harp', 'flute', 'drums'],
                tempo: 80,
                mode: 'dorian'
            }
        };
    }
    
    generateMedievalMusic() {
        return {
            type: 'music',
            duration: 60,
            parameters: {
                style: 'medieval',
                instruments: ['lute', 'viol', 'shawm'],
                tempo: 100,
                mode: 'aeolian'
            }
        };
    }
    
    generateBattleMusic() {
        return {
            type: 'music',
            duration: 90,
            parameters: {
                style: 'battle',
                instruments: ['drums', 'brass', 'strings'],
                tempo: 120,
                intensity: 'high'
            }
        };
    }
    
    generateVictoryMusic() {
        return {
            type: 'music',
            duration: 45,
            parameters: {
                style: 'victory',
                instruments: ['brass', 'strings', 'choir'],
                tempo: 110,
                mode: 'major'
            }
        };
    }
    
    generateTacticalMusic() {
        return {
            type: 'music',
            duration: 60,
            parameters: {
                style: 'tactical',
                instruments: ['strings', 'woodwind'],
                tempo: 90,
                mode: 'minor'
            }
        };
    }
    
    // 生成音频缓冲区
    async generateAudioBuffer(audioData) {
        if (!this.audioContext) return null;
        
        const sampleRate = this.audioContext.sampleRate;
        const duration = audioData.duration;
        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        switch (audioData.type) {
            case 'noise':
                this.generateNoiseAudio(data, audioData.parameters);
                break;
            case 'rain':
                this.generateRainAudio(data, audioData.parameters);
                break;
            case 'fire':
                this.generateFireAudio(data, audioData.parameters);
                break;
            case 'metallic':
                this.generateMetallicAudio(data, audioData.parameters);
                break;
            case 'whistle':
                this.generateWhistleAudio(data, audioData.parameters);
                break;
            case 'horse':
                this.generateHorseAudio(data, audioData.parameters);
                break;
            case 'explosion':
                this.generateExplosionAudio(data, audioData.parameters);
                break;
            case 'music':
                this.generateMusicAudio(data, audioData.parameters);
                break;
            default:
                this.generateSimpleTone(data, audioData.parameters);
        }
        
        return buffer;
    }
    
    // 生成噪音音频
    generateNoiseAudio(data, params) {
        const frequency = params.frequency || 440;
        const amplitude = params.amplitude || 0.5;
        const envelope = params.envelope || 'sustain';
        
        for (let i = 0; i < data.length; i++) {
            const t = i / data.length;
            let sample = (Math.random() * 2 - 1) * amplitude;
            
            // 添加包络
            if (envelope === 'decay') {
                sample *= Math.exp(-t * (params.decay || 2.0));
            } else if (envelope === 'attack') {
                sample *= t;
            } else if (envelope === 'sustain') {
                sample *= 0.7 + 0.3 * Math.sin(t * Math.PI);
            }
            
            data[i] = sample;
        }
    }
    
    // 生成雨声音频
    generateRainAudio(data, params) {
        const intensity = params.dropIntensity || 0.5;
        const baseFreq = params.frequency || 1000;
        
        for (let i = 0; i < data.length; i++) {
            const t = i / data.length;
            const rainDrop = (Math.random() - 0.5) * intensity * 0.1;
            const highFreq = Math.sin(t * baseFreq * Math.PI * 2) * 0.1;
            
            data[i] = rainDrop + highFreq;
        }
    }
    
    // 生成火焰音频
    generateFireAudio(data, params) {
        const baseFreq = params.baseFrequency || 300;
        const intensity = params.crackleIntensity || 0.6;
        
        for (let i = 0; i < data.length; i++) {
            const t = i / data.length;
            const crackle = (Math.random() - 0.5) * intensity * 0.3;
            const base = Math.sin(t * baseFreq * Math.PI * 2) * 0.1;
            const modulation = Math.sin(t * 10 * Math.PI * 2) * 0.05;
            
            data[i] = base + crackle + modulation;
        }
    }
    
    // 生成金属碰撞音频
    generateMetallicAudio(data, params) {
        const frequency = params.frequency || 800;
        const attack = params.attack || 0.01;
        const decay = params.decay || 0.3;
        const amplitude = params.amplitude || 0.6;
        
        for (let i = 0; i < data.length; i++) {
            const t = i / data.length;
            
            let envelope;
            if (t < attack) {
                envelope = t / attack;
            } else {
                envelope = Math.exp(-(t - attack) / decay);
            }
            
            const sample = Math.sin(t * frequency * Math.PI * 2) * amplitude * envelope;
            data[i] = sample;
        }
    }
    
    // 生成哨声音频
    generateWhistleAudio(data, params) {
        const frequency = params.frequency || 1200;
        const vibrato = params.vibrato || 5;
        const amplitude = params.amplitude || 0.4;
        
        for (let i = 0; i < data.length; i++) {
            const t = i / data.length;
            const vibratoFreq = frequency * (1 + 0.1 * Math.sin(t * vibrato * Math.PI * 2));
            const sample = Math.sin(t * vibratoFreq * Math.PI * 2) * amplitude;
            
            data[i] = sample;
        }
    }
    
    // 生成马蹄音频
    generateHorseAudio(data, params) {
        const hooves = params.hoovesIntensity || 0.7;
        const speed = params.gallopSpeed || 2.5;
        const amplitude = params.amplitude || 0.5;
        
        for (let i = 0; i < data.length; i++) {
            const t = i / data.length;
            const hoofstep = Math.sin(t * speed * 12 * Math.PI * 2) * hooves * 0.3;
            const breathing = Math.sin(t * 2 * Math.PI) * 0.1;
            
            data[i] = (hoofstep + breathing) * amplitude;
        }
    }
    
    // 生成爆炸音频
    generateExplosionAudio(data, params) {
        const initialBoom = params.initialBoom || 60;
        const amplitude = params.amplitude || 0.9;
        
        for (let i = 0; i < data.length; i++) {
            const t = i / data.length;
            
            let sample;
            if (t < 0.1) {
                // 初始爆炸
                sample = Math.sin(t * initialBoom * Math.PI * 2) * (1 - t * 10) * amplitude;
            } else {
                // 余波和碎片
                sample = (Math.random() - 0.5) * amplitude * Math.exp(-(t - 0.1) * 5);
            }
            
            data[i] = sample;
        }
    }
    
    // 生成音乐音频
    generateMusicAudio(data, params) {
        // 简化的音乐生成
        const tempo = params.tempo || 120;
        const baseFreq = 220; // A3
        
        for (let i = 0; i < data.length; i++) {
            const t = i / data.length;
            const beat = t * tempo / 60; // 转换为节拍
            
            // 简单的旋律模式
            const melody = Math.sin(beat * Math.PI * 2 * 0.5) * 0.3 +
                          Math.sin(beat * Math.PI * 2 * 0.25) * 0.2 +
                          Math.sin(beat * Math.PI * 2 * 0.125) * 0.1;
            
            // 和声
            const harmony = Math.sin(beat * Math.PI * 2 * 0.5 + Math.PI/3) * 0.2;
            
            data[i] = (melody + harmony) * 0.4;
        }
    }
    
    // 生成简单音调
    generateSimpleTone(data, params) {
        const frequency = params.frequency || 440;
        const amplitude = params.amplitude || 0.5;
        
        for (let i = 0; i < data.length; i++) {
            const t = i / data.length;
            data[i] = Math.sin(t * frequency * Math.PI * 2) * amplitude;
        }
    }
    
    // 播放音效
    
    playSound(soundName, options = {}) {
        if (!this.initialized || this.isMuted) return null;
        
        const buffer = this.soundBuffers.get(soundName);
        if (!buffer) {
            console.warn(`音效未找到: ${soundName}`);
            return null;
        }
        
        const soundId = `sound_${Date.now()}_${Math.random()}`;
        const sound = this.createSound(buffer, options);
        
        this.activeSounds.set(soundId, sound);
        
        sound.source.start();
        
        // 音效结束后清理
        sound.source.onended = () => {
            this.activeSounds.delete(soundId);
        };
        
        return soundId;
    }
    
    createSound(buffer, options) {
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        
        // 应用音效组音量
        const groupName = options.group || 'effects';
        const soundGroup = this.soundGroups[groupName];
        const gainNode = soundGroup.gainNode;
        
        // 创建增益节点
        const soundGain = this.audioContext.createGain();
        soundGain.gain.value = options.volume || 1.0;
        
        // 3D位置设置
        if (options.position) {
            const panner = this.audioContext.createPanner();
            panner.setPosition(options.position.x, options.position.y, options.position.z);
            panner.panningModel = 'HRTF';
            panner.distanceModel = 'inverse';
            
            source.connect(panner);
            panner.connect(soundGain);
        } else {
            source.connect(soundGain);
        }
        
        soundGain.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        return {
            id: `sound_${Date.now()}`,
            source: source,
            gainNode: soundGain,
            panner: options.position ? this.audioContext.createPanner() : null,
            options: options
        };
    }
    
    // 播放循环音效
    playAmbientSound(soundName, loop = true) {
        const options = {
            group: 'ambient',
            volume: 0.6,
            loop: loop
        };
        
        return this.playSound(`ambient_${soundName}`, options);
    }
    
    // 播放战斗音效
    playBattleSound(soundName, position = null) {
        const options = {
            group: 'effects',
            volume: 0.8,
            position: position
        };
        
        return this.playSound(`effects_${soundName}`, options);
    }
    
    // 播放兵种音效
    playTacticalSound(soundName, position = null) {
        const options = {
            group: 'tactical',
            volume: 0.7,
            position: position
        };
        
        return this.playSound(`tactical_${soundName}`, options);
    }
    
    // 播放音乐
    playMusic(musicName, loop = true, fadeIn = true) {
        const options = {
            group: 'music',
            volume: 0.6,
            loop: loop
        };
        
        const musicId = this.playSound(`music_${musicName}`, options);
        
        if (musicId && fadeIn) {
            this.fadeInSound(musicId, 2000); // 2秒淡入
        }
        
        return musicId;
    }
    
    // 淡入音效
    fadeInSound(soundId, duration = 1000) {
        const sound = this.activeSounds.get(soundId);
        if (!sound) return;
        
        const startTime = this.audioContext.currentTime;
        const endTime = startTime + duration / 1000;
        
        sound.gainNode.gain.setValueAtTime(0, startTime);
        sound.gainNode.gain.linearRampToValueAtTime(1, endTime);
    }
    
    // 淡出音效
    fadeOutSound(soundId, duration = 1000) {
        const sound = this.activeSounds.get(soundId);
        if (!sound) return;
        
        const startTime = this.audioContext.currentTime;
        const endTime = startTime + duration / 1000;
        
        sound.gainNode.gain.setValueAtTime(sound.gainNode.gain.value, startTime);
        sound.gainNode.gain.linearRampToValueAtTime(0, endTime);
        
        setTimeout(() => {
            this.stopSound(soundId);
        }, duration);
    }
    
    // 停止音效
    stopSound(soundId) {
        const sound = this.activeSounds.get(soundId);
        if (sound) {
            sound.source.stop();
            this.activeSounds.delete(soundId);
        }
    }
    
    // 停止所有音效
    stopAllSounds() {
        for (const [soundId, sound] of this.activeSounds) {
            sound.source.stop();
        }
        this.activeSounds.clear();
    }
    
    // 设置音量
    setVolume(groupName, volume) {
        const soundGroup = this.soundGroups[groupName];
        if (soundGroup) {
            soundGroup.baseVolume = Math.max(0, Math.min(1, volume));
            soundGroup.gainNode.gain.value = soundGroup.baseVolume;
        }
    }
    
    // 设置总体音量
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        this.setVolume('ambient', this.ambientVolume * this.masterVolume);
        this.setVolume('effects', this.effectsVolume * this.masterVolume);
        this.setVolume('music', this.musicVolume * this.masterVolume);
        this.setVolume('tactical', 0.8 * this.masterVolume);
    }
    
    // 静音切换
    toggleMute() {
        this.isMuted = !this.isMuted;
        
        if (this.isMuted) {
            this.stopAllSounds();
        }
        
        return this.isMuted;
    }
    
    // 更新3D位置
    updateSoundPosition(soundId, position) {
        const sound = this.activeSounds.get(soundId);
        if (sound && sound.panner) {
            sound.panner.setPosition(position.x, position.y, position.z);
        }
    }
    
    // 战役音效序列
    playBattleSequence(sequenceName, position = null) {
        const sequences = {
            'fire_attack': () => {
                this.playBattleSound('fire_attack', position);
                setTimeout(() => this.playBattleSound('explosion', position), 1000);
                setTimeout(() => this.playBattleSound('battle_cry', position), 2000);
            },
            'cavalry_charge': () => {
                this.playTacticalSound('cavalry_hooves', position);
                setTimeout(() => this.playBattleSound('cavalry_charge', position), 500);
                setTimeout(() => this.playBattleSound('battle_cry', position), 1000);
            },
            'archer_volley': () => {
                this.playTacticalSound('bow_release', position);
                setTimeout(() => this.playBattleSound('arrow_whistle', position), 200);
                setTimeout(() => this.playBattleSound('arrow_whistle', position), 400);
            }
        };
        
        if (sequences[sequenceName]) {
            sequences[sequenceName]();
        }
    }
    
    // 清理系统
    cleanup() {
        this.stopAllSounds();
        
        if (this.audioContext) {
            this.audioContext.close();
        }
        
        console.log("音效系统清理完成");
    }
}

// 全局导出
if (typeof window !== 'undefined') {
    window.AudioSystem = AudioSystem;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioSystem;
}