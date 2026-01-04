/**
 * 队形变换动画系统
 * 《全面战争》风格的队形动画和战术展示
 */

class FormationAnimationSystem {
    constructor(viewer) {
        this.viewer = viewer;
        this.activeAnimations = new Map();
        this.formationTransitions = new Map();
        this.unitGroups = new Map();
        this.animationSpeed = 1.0;
        this.setupFormationTypes();
    }
    
    setupFormationTypes() {
        this.formations = {
            // 古代队形
            phalanx: {
                name: "希腊方阵",
                description: "密集的重装步兵方阵",
                setupTime: 3000, // 3秒
                unitSpacing: { x: 3, z: 3 },
                combatBonus: { defense: 3, melee: 2, morale: 1 },
                visualEffects: [
                    "shield_wall_formation",
                    "spear_pikes_display",
                    "coordinated_movement"
                ],
                terrainRequirements: ["flat", "open"],
                animationFrames: [
                    {
                        time: 0,
                        action: "dispersed",
                        description: "分散队形"
                    },
                    {
                        time: 1000,
                        action: "gathering",
                        description: "集合"
                    },
                    {
                        time: 2000,
                        action: "formation_setup",
                        description: "方阵设置"
                    },
                    {
                        time: 3000,
                        action: "ready",
                        description: "就绪"
                    }
                ]
            },
            
            // 中世纪队形
            shield_wall: {
                name: "盾牌墙",
                description: "防御性密集队形",
                setupTime: 2000,
                unitSpacing: { x: 2.5, z: 2.5 },
                combatBonus: { defense: 5, ranged: 2, morale: 2 },
                visualEffects: [
                    "shield_formation",
                    "defensive_posture",
                    "counter_attack_ready"
                ],
                terrainRequirements: ["defensive_position", "elevated"],
                animationFrames: [
                    {
                        time: 0,
                        action: "normal_line",
                        description: "普通线阵"
                    },
                    {
                        time: 1000,
                        action: "shield_raise",
                        description: "举盾"
                    },
                    {
                        time: 2000,
                        action: "wall_complete",
                        description: "盾牌墙完成"
                    }
                ]
            },
            
            // 骑兵队形
            cavalry_wedge: {
                name: "骑兵楔形阵",
                description: "突击队形",
                setupTime: 1500,
                unitSpacing: { x: 8, z: 4 },
                combatBonus: { charge: 8, speed: 5, morale: 2 },
                visualEffects: [
                    "charging_movement",
                    "dust_cloud",
                    "lance_charge"
                ],
                terrainRequirements: ["open", "flat"],
                animationFrames: [
                    {
                        time: 0,
                        action: "formation_line",
                        description: "列队"
                    },
                    {
                        time: 500,
                        action: "wedge_shape",
                        description: "楔形"
                    },
                    {
                        time: 1000,
                        action: "charge_ready",
                        description: "准备冲锋"
                    },
                    {
                        time: 1500,
                        action: "charge",
                        description: "冲锋"
                    }
                ]
            },
            
            // 近现代队形
            linear_formation: {
                name: "线列阵",
                description: "拿破仑时代的标准阵型",
                setupTime: 2500,
                unitSpacing: { x: 4, z: 6 },
                combatBonus: { volley_fire: 4, discipline: 3, morale: 2 },
                visualEffects: [
                    "drill_movement",
                    "volley_fire",
                    "bayonet_charge"
                ],
                terrainRequirements: ["open", "flat"],
                animationFrames: [
                    {
                        time: 0,
                        action: "column_march",
                        description: "纵队行军"
                    },
                    {
                        time: 1000,
                        action: "line_deploy",
                        description: "展开为线列"
                    },
                    {
                        time: 2000,
                        action: "ready_formation",
                        description: "就绪队形"
                    }
                ]
            },
            
            // 远程攻击队形
            volley: {
                name: "齐射队形",
                description: "弓箭手或火枪兵的攻击",
                setupTime: 1000,
                unitSpacing: { x: 3, z: 4 },
                combatBonus: { ranged: 6, area_damage: 3, accuracy: 2 },
                visualEffects: [
                    "projectile_rain",
                    "reload_animation",
                    "aim_adjustment"
                ],
                terrainRequirements: ["elevated", "clear_los"],
                animationFrames: [
                    {
                        time: 0,
                        action: "stand_ready",
                        description: "待机"
                    },
                    {
                        time: 300,
                        action: "aim",
                        description: "瞄准"
                    },
                    {
                        time: 500,
                        action: "release",
                        description: "齐射"
                    },
                    {
                        time: 1000,
                        action: "reload",
                        description: "装填"
                    }
                ]
            },
            
            // 防御队形
            defensive_circle: {
                name: "防御圆阵",
                description: "圆形防御队形",
                setupTime: 2000,
                unitSpacing: { x: 2, z: 2 },
                combatBonus: { all_around_defense: 4, morale: 2, flexibility: 1 },
                visualEffects: [
                    "circular_formation",
                    "360_defense",
                    "center_focus"
                ],
                terrainRequirements: ["defensive_position"],
                animationFrames: [
                    {
                        time: 0,
                        action: "scattered",
                        description: "分散"
                    },
                    {
                        time: 1000,
                        action: "circle_form",
                        description: "形成圆阵"
                    },
                    {
                        time: 2000,
                        action: "defense_ready",
                        description: "防御就绪"
                    }
                ]
            }
        };
        
        // 队形变换规则
        this.transitionRules = {
            "phalanx": {
                compatible: ["shield_wall", "linear_formation"],
                incompatible: ["cavalry_wedge", "volley"]
            },
            "shield_wall": {
                compatible: ["phalanx", "defensive_circle"],
                incompatible: ["cavalry_wedge", "linear_formation"]
            },
            "cavalry_wedge": {
                compatible: ["linear_formation"],
                incompatible: ["phalanx", "shield_wall", "volley"]
            },
            "linear_formation": {
                compatible: ["phalanx", "cavalry_wedge", "volley"],
                incompatible: ["shield_wall", "defensive_circle"]
            },
            "volley": {
                compatible: ["linear_formation", "defensive_circle"],
                incompatible: ["phalanx", "shield_wall", "cavalry_wedge"]
            },
            "defensive_circle": {
                compatible: ["shield_wall", "volley"],
                incompatible: ["cavalry_wedge", "linear_formation", "phalanx"]
            }
        };
    }
    
