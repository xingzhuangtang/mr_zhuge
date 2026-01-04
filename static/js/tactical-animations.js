/**
 * 战术动画效果系统
 * 专门处理各种历史战术的可视化展示
 */

class TacticalAnimationSystem {
    constructor(viewer) {
        this.viewer = viewer;
        this.activeTacticalEffects = new Map();
        this.tacticalAnimations = new Map();
        this.weatherSystem = null;
        this.setupTacticalEffects();
    }
    
    setupTacticalEffects() {
        this.tacticalEffects = {
            // 火攻战术
            fire_attack: {
                name: "火攻战术",
                description: "利用天气条件发起火攻",
                duration: 15000,
                effects: ["fire_particles", "smoke_dispersion", "wind_effect"],
                requirements: ["wind_direction", "dry_weather"],
                animation_sequence: [
                    {
                        time: 0,
                        action: "preparation",
                        description: "准备火船和易燃物"
                    },
                    {
                        time: 2000,
                        action: "ignition",
                        description: "点燃火船"
                    },
                    {
                        time: 5000,
                        action: "spread",
                        description: "火势蔓延"
                    },
                    {
                        time: 10000,
                        action: "conflagration",
                        description: "全面燃烧"
                    },
                    {
                        time: 15000,
                        action: "destruction",
                        description: "破坏完成"
                    }
                ],
                visual_parameters: {
                    fire_intensity: 1.0,
                    smoke_density: 0.8,
                    wind_dependency: 0.9
                }
            },
            
            // 方阵冲锋
            phalanx_charge: {
                name: "方阵冲锋",
                description: "希腊重装步兵密集冲锋",
                duration: 8000,
                effects: ["shield_wall", "spear_presentation", "charge_momentum"],
                requirements: ["flat_terrain", "enemy_proximity"],
                animation_sequence: [
                    {
                        time: 0,
                        action: "formation_ready",
                        description: "方阵就绪"
                    },
                    {
                        time: 1000,
                        action: "advance",
                        description: "开始前进"
                    },
                    {
                        time: 3000,
                        action: "charge",
                        description: "发起冲锋"
                    },
                    {
                        time: 6000,
                        action: "impact",
                        description: "接触敌阵"
                    },
                    {
                        time: 8000,
                        action: "breakthrough",
                        description: "突破防线"
                    }
                ],
                visual_parameters: {
                    formation_cohesion: 1.0,
                    speed_progression: 0.8,
                    combat_intensity: 0.9
                }
            },
            
            // 假退战术
            feigned_retreat: {
                name: "假退战术",
                description: "假装撤退诱使敌人追击",
                duration: 12000,
                effects: ["strategic_withdrawal", "enemy_pursuit", "counter_attack"],
                requirements: ["enemy_engagement", "retreat_route"],
                animation_sequence: [
                    {
                        time: 0,
                        action: "fake_weakness",
                        description: "显示弱势"
                    },
                    {
                        time: 2000,
                        action: "strategic_retreat",
                        description: "战略性撤退"
                    },
                    {
                        time: 5000,
                        action: "enemy_pursuit",
                        description: "敌人追击"
                    },
                    {
                        time: 8000,
                        action: "trap_setup",
                        description: "陷阱设置"
                    },
                    {
                        time: 10000,
                        action: "counter_charge",
                        description: "反击冲锋"
                    },
                    {
                        time: 12000,
                        action: "envelopment",
                        description: "包围成功"
                    }
                ],
                visual_parameters: {
                    retreat_speed: 0.6,
                    deception_level: 0.9,
                    surprise_factor: 0.8
                }
            },
            
            // 骑兵楔形突击
            cavalry_wedge: {
                name: "骑兵楔形突击",
                description: "重装骑兵的致命突击",
                duration: 6000,
                effects: ["charging_movement", "dust_cloud", "lance_presentation"],
                requirements: ["open_terrain", "enemy_vulnerability"],
                animation_sequence: [
                    {
                        time: 0,
                        action: "wedge_formation",
                        description: "楔形队形"
                    },
                    {
                        time: 500,
                        action: "acceleration",
                        description: "加速冲刺"
                    },
                    {
                        time: 2000,
                        action: "full_charge",
                        description: "全力冲锋"
                    },
                    {
                        time: 4000,
                        action: "enemy_contact",
                        description: "接触敌军"
                    },
                    {
                        time: 6000,
                        action: "breakthrough",
                        description: "突破成功"
                    }
                ],
                visual_parameters: {
                    speed_progression: 1.0,
                    dust_intensity: 0.7,
                    impact_force: 0.9
                }
            },
            
            // 弓箭齐射
            volley_fire: {
                name: "弓箭齐射",
                description: "大规模远程火力压制",
                duration: 4000,
                effects: ["projectile_rain", "reload_animation", "area_suppression"],
                requirements: ["clear_los", "enemy_concentration"],
                animation_sequence: [
                    {
                        time: 0,
                        action: "aim",
                        description: "瞄准目标"
                    },
                    {
                        time: 500,
                        action: "release_volley",
                        description: "齐射释放"
                    },
                    {
                        time: 1000,
                        action: "projectile_flight",
                        description: "箭矢飞行"
                    },
                    {
                        time: 2000,
                        action: "impact",
                        description: "命中目标"
                    },
                    {
                        time: 3000,
                        action: "reload",
                        description: "重新装填"
                    },
                    {
                        time: 4000,
                        action: "next_volley",
                        description: "下一轮射击"
                    }
                ],
                visual_parameters: {
                    projectile_density: 1.0,
                    reload_time: 1.2,
                    accuracy_modifier: 0.8
                }
            },
            
            // 炮火齐射
            artillery_barrage: {
                name: "炮火齐射",
                description: "大规模火炮轰炸",
                duration: 10000,
                effects: ["shell_trajectory", "explosion_blast", "shock_wave"],
                requirements: ["enemy_position", "artillery_advantage"],
                animation_sequence: [
                    {
                        time: 0,
                        action: "target_locking",
                        description: "锁定目标"
                    },
                    {
                        time: 2000,
                        action: "barrage_fire",
                        description: "齐射开火"
                    },
                    {
                        time: 4000,
                        action: "shell_arrival",
                        description: "炮弹到达"
                    },
                    {
                        time: 6000,
                        action: "explosion",
                        description: "爆炸冲击"
                    },
                    {
                        time: 8000,
                        action: "secondary_effects",
                        description: "次生效果"
                    },
                    {
                        time: 10000,
                        action: "area_destruction",
                        description: "区域破坏"
                    }
                ],
                visual_parameters: {
                    shell_velocity: 0.8,
                    explosion_radius: 1.0,
                    shock_intensity: 0.9
                }
            }
        };
    }
    
    // 执行战术动画
    async executeTacticalAnimation(tacticType, parameters = {}) {
        if (!this.tacticalEffects[tacticType]) {
            console.error(`未知战术类型: ${tacticType}`);
            return null;
        }
        
        const tactic = this.tacticalEffects[tacticType];
        const animationId = `tactic_${tacticType}_${Date.now()}`;
        
        console.log(`执行战术动画: ${tactic.name}`);
        
        const animation = {
            id: animationId,
            type: tacticType,
            startTime: Date.now(),
            duration: tactic.duration,
            status: "executing",
            parameters: parameters,
            effects: tactic.effects,
            sequence: tactic.animation_sequence,
            visualParams: tactic.visual_parameters,
            onComplete: parameters.onComplete || (() => {}),
            targetLocation: parameters.targetLocation || null,
            participants: parameters.participants || []
        };
        
        // 检查战术执行条件
        if (!this.checkTacticRequirements(tactic, parameters)) {
            console.warn(`战术执行条件不满足: ${tactic.name}`);
            animation.status = "failed";
            animation.failureReason = "requirements_not_met";
            return animation;
        }
        
        // 开始执行战术
        this.activeTacticalEffects.set(animationId, animation);
        await this.startTacticalExecution(animation);
        
        return animation;
    }
    