    // 创建队形动画
    async createFormationAnimation(unitGroupId, formationType, options = {}) {
        if (!this.formations[formationType]) {
            console.error(`未知队形类型: ${formationType}`);
            return null;
        }
        
        const formation = this.formations[formationType];
        const unitGroup = this.unitGroups.get(unitGroupId);
        
        if (!unitGroup) {
            console.error(`找不到单位组: ${unitGroupId}`);
            return null;
        }
        
        console.log(`创建队形动画: ${formation.name} for ${unitGroupId}`);
        
        const animationId = `formation_${unitGroupId}_${Date.now()}`;
        const animation = {
            id: animationId,
            type: formationType,
            unitGroupId: unitGroupId,
            startTime: Date.now(),
            duration: formation.setupTime,
            status: "setup",
            frames: formation.animationFrames,
            visualEffects: formation.visualEffects,
            onComplete: options.onComplete || (() => {})
        };
        
        // 检查当前队形兼容性
        if (unitGroup.currentFormation) {
            const currentFormationType = unitGroup.currentFormation;
            if (!this.isFormationCompatible(currentFormationType, formationType)) {
                console.warn(`队形变换不兼容: ${currentFormationType} -> ${formationType}`);
                // 仍然允许变换但会有惩罚
                animation.compatibility = false;
            }
        }
        
        // 创建可视化效果
        await this.setupFormationVisualEffects(animation);
        
        // 开始动画
        this.activeAnimations.set(animationId, animation);
        this.startFormationTransition(animation);
        
        return animation;
    }
    