    // 检查战术要求
    checkTacticRequirements(tactic, parameters) {
        const requirements = tactic.requirements || [];
        
        for (const req of requirements) {
            switch (req) {
                case "wind_direction":
                    if (!this.checkWindDirection(parameters.windDirection)) {
                        return false;
                    }
                    break;
                case "dry_weather":
                    if (!this.checkDryWeather(parameters.weather)) {
                        return false;
                    }
                    break;
                case "flat_terrain":
                    if (!this.checkFlatTerrain(parameters.terrain)) {
                        return false;
                    }
                    break;
                case "enemy_proximity":
                    if (!this.checkEnemyProximity(parameters.distance)) {
                        return false;
                    }
                    break;
                case "enemy_engagement":
                    if (!this.checkEnemyEngagement(parameters.engagement)) {
                        return false;
                    }
                    break;
                case "open_terrain":
                    if (!this.checkOpenTerrain(parameters.terrain)) {
                        return false;
                    }
                    break;
                case "clear_los":
                    if (!this.checkLineOfSight(parameters.lineOfSight)) {
                        return false;
                    }
                    break;
                case "enemy_concentration":
                    if (!this.checkEnemyConcentration(parameters.concentration)) {
                        return false;
                    }
                    break;
            }
        }
        
        return true;
    }
    
    // 检查风向
    checkWindDirection(direction) {
        // 对于火攻，需要东南风
        return direction && direction.includes('southeast');
    }
    
    // 检查干燥天气
    checkDryWeather(weather) {
        return weather && (weather.includes('clear') || weather.includes('dry'));
    }
    
    // 检查平坦地形
    checkFlatTerrain(terrain) {
        return terrain && (terrain.includes('plain') || terrain.includes('flat'));
    }
    
    // 检查敌人距离
    checkEnemyProximity(distance) {
        return distance && distance < 200; // 200米内
    }
    
    // 检查敌人交战
    checkEnemyEngagement(engagement) {
        return engagement === 'active';
    }
    
    // 检查开阔地形
    checkOpenTerrain(terrain) {
        return terrain && (terrain.includes('open') || terrain.includes('field'));
    }
    
    // 检查视线
    checkLineOfSight(lineOfSight) {
        return lineOfSight === 'clear';
    }
    
    // 检查敌人集中度
    checkEnemyConcentration(concentration) {
        return concentration && concentration > 0.7; // 70%以上集中
    }
    
    // 开始战术执行
    async startTacticalExecution(animation) {
        const tactic = this.tacticalEffects[animation.type];
        
        console.log(`开始战术执行: ${tactic.name}, 持续时间: ${tactic.duration}ms`);
        
        // 执行动画序列
        for (let i = 0; i < tactic.animation_sequence.length; i++) {
            const frame = tactic.animation_sequence[i];
            
            setTimeout(async () => {
                await this.executeTacticalFrame(animation, frame, i);
            }, frame.time);
        }
        
        // 动画完成
        setTimeout(() => {
            this.completeTacticalAnimation(animation);
        }, tactic.duration);
    }
    
    // 执行战术帧
    async executeTacticalFrame(animation, frame, frameIndex) {
        console.log(`执行战术帧: ${frame.action} - ${frame.description}`);
        
        animation.currentFrame = frameIndex;
        
        // 根据战术类型执行相应的视觉效果
        switch (animation.type) {
            case 'fire_attack':
                await this.executeFireAttackFrame(animation, frame);
                break;
            case 'phalanx_charge':
                await this.executePhalanxChargeFrame(animation, frame);
                break;
            case 'feigned_retreat':
                await this.executeFeignedRetreatFrame(animation, frame);
                break;
            case 'cavalry_wedge':
                await this.executeCavalryWedgeFrame(animation, frame);
                break;
            case 'volley_fire':
                await this.executeVolleyFireFrame(animation, frame);
                break;
            case 'artillery_barrage':
                await this.executeArtilleryBarrageFrame(animation, frame);
                break;
        }
        
        // 播放框架指示器
        this.showTacticalFrameIndicator(animation, frame, frameIndex);
    }
    
    // 火攻战术帧
    async executeFireAttackFrame(animation, frame) {
        const targetLocation = animation.targetLocation;
        if (!targetLocation) return;
        
        switch (frame.action) {
            case "preparation":
                await this.createFirePreparationEffect(targetLocation);
                break;
            case "ignition":
                await this.createIgnitionEffect(targetLocation);
                break;
            case "spread":
                await this.createFireSpreadEffect(targetLocation);
                break;
            case "conflagration":
                await this.createConflagrationEffect(targetLocation);
                break;
            case "destruction":
                await this.createDestructionEffect(targetLocation);
                break;
        }
    }
    