    // 检查队形兼容性
    isFormationCompatible(fromFormation, toFormation) {
        const fromRules = this.transitionRules[fromFormation];
        if (!fromRules) return true;
        
        return fromRules.compatible.includes(toFormation);
    }
    
    // 设置队形可视化效果
    async setupFormationVisualEffects(animation) {
        const formation = this.formations[animation.type];
        const viewer = this.viewer;
        const unitGroup = this.unitGroups.get(animation.unitGroupId);
        
        // 创建队形边界指示器
        const formationBoundary = this.createFormationBoundary(unitGroup.center, animation.type);
        viewer.entities.add(formationBoundary);
        animation.formationBoundary = formationBoundary;
        
        // 创建动画帧指示器
        formation.animationFrames.forEach((frame, index) => {
            if (index > 0) {
                const frameIndicator = this.createFrameIndicator(unitGroup.center, frame, index);
                viewer.entities.add(frameIndicator);
                if (!animation.frameIndicators) animation.frameIndicators = [];
                animation.frameIndicators.push(frameIndicator);
            }
        });
        
        // 应用战斗加成显示
        if (formation.combatBonus) {
            const bonusDisplay = this.createCombatBonusDisplay(unitGroup.center, formation.combatBonus);
            viewer.entities.add(bonusDisplay);
            animation.bonusDisplay = bonusDisplay;
        }
    }
    
    // 创建队形边界
    createFormationBoundary(center, formationType) {
        const formation = this.formations[formationType];
        const unitCount = 50; // 假设的部队数量
        const spacing = formation.unitSpacing;
        
        // 计算边界
        const radius = Math.sqrt(unitCount) * spacing.x * 1.2;
        
        return {
            position: Cesium.Cartesian3.fromDegrees(center.lon, center.lat, 10),
            name: `队形边界 - ${formation.name}`,
            ellipse: {
                semiMajorAxis: radius,
                semiMinorAxis: radius * 0.8,
                material: new Cesium.ColorMaterialProperty(
                    Cesium.Color.fromCssColorString('#4a90e2').withAlpha(0.3)
                ),
                outline: true,
                outlineColor: Cesium.Color.fromCssColorString('#4a90e2'),
                height: 0
            }
        };
    }
    
    // 创建动画帧指示器
    createFrameIndicator(center, frame, index) {
        const offset = index * 50; // 间距
        
        return {
            position: Cesium.Cartesian3.fromDegrees(
                center.lon, center.lat, 50 + offset
            ),
            name: `帧 ${index + 1}: ${frame.description}`,
            point: {
                pixelSize: 15,
                color: Cesium.Color.YELLOW,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 2
            },
            label: {
                text: `${index + 1}. ${frame.description}`,
                font: '12px Arial',
                fillColor: Cesium.Color.WHITE,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 2,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                pixelOffset: new Cesium.Cartesian2(0, -30)
            }
        };
    }
    
    // 创建战斗加成显示
    createCombatBonusDisplay(center, bonuses) {
        const lines = [];
        Object.entries(bonuses).forEach(([key, value]) => {
            const bonusName = this.translateBonusName(key);
            lines.push(`+${value} ${bonusName}`);
        });
        
        return {
            position: Cesium.Cartesian3.fromDegrees(center.lon, center.lat, 100),
            name: "战斗加成",
            billboard: {
                image: this.createBonusLabel(lines),
                scale: 0.8,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
            }
        };
    }
    
    // 创建加成标签图像
    createBonusLabel(lines) {
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 80 + (lines.length - 1) * 15;
        const ctx = canvas.getContext('2d');
        
        // 背景
        ctx.fillStyle = 'rgba(0, 100, 200, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 边框
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
        
        // 标题
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('战斗加成', canvas.width / 2, 25);
        
        // 加成详情
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '12px Arial';
        lines.forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, 45 + index * 15);
        });
        
        return canvas;
    }
    
    // 翻译加成名称
    translateBonusName(bonusKey) {
        const translations = {
            defense: "防御",
            melee: "近战",
            morale: "士气",
            charge: "冲锋",
            speed: "速度",
            volley_fire: "齐射",
            discipline: "纪律",
            ranged: "远程",
            all_around_defense: "全方位防御",
            flexibility: "灵活性",
            area_damage: "范围伤害",
            accuracy: "精度"
        };
        return translations[bonusKey] || bonusKey;
    }
    
    // 开始队形变换
    startFormationTransition(animation) {
        const { unitGroupId, frames } = animation;
        const unitGroup = this.unitGroups.get(unitGroupId);
        
        // 设置当前帧
        animation.currentFrame = 0;
        animation.status = "transitioning";
        
        console.log(`开始队形变换动画: ${animation.type}`);
        
        // 执行每个动画帧
        frames.forEach((frame, index) => {
            setTimeout(() => {
                this.executeFrame(animation, frame, index);
            }, frame.time);
        });
        
        // 动画完成
        setTimeout(() => {
            this.completeFormationAnimation(animation);
        }, frames[frames.length - 1].time);
    }
    
    // 执行动画帧
    executeFrame(animation, frame, frameIndex) {
        console.log(`执行队形动画帧 ${frameIndex + 1}: ${frame.action}`);
        
        animation.currentFrame = frameIndex;
        
        const unitGroup = this.unitGroups.get(animation.unitGroupId);
        const units = unitGroup.units;
        
        // 为每个单位应用帧动画
        units.forEach((unit, index) => {
            this.animateUnitFrame(unit, frame, frameIndex);
        });
        
        // 播放帧指示器效果
        this.playFrameEffect(animation, frameIndex);
        
        // 更新单位组状态
        unitGroup.currentAnimationFrame = frameIndex;
        unitGroup.animationAction = frame.action;
    }
    
    // 单位帧动画
    animateUnitFrame(unit, frame, frameIndex) {
        const { entity, position } = unit;
        
        // 根据帧动作设置单位位置和属性
        switch (frame.action) {
            case "gathering":
                this.animateGathering(unit, position, frameIndex);
                break;
            case "formation_setup":
                this.animateFormationSetup(unit, frameIndex);
                break;
            case "ready":
                this.animateReadyState(unit, frameIndex);
                break;
            case "dispersed":
                this.animateDispersion(unit, position);
                break;
            default:
                this.animateGenericTransition(unit, frame);
        }
    }
    
    // 收集动画
    animateGathering(unit, originalPosition, frameIndex) {
        const gatherCenter = this.calculateGatherCenter(unit.group);
        const offset = this.calculateGatherOffset(unit.id, unit.group);
        
        const targetPosition = Cesium.Cartesian3.fromDegrees(
            gatherCenter.lon + offset.x,
            gatherCenter.lat + offset.z,
            5 + frameIndex * 2
        );
        
        this.animateEntityPosition(unit.entity, position, targetPosition, 800);
    }
    
    // 队形设置动画
    animateFormationSetup(unit, frameIndex) {
        const formationType = unit.group.currentFormation;
        const offset = this.calculateFormationOffset(unit.id, formationType);
        
        const targetPosition = Cesium.Cartesian3.fromDegrees(
            unit.group.center.lon + offset.x,
            unit.group.center.lat + offset.z,
            10
        );
        
        this.animateEntityPosition(unit.entity, unit.entity.position.getValue(), targetPosition, 1000);
        
        // 添加队形对齐效果
        this.addFormationAlignmentEffect(unit.entity, targetPosition);
    }
    
    // 就绪状态动画
    animateReadyState(unit, frameIndex) {
        // 设置就绪颜色和大小
        const color = Cesium.Color.fromCssColorString('#4ade80'); // 绿色表示就绪
        const scale = 1.0 + frameIndex * 0.1;
        
        if (unit.entity.point) {
            unit.entity.point.color = color;
            unit.entity.point.pixelSize *= scale;
        }
        
        if (unit.entity.billboard) {
            unit.entity.billboard.scale = scale;
        }
    }
    
    // 分散动画
    animateDispersion(unit, originalPosition) {
        // 恢复到分散状态
        this.animateEntityPosition(unit.entity, unit.entity.position.getValue(), originalPosition, 1200);
        
        // 移除队形效果
        this.removeFormationEffects(unit.entity);
    }
    
    // 通用转换动画
    animateGenericTransition(unit, frame) {
        // 通用过渡动画
        console.log(`执行通用过渡: ${frame.action} for unit ${unit.id}`);
    }
    
    // 播放帧效果
    playFrameEffect(animation, frameIndex) {
        const frameIndicators = animation.frameIndicators;
        if (frameIndicators && frameIndicators[frameIndex - 1]) {
            const indicator = frameIndicators[frameIndex - 1];
            
            // 闪烁效果
            if (indicator.point) {
                const originalColor = indicator.point.color;
                indicator.point.color = Cesium.Color.WHITE;
                
                setTimeout(() => {
                    indicator.point.color = originalColor;
                }, 300);
            }
        }
    }
    
    // 计算收集中心
    calculateGatherCenter(unitGroup) {
        // 计算单位组的几何中心
        let totalLon = 0;
        let totalLat = 0;
        let count = 0;
        
        unitGroup.units.forEach(unit => {
            const cartographic = Cesium.Cartographic.fromCartesian(unit.position);
            totalLon += Cesium.Math.toDegrees(cartographic.longitude);
            totalLat += Cesium.Math.toDegrees(cartographic.latitude);
            count++;
        });
        
        return {
            lon: totalLon / count,
            lat: totalLat / count
        };
    }
    
    // 计算收集偏移
    calculateGatherOffset(unitId, unitGroup) {
        // 简化的收集偏移计算
        const hash = this.hashCode(unitId);
        const angle = (hash % 360) * Math.PI / 180;
        const radius = 50 + (hash % 50);
        
        return {
            x: Math.cos(angle) * radius,
            z: Math.sin(angle) * radius
        };
    }
    
    // 计算队形偏移
    calculateFormationOffset(unitIndex, formationType) {
        const formation = this.formations[formationType];
        if (!formation || !formation.unitSpacing) {
            console.warn(`队形类型 ${formationType} 不存在或缺少unitSpacing配置`);
            return { x: 0, z: 0 };
        }
        
        const spacing = formation.unitSpacing;
        const cols = Math.ceil(Math.sqrt(50)); // 假设最多50个单位
        const row = Math.floor(unitIndex / cols);
        const col = unitIndex % cols;
        
        const offsetX = (col - cols / 2) * spacing.x;
        const offsetZ = (row - cols / 2) * spacing.z;
        
        return {
            x: offsetX,
            z: offsetZ
        };
    }
    
    // 实体位置动画
    animateEntityPosition(entity, fromPosition, toPosition, duration) {
        const startTime = Date.now();
        const animationFrames = 30; // 30帧动画
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const easedProgress = this.easeOutCubic(progress);
            
            const position = Cesium.Cartesian3.lerp(fromPosition, toPosition, easedProgress, new Cesium.Cartesian3());
            entity.position = position;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
    
    // 添加队形对齐效果
    addFormationAlignmentEffect(entity, targetPosition) {
        // 创建对齐粒子效果
        const particles = new Cesium.ParticleSystem({
            modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(targetPosition),
            minimumSpeed: 0.5,
            maximumSpeed: 2.0,
            lifetime: 1.0,
            emitter: new Cesium.SphereEmitter(20),
            startScale: 0.5,
            endScale: 1.0,
            startColor: Cesium.Color.CYAN.withAlpha(0.8),
            endColor: Cesium.Color.BLUE.withAlpha(0.0),
            minimumPixelSize: 5,
            maximumPixelSize: 20,
            image: this.createParticleImage(Cesium.Color.CYAN)
        });
        
        this.viewer.scene.primitives.add(particles);
        
        setTimeout(() => {
            this.viewer.scene.primitives.remove(particles);
        }, 1000);
    }
    
    // 移除队形效果
    removeFormationEffects(entity) {
        // 恢复默认外观
        if (entity.point) {
            entity.point.color = Cesium.Color.WHITE;
            entity.point.pixelSize = 20;
        }
        
        if (entity.billboard) {
            entity.billboard.scale = 1.0;
        }
    }
    
    // 缓动函数
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
    
    // 创建粒子图像
    createParticleImage(color) {
        const canvas = document.createElement('canvas');
        canvas.width = 16;
        canvas.height = 16;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = color.toCssColorString();
        ctx.beginPath();
        ctx.arc(8, 8, 6, 0, Math.PI * 2);
        ctx.fill();
        
        return canvas;
    }
    
    // 字符串哈希
    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 转换为32位整数
        }
        return Math.abs(hash);
    }
    
    // 完成队形动画
    completeFormationAnimation(animation) {
        console.log(`队形动画完成: ${animation.type}`);
        
        animation.status = "completed";
        
        // 更新单位组状态
        const unitGroup = this.unitGroups.get(animation.unitGroupId);
        if (unitGroup) {
            unitGroup.currentFormation = animation.type;
            unitGroup.currentAnimationFrame = -1;
            unitGroup.animationAction = "completed";
        }
        
        // 清理可视化效果
        this.cleanupAnimationEffects(animation);
        
        // 调用完成回调
        animation.onComplete(animation);
        
        // 从活跃动画中移除
        this.activeAnimations.delete(animation.id);
    }
    
    // 清理动画效果
    cleanupAnimationEffects(animation) {
        if (animation.formationBoundary) {
            this.viewer.entities.remove(animation.formationBoundary);
        }
        
        if (animation.frameIndicators) {
            animation.frameIndicators.forEach(indicator => {
                this.viewer.entities.remove(indicator);
            });
        }
        
        if (animation.bonusDisplay) {
            this.viewer.entities.remove(animation.bonusDisplay);
        }
    }
    
    // 添加单位组
    addUnitGroup(groupId, units, center) {
        const unitGroup = {
            id: groupId,
            units: units,
            center: center,
            currentFormation: "dispersed",
            currentAnimationFrame: -1,
            animationAction: null
        };
        
        this.unitGroups.set(groupId, unitGroup);
        console.log(`添加单位组: ${groupId}, 单位数量: ${units.length}`);
    }
    
    // 移除单位组
    removeUnitGroup(groupId) {
        const unitGroup = this.unitGroups.get(groupId);
        if (unitGroup) {
            // 取消所有相关动画
            for (const [animationId, animation] of this.activeAnimations) {
                if (animation.unitGroupId === groupId) {
                    this.cleanupAnimationEffects(animation);
                    this.activeAnimations.delete(animationId);
                }
            }
            
            this.unitGroups.delete(groupId);
            console.log(`移除单位组: ${groupId}`);
        }
    }
    
    // 获取活跃动画
    getActiveAnimations() {
        return Array.from(this.activeAnimations.values());
    }
    
    // 获取单位组
    getUnitGroup(groupId) {
        return this.unitGroups.get(groupId);
    }
    
    // 设置动画速度
    setAnimationSpeed(speed) {
        this.animationSpeed = Math.max(0.1, Math.min(5.0, speed));
        console.log(`动画速度设置为: ${this.animationSpeed}x`);
    }
    
    // 停止所有动画
    stopAllAnimations() {
        console.log(`停止所有队形动画，共 ${this.activeAnimations.size} 个`);
        
        for (const [animationId, animation] of this.activeAnimations) {
            this.cleanupAnimationEffects(animation);
        }
        
        this.activeAnimations.clear();
    }
}

// 全局导出
if (typeof window !== 'undefined') {
    window.FormationAnimationSystem = FormationAnimationSystem;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormationAnimationSystem;
}