    // 方阵冲锋帧
    async executePhalanxChargeFrame(animation, frame) {
        const targetLocation = animation.targetLocation;
        const participants = animation.participants;
        
        switch (frame.action) {
            case "formation_ready":
                await this.createFormationReadyEffect(participants);
                break;
            case "advance":
                await this.createAdvanceEffect(participants, targetLocation);
                break;
            case "charge":
                await this.createChargeEffect(participants);
                break;
            case "impact":
                await this.createImpactEffect(targetLocation);
                break;
            case "breakthrough":
                await this.createBreakthroughEffect(targetLocation);
                break;
        }
    }
    
    // 假退战术帧
    async executeFeignedRetreatFrame(animation, frame) {
        switch (frame.action) {
            case "fake_weakness":
                await this.createFakeWeaknessEffect(animation.participants);
                break;
            case "strategic_retreat":
                await this.createStrategicRetreatEffect(animation.participants);
                break;
            case "enemy_pursuit":
                await this.createEnemyPursuitEffect(animation.targetLocation);
                break;
            case "trap_setup":
                await this.createTrapSetupEffect(animation.targetLocation);
                break;
            case "counter_charge":
                await this.createCounterChargeEffect(animation.participants);
                break;
            case "envelopment":
                await this.createEnvelopmentEffect(animation.targetLocation);
                break;
        }
    }
    
    // 视觉效果实现方法
    
    async createFirePreparationEffect(location) {
        const position = Cesium.Cartesian3.fromDegrees(location.lon, location.lat, 50);
        
        // 创建准备火船的视觉效果
        const fireShips = [];
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            const shipPosition = Cesium.Cartesian3.fromDegrees(
                location.lon + Math.cos(angle) * 100,
                location.lat + Math.sin(angle) * 100,
                10
            );
            
            const ship = this.viewer.entities.add({
                position: shipPosition,
                point: {
                    pixelSize: 20,
                    color: Cesium.Color.ORANGE.withAlpha(0.7),
                    outlineColor: Cesium.Color.RED,
                    outlineWidth: 3
                },
                label: {
                    text: "🔥 火船",
                    font: '14px Arial',
                    fillColor: Cesium.Color.ORANGE,
                    outlineColor: Cesium.Color.BLACK,
                    outlineWidth: 2,
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE
                }
            });
            
            fireShips.push(ship);
        }
        
        return fireShips;
    }
    
    async createIgnitionEffect(location) {
        const position = Cesium.Cartesian3.fromDegrees(location.lon, location.lat, 100);
        
        // 创建点火粒子效果
        const ignitionParticles = new Cesium.ParticleSystem({
            modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(position),
            minimumSpeed: 3.0,
            maximumSpeed: 8.0,
            lifetime: 5.0,
            emitter: new Cesium.SphereEmitter(30),
            startScale: 1.0,
            endScale: 2.0,
            startColor: Cesium.Color.ORANGE.withAlpha(1.0),
            endColor: Cesium.Color.RED.withAlpha(0.0),
            minimumPixelSize: 10,
            maximumPixelSize: 50,
            image: this.createFireParticleImage()
        });
        
        this.viewer.scene.primitives.add(ignitionParticles);
        
        setTimeout(() => {
            this.viewer.scene.primitives.remove(ignitionParticles);
        }, 5000);
    }
    
    async createFireSpreadEffect(location) {
        const centerPosition = Cesium.Cartesian3.fromDegrees(location.lon, location.lat, 50);
        
        // 创建扩散的火焰效果
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                const angle = (i / 10) * Math.PI * 2;
                const radius = 50 + i * 20;
                const spreadPosition = Cesium.Cartesian3.fromDegrees(
                    location.lon + Math.cos(angle) * radius * 0.0001,
                    location.lat + Math.sin(angle) * radius * 0.0001,
                    30
                );
                
                const spreadFire = new Cesium.ParticleSystem({
                    modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(spreadPosition),
                    minimumSpeed: 2.0,
                    maximumSpeed: 6.0,
                    lifetime: 8.0,
                    emitter: new Cesium.ConeEmitter(Cesium.Math.toRadians(45.0)),
                    startScale: 0.5,
                    endScale: 1.5,
                    startColor: Cesium.Color.RED.withAlpha(0.9),
                    endColor: Cesium.Color.ORANGE.withAlpha(0.0),
                    minimumPixelSize: 8,
                    maximumPixelSize: 40,
                    image: this.createFireParticleImage()
                });
                
                this.viewer.scene.primitives.add(spreadFire);
                
                setTimeout(() => {
                    this.viewer.scene.primitives.remove(spreadFire);
                }, 8000);
            }, i * 500);
        }
    }
    
    async createConflagrationEffect(location) {
        const position = Cesium.Cartesian3.fromDegrees(location.lon, location.lat, 150);
        
        // 创建大规模燃烧效果
        const conflagrationParticles = new Cesium.ParticleSystem({
            modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(position),
            minimumSpeed: 5.0,
            maximumSpeed: 15.0,
            lifetime: 10.0,
            emitter: new Cesium.SphereEmitter(100),
            startScale: 2.0,
            endScale: 4.0,
            startColor: Cesium.Color.RED.withAlpha(1.0),
            endColor: Cesium.Color.DARKRED.withAlpha(0.0),
            minimumPixelSize: 20,
            maximumPixelSize: 100,
            image: this.createConflagrationImage()
        });
        
        this.viewer.scene.primitives.add(conflagrationParticles);
        
        // 添加烟雾效果
        const smokeParticles = new Cesium.ParticleSystem({
            modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(position),
            minimumSpeed: 1.0,
            maximumSpeed: 3.0,
            lifetime: 15.0,
            emitter: new Cesium.ConeEmitter(Cesium.Math.toRadians(60.0)),
            startScale: 3.0,
            endScale: 6.0,
            startColor: Cesium.Color.GRAY.withAlpha(0.6),
            endColor: Cesium.Color.DARKGRAY.withAlpha(0.0),
            minimumPixelSize: 30,
            maximumPixelSize: 150,
            image: this.createSmokeParticleImage()
        });
        
        this.viewer.scene.primitives.add(smokeParticles);
        
        setTimeout(() => {
            this.viewer.scene.primitives.remove(conflagrationParticles);
            this.viewer.scene.primitives.remove(smokeParticles);
        }, 15000);
    }
    
    async createDestructionEffect(location) {
        // 创建破坏完成的视觉效果
        const destructionMarker = this.viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(location.lon, location.lat, 100),
            point: {
                pixelSize: 40,
                color: Cesium.Color.DARKRED.withAlpha(0.8),
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 4
            },
            label: {
                text: "🔥 破坏完成",
                font: 'bold 16px Arial',
                fillColor: Cesium.Color.RED,
                outlineColor: Cesium.Color.WHITE,
                outlineWidth: 3,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                pixelOffset: new Cesium.Cartesian2(0, -50)
            }
        });
        
        setTimeout(() => {
            this.viewer.entities.remove(destructionMarker);
        }, 3000);
    }
    
    // 粒子图像创建方法
    createFireParticleImage() {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        
        // 创建火焰渐变
        const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, 'rgba(255, 255, 0, 1.0)');
        gradient.addColorStop(0.3, 'rgba(255, 165, 0, 0.9)');
        gradient.addColorStop(0.7, 'rgba(255, 69, 0, 0.7)');
        gradient.addColorStop(1, 'rgba(255, 0, 0, 0.0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(16, 16, 16, 0, Math.PI * 2);
        ctx.fill();
        
        return canvas;
    }
    
    createConflagrationImage() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        // 创建大火渐变
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
        gradient.addColorStop(0.2, 'rgba(255, 255, 0, 0.9)');
        gradient.addColorStop(0.5, 'rgba(255, 140, 0, 0.8)');
        gradient.addColorStop(0.8, 'rgba(255, 69, 0, 0.6)');
        gradient.addColorStop(1, 'rgba(139, 0, 0, 0.0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(32, 32, 32, 0, Math.PI * 2);
        ctx.fill();
        
        return canvas;
    }
    
    createSmokeParticleImage() {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        
        // 创建烟雾渐变
        const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, 'rgba(128, 128, 128, 0.6)');
        gradient.addColorStop(0.6, 'rgba(105, 105, 105, 0.4)');
        gradient.addColorStop(1, 'rgba(64, 64, 64, 0.0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(16, 16, 16, 0, Math.PI * 2);
        ctx.fill();
        
        return canvas;
    }
    
    // 显示战术帧指示器
    showTacticalFrameIndicator(animation, frame, frameIndex) {
        if (!animation.targetLocation) return;
        
        const indicator = this.viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(
                animation.targetLocation.lon,
                animation.targetLocation.lat,
                200 + frameIndex * 30
            ),
            name: `战术帧 ${frameIndex + 1}`,
            point: {
                pixelSize: 20,
                color: Cesium.Color.YELLOW.withAlpha(0.9),
                outlineColor: Cesium.Color.RED,
                outlineWidth: 3
            },
            label: {
                text: `${frameIndex + 1}. ${frame.description}`,
                font: 'bold 14px Arial',
                fillColor: Cesium.Color.WHITE,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 2,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                pixelOffset: new Cesium.Cartesian2(0, -40),
                backgroundColor: Cesium.Color.BLACK.withAlpha(0.7)
            }
        });
        
        // 3秒后移除指示器
        setTimeout(() => {
            this.viewer.entities.remove(indicator);
        }, 3000);
        
        // 闪烁效果
        const originalColor = indicator.point.color;
        for (let i = 0; i < 6; i++) {
            setTimeout(() => {
                indicator.point.color = i % 2 === 0 ? Cesium.Color.WHITE : originalColor;
            }, i * 200);
        }
    }
    
    // 完成战术动画
    completeTacticalAnimation(animation) {
        console.log(`战术动画完成: ${animation.type}`);
        
        animation.status = "completed";
        animation.endTime = Date.now();
        
        // 清理相关效果
        this.cleanupTacticalEffects(animation);
        
        // 显示完成效果
        this.showTacticalCompletionEffect(animation);
        
        // 调用完成回调
        animation.onComplete(animation);
        
        // 从活跃战术中移除
        this.activeTacticalEffects.delete(animation.id);
    }
    
    // 清理战术效果
    cleanupTacticalEffects(animation) {
        // 清理相关的临时实体和粒子系统
        // 这里需要根据具体的战术类型进行清理
        console.log(`清理战术效果: ${animation.type}`);
    }
    
    // 显示完成效果
    showTacticalCompletionEffect(animation) {
        if (!animation.targetLocation) return;
        
        const completionMarker = this.viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(
                animation.targetLocation.lon,
                animation.targetLocation.lat,
                300
            ),
            point: {
                pixelSize: 30,
                color: Cesium.Color.GREEN.withAlpha(0.9),
                outlineColor: Cesium.Color.WHITE,
                outlineWidth: 4
            },
            label: {
                text: "✅ 战术完成",
                font: 'bold 16px Arial',
                fillColor: Cesium.Color.GREEN,
                outlineColor: Cesium.Color.WHITE,
                outlineWidth: 2,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                pixelOffset: new Cesium.Cartesian2(0, -50),
                backgroundColor: Cesium.Color.BLACK.withAlpha(0.8)
            }
        });
        
        setTimeout(() => {
            this.viewer.entities.remove(completionMarker);
        }, 5000);
    }
    
    // 获取活跃战术效果
    getActiveTacticalEffects() {
        return Array.from(this.activeTacticalEffects.values());
    }
    
    // 停止特定战术
    stopTacticalAnimation(animationId) {
        const animation = this.activeTacticalEffects.get(animationId);
        if (animation) {
            this.cleanupTacticalEffects(animation);
            this.activeTacticalEffects.delete(animationId);
            console.log(`停止战术动画: ${animationId}`);
        }
    }
    
    // 停止所有战术
    stopAllTacticalAnimations() {
        console.log(`停止所有战术动画，共 ${this.activeTacticalEffects.size} 个`);
        
        for (const [animationId, animation] of this.activeTacticalEffects) {
            this.cleanupTacticalEffects(animation);
        }
        
        this.activeTacticalEffects.clear();
    }
}

// 全局导出
if (typeof window !== 'undefined') {
    window.TacticalAnimationSystem = TacticalAnimationSystem;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = TacticalAnimationSystem;
}