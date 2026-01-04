/**
 * 兵种系统数据结构
 * 适用于《全面战争》风格的历史战役可视化
 */
/**
 * 兵种系统数据结构
 * 适用于《全面战争》风格的历史战役可视化
 */

// 古代兵种 (Ancient Period)
const ancientUnits = {
    // 步兵类
    infantry: {
        hoplite: {
            name: "重装步兵(希腊方阵)",
            period: "古希腊",
            visual_attributes: {
                icon: "⚔️",
                color: "#8B4513",
                model_type: "humanoid",
                size_scale: 1.0
            },
            tactical_properties: {
                speed: 3,
                attack_power: 8,
                defense_rating: 10,
                range: 1,
                charge_bonus: 3,
                morale: 8
            },
            formation_compatibility: ["phalanx", "testudo"],
            historical_accuracy: "高度准确",
            special_abilities: ["shield_wall", "phalanx_formation"],
            cost_influence: 0.8,
            description: "重装步兵使用长矛和盾牌组成密集方阵，是古代步兵的主力。"
        },
        legionnaire: {
            name: "罗马军团兵",
            period: "古罗马",
            visual_attributes: {
                icon: "🛡️",
                color: "#CD853F",
                model_type: "humanoid",
                size_scale: 1.0
            },
            tactical_properties: {
                speed: 4,
                attack_power: 9,
                defense_rating: 9,
                range: 1,
                charge_bonus: 4,
                morale: 9
            },
            formation_compatibility: ["testudo", "triple_line"],
            historical_accuracy: "高度准确",
            special_abilities: ["pilum_throw", "shield_wall", "testudo"],
            cost_influence: 1.0,
            description: "罗马军团兵以其纪律性和先进战术闻名于世。"
        },
        archer: {
            name: "弓箭手",
            period: "古代通用",
            visual_attributes: {
                icon: "🏹",
                color: "#228B22",
                model_type: "humanoid",
                size_scale: 0.9
            },
            tactical_properties: {
                speed: 5,
                attack_power: 6,
                defense_rating: 3,
                range: 8,
                charge_bonus: 1,
                morale: 5
            },
            formation_compatibility: ["skirmish_line", "volley"],
            historical_accuracy: "准确",
            special_abilities: ["long_range", "flaming_arrows", "rain_of_arrows"],
            cost_influence: 0.6,
            description: "远程攻击单位，负责削弱敌人战线。"
        },
        peltast: {
            name: "轻装步兵(投石兵)",
            period: "古希腊",
            visual_attributes: {
                icon: "🗡️",
                color: "#DDA0DD",
                model_type: "humanoid",
                size_scale: 0.9
            },
            tactical_properties: {
                speed: 6,
                attack_power: 4,
                defense_rating: 2,
                range: 4,
                charge_bonus: 2,
                morale: 6
            },
            formation_compatibility: ["skirmish", "hit_and_run"],
            historical_accuracy: "准确",
            special_abilities: ["javelin_volley", "hit_and_run"],
            cost_influence: 0.5,
            description: "轻装机动部队，适合骚扰和游击战术。"
        }
    },

    // 骑兵类
    cavalry: {
        heavy_cavalry: {
            name: "重装骑兵",
            period: "古代通用",
            visual_attributes: {
                icon: "🐎",
                color: "#696969",
                model_type: "mounted",
                size_scale: 1.3
            },
            tactical_properties: {
                speed: 8,
                attack_power: 12,
                defense_rating: 8,
                range: 1,
                charge_bonus: 15,
                morale: 8
            },
            formation_compatibility: ["wedge", "line", "circle"],
            historical_accuracy: "准确",
            special_abilities: ["devastating_charge", "cavalry_formation"],
            cost_influence: 2.0,
            description: "重装骑兵是战场上的决定性力量，拥有强大的冲击力。"
        },
        horse_archer: {
            name: "弓骑兵",
            period: "古代游牧民族",
            visual_attributes: {
                icon: "🏹🐎",
                color: "#D2691E",
                model_type: "mounted",
                size_scale: 1.2
            },
            tactical_properties: {
                speed: 9,
                attack_power: 7,
                defense_rating: 4,
                range: 6,
                charge_bonus: 5,
                morale: 6
            },
            formation_compatibility: ["skirmish_line", "feigned_retreat"],
            historical_accuracy: "高度准确",
            special_abilities: ["parthian_shot", "feigned_retreat", "circular_formation"],
            cost_influence: 1.5,
            description: "机动性极强的远程骑兵，擅长游击战术。"
        },
        cataphract: {
            name: "甲骑具装",
            period: "古代波斯特种",
            visual_attributes: {
                icon: "⚔️🐎",
                color: "#2F4F4F",
                model_type: "mounted",
                size_scale: 1.4
            },
            tactical_properties: {
                speed: 6,
                attack_power: 14,
                defense_rating: 12,
                range: 1,
                charge_bonus: 20,
                morale: 10
            },
            formation_compatibility: ["wedge", "shield_wall", "testudo"],
            historical_accuracy: "历史准确",
            special_abilities: ["impenetrable_charge", "cataphract_formation"],
            cost_influence: 2.5,
            description: "全身披甲的超级重装骑兵，防护力极强。"
        }
    },

    // 特殊兵种
    special: {
        war_elephant: {
            name: "战象",
            period: "古代印度、非洲",
            visual_attributes: {
                icon: "🐘",
                color: "#8B8682",
                model_type: "elephant",
                size_scale: 2.0
            },
            tactical_properties: {
                speed: 5,
                attack_power: 16,
                defense_rating: 10,
                range: 2,
                charge_bonus: 25,
                morale: 12
            },
            formation_compatibility: ["single_file", "breakthrough"],
            historical_accuracy: "准确",
            special_abilities: ["elephant_charge", "trample", "rout_generation"],
            cost_influence: 4.0,
            description: "战象对步兵具有压倒性优势，但容易受惊失控。"
        },
        scythed_chariot: {
            name: "镰刀战车",
            period: "古代波斯",
            visual_attributes: {
                icon: "⚡",
                color: "#8B4513",
                model_type: "chariot",
                size_scale: 1.5
            },
            tactical_properties: {
                speed: 12,
                attack_power: 18,
                defense_rating: 6,
                range: 1,
                charge_bonus: 30,
                morale: 5
            },
            formation_compatibility: ["charge", "breakthrough"],
            historical_accuracy: "历史准确",
            special_abilities: ["scythe_blade", "rapid_charge", "disruption"],
            cost_influence: 3.0,
            description: "配备镰刀的快速战车，适合对付密集步兵方阵。"
        },
        ballista: {
            name: "弩炮(投石机)",
            period: "古代攻城武器",
            visual_attributes: {
                icon: "🏰",
                color: "#A0522D",
                model_type: "siege_engine",
                size_scale: 1.8
            },
            tactical_properties: {
                speed: 1,
                attack_power: 25,
                defense_rating: 8,
                range: 15,
                charge_bonus: 0,
                morale: 0
            },
            formation_compatibility: ["siege_position"],
            historical_accuracy: "准确",
            special_abilities: ["siege_weapon", "long_range", "high_damage"],
            cost_influence: 3.5,
            description: "强大的攻城武器，适合攻击城墙和密集敌军。"
        }
    }
};

// 中世纪兵种 (Medieval Period)
const medievalUnits = {
    // 重甲兵种
    heavy_infantry: {
        knight: {
            name: "骑士",
            period: "中世纪欧洲",
            visual_attributes: {
                icon: "👑",
                color: "#8B0000",
                model_type: "humanoid",
                size_scale: 1.1
            },
            tactical_properties: {
                speed: 5,
                attack_power: 12,
                defense_rating: 11,
                range: 1,
                charge_bonus: 10,
                morale: 11
            },
            formation_compatibility: ["shield_wall", "crusade_formation"],
            historical_accuracy: "高度准确",
            special_abilities: ["feudal_morale", "heavy_armor", "lance_charge"],
            cost_influence: 2.5,
            description: "装备精良的重装骑士，是中世纪欧洲的军事精英。"
        },
        man_at_arms: {
            name: "武装侍从",
            period: "中世纪",
            visual_attributes: {
                icon: "⚔️",
                color: "#708090",
                model_type: "humanoid",
                size_scale: 1.0
            },
            tactical_properties: {
                speed: 4,
                attack_power: 8,
                defense_rating: 8,
                range: 1,
                charge_bonus: 5,
                morale: 8
            },
            formation_compatibility: ["formation_line", "defensive"],
            historical_accuracy: "准确",
            special_abilities: ["professional_soldier", "defensive_formation"],
            cost_influence: 1.2,
            description: "专业的重装步兵，担任城堡守卫和重步兵。"
        }
    },

    // 远程兵种
    ranged: {
        longbowman: {
            name: "长弓手",
            period: "英格兰中世纪",
            visual_attributes: {
                icon: "🏹",
                color: "#228B22",
                model_type: "humanoid",
                size_scale: 0.95
            },
            tactical_properties: {
                speed: 4,
                attack_power: 8,
                defense_rating: 3,
                range: 12,
                charge_bonus: 1,
                morale: 7
            },
            formation_compatibility: ["volley", "arrow_storm"],
            historical_accuracy: "高度准确",
            special_abilities: ["english_longbow", "rain_of_arrows", "piercing_arrows"],
            cost_influence: 0.8,
            description: "英国长弓手以射程和威力闻名，能有效对抗重装骑士。"
        },
        crossbowman: {
            name: "弩手",
            period: "中世纪",
            visual_attributes: {
                icon: "🏹",
                color: "#CD853F",
                model_type: "humanoid",
                size_scale: 0.95
            },
            tactical_properties: {
                speed: 3,
                attack_power: 10,
                defense_rating: 5,
                range: 8,
                charge_bonus: 0,
                morale: 6
            },
            formation_compatibility: ["static_defense", "volley_fire"],
            historical_accuracy: "准确",
            special_abilities: ["mechanical_accuracy", "high_penetration"],
            cost_influence: 1.0,
            description: "使用机械弩的远程兵种，精度高但射速慢。"
        }
    },

    // 轻装兵种
    light_infantry: {
        scout: {
            name: "侦察兵",
            period: "中世纪通用",
            visual_attributes: {
                icon: "👁️",
                color: "#8FBC8F",
                model_type: "humanoid",
                size_scale: 0.9
            },
            tactical_properties: {
                speed: 8,
                attack_power: 3,
                defense_rating: 2,
                range: 3,
                charge_bonus: 2,
                morale: 4
            },
            formation_compatibility: ["skirmish", "reconnaissance"],
            historical_accuracy: "准确",
            special_abilities: ["scouting", "stealth", "hit_and_run"],
            cost_influence: 0.4,
            description: "轻装机动的侦察兵，负责情报收集和骚扰敌人。"
        },
        peasant_militia: {
            name: "农民民兵",
            period: "中世纪",
            visual_attributes: {
                icon: "⛏️",
                color: "#DEB887",
                model_type: "humanoid",
                size_scale: 0.95
            },
            tactical_properties: {
                speed: 3,
                attack_power: 4,
                defense_rating: 4,
                range: 1,
                charge_bonus: 1,
                morale: 3
            },
            formation_compatibility: ["mob_formation", "defensive_circle"],
            historical_accuracy: "准确",
            special_abilities: ["home_advantage", "poor_morale"],
            cost_influence: 0.2,
            description: "临时召集的农民民兵，装备简陋但数量众多。"
        }
    }
};

// 近现代兵种 (Modern Period)
const modernUnits = {
    // 步兵兵种
    infantry: {
        line_infantry: {
            name: "线列步兵",
            period: "拿破仑时代",
            visual_attributes: {
                icon: "🔫",
                color: "#2F4F4F",
                model_type: "humanoid",
                size_scale: 1.0
            },
            tactical_properties: {
                speed: 3,
                attack_power: 6,
                defense_rating: 4,
                range: 1,
                charge_bonus: 3,
                morale: 6
            },
            formation_compatibility: ["linear_formation", "volley_fire"],
            historical_accuracy: "高度准确",
            special_abilities: ["bayonet_charge", "volley_fire", "linear_tactics"],
            cost_influence: 0.8,
            description: "使用火枪的线列步兵，采用排枪齐射战术。"
        },
        rifled_infantry: {
            name: "来复枪步兵",
            period: "19世纪",
            visual_attributes: {
                icon: "🔫",
                color: "#556B2F",
                model_type: "humanoid",
                size_scale: 1.0
            },
            tactical_properties: {
                speed: 4,
                attack_power: 8,
                defense_rating: 5,
                range: 3,
                charge_bonus: 2,
                morale: 7
            },
            formation_compatibility: ["skirmish_line", "fire_superiority"],
            historical_accuracy: "准确",
            special_abilities: ["rifled_accuracy", "long_range", "improved_firepower"],
            cost_influence: 1.2,
            description: "使用来复枪的步兵，精度和射程大幅提升。"
        },
        storm_trooper: {
            name: "突击兵",
            period: "一战二战",
            visual_attributes: {
                icon: "💣",
                color: "#800000",
                model_type: "humanoid",
                size_scale: 1.05
            },
            tactical_properties: {
                speed: 6,
                attack_power: 9,
                defense_rating: 6,
                range: 2,
                charge_bonus: 5,
                morale: 8
            },
            formation_compatibility: ["assault_formation", "breakthrough"],
            historical_accuracy: "准确",
            special_abilities: ["assault_specialist", "grenades", "close_combat"],
            cost_influence: 1.8,
            description: "专门用于突击作战的精锐步兵，配备自动武器。"
        }
    },

    // 载具兵种
    vehicles: {
        horse_artillery: {
            name: "马炮",
            period: "拿破仑时代",
            visual_attributes: {
                icon: "💣🐎",
                color: "#8B4513",
                model_type: "artillery",
                size_scale: 1.6
            },
            tactical_properties: {
                speed: 8,
                attack_power: 15,
                defense_rating: 3,
                range: 6,
                charge_bonus: 0,
                morale: 5
            },
            formation_compatibility: ["mobile_artillery", "flanking"],
            historical_accuracy: "高度准确",
            special_abilities: ["mobile_fire", "rapid_deployment"],
            cost_influence: 2.0,
            description: "由马拉动的火炮，具有机动性优势。"
        },
        field_artillery: {
            name: "野炮",
            period: "19世纪",
            visual_attributes: {
                icon: "💣",
                color: "#2F4F4F",
                model_type: "artillery",
                size_scale: 1.8
            },
            tactical_properties: {
                speed: 2,
                attack_power: 20,
                defense_rating: 4,
                range: 8,
                charge_bonus: 0,
                morale: 6
            },
            formation_compatibility: ["static_position", "barrage"],
            historical_accuracy: "准确",
            special_abilities: ["area_damage", "barrage_fire", "destruction"],
            cost_influence: 2.5,
            description: "野战火炮，提供强大的火力支援。"
        },
        tank: {
            name: "坦克",
            period: "一战二战",
            visual_attributes: {
                icon: "🛡️🔫",
                color: "#2E8B57",
                model_type: "tank",
                size_scale: 1.8
            },
            tactical_properties: {
                speed: 6,
                attack_power: 12,
                defense_rating: 14,
                range: 3,
                charge_bonus: 8,
                morale: 10
            },
            formation_compatibility: ["tank_column", "breakthrough", "armored_assault"],
            historical_accuracy: "准确",
            special_abilities: ["armored_shield", "breakthrough_charge", "mechanized_warfare"],
            cost_influence: 3.5,
            description: "现代陆战之王，融合了火力、机动性和防护。"
        }
    },

    // 空中兵种
    aircraft: {
        fighter_plane: {
            name: "战斗机",
            period: "二战及以后",
            visual_attributes: {
                icon: "✈️",
                color: "#4169E1",
                model_type: "aircraft",
                size_scale: 1.4
            },
            tactical_properties: {
                speed: 15,
                attack_power: 10,
                defense_rating: 8,
                range: 10,
                charge_bonus: 5,
                morale: 8
            },
            formation_compatibility: ["air_superiority", "fighter_sweep"],
            historical_accuracy: "准确",
            special_abilities: ["air_dominance", "high_speed", "aerial_maneuvers"],
            cost_influence: 4.0,
            description: "制空权争夺的关键力量。"
        },
        bomber: {
            name: "轰炸机",
            period: "二战及以后",
            visual_attributes: {
                icon: "✈️💣",
                color: "#696969",
                model_type: "aircraft",
                size_scale: 2.0
            },
            tactical_properties: {
                speed: 10,
                attack_power: 25,
                defense_rating: 6,
                range: 15,
                charge_bonus: 0,
                morale: 7
            },
            formation_compatibility: ["strategic_bombing", "formation_flying"],
            historical_accuracy: "准确",
            special_abilities: ["strategic_strike", "heavy_payload", "long_range"],
            cost_influence: 5.0,
            description: "战略轰炸力量，能够对敌方后方造成重大破坏。"
        }
    }
};

// 兵种属性枚举
const unitEnums = {
    unit_types: ["infantry", "cavalry", "ranged", "special", "vehicles", "aircraft"],
    formations: {
        defensive: ["shield_wall", "testudo", "defensive_circle", "castle_wall"],
        offensive: ["wedge", "crusade_formation", "charge", "assault"],
        ranged: ["skirmish_line", "volley", "archer_formation"],
        mobile: ["flanking", "skirmish", "circular_formation"],
        siege: ["siege_position", "barrage", "destruction"]
    },
    terrains: {
        favorable: {
            infantry: ["forest", "rough_terrain"],
            cavalry: ["plains", "open_field"],
            archers: ["elevated_ground", "fortified_position"],
            vehicles: ["roads", "plains"]
        }
    },
    special_abilities: {
        defensive: ["shield_wall", "fortification", "cover", "trench_warfare"],
        offensive: ["charge", "assault", "breakthrough", "flanking"],
        ranged: ["volley_fire", "long_range", "high_accuracy", "area_damage"],
        cavalry: ["devastating_charge", "cavalry_formation", "reconnaissance"],
        artillery: ["barrage", "siege_weapon", "indirect_fire"],
        air_power: ["air_superiority", "strategic_strike", "reconnaissance"]
    }
};

// 战役兵种配置
const battleConfigurations = {
    ancient_battle: {
        period: "ancient",
        battlefield_size: "large",
        typical_composition: {
            infantry: 0.6,
            cavalry: 0.2,
            ranged: 0.15,
            special: 0.05
        },
        tactical_focus: "formation_and_charge",
        terrain_importance: "high",
        morale_factor: "medium"
    },
    medieval_battle: {
        period: "medieval", 
        battlefield_size: "large",
        typical_composition: {
            infantry: 0.4,
            cavalry: 0.3,
            ranged: 0.2,
            special: 0.1
        },
        tactical_focus: "cavalry_charge_and_archery",
        terrain_importance: "high",
        morale_factor: "high"
    },
    modern_battle: {
        period: "modern",
        battlefield_size: "very_large",
        typical_composition: {
            infantry: 0.5,
            vehicles: 0.3,
            artillery: 0.15,
            aircraft: 0.05
        },
        tactical_focus: "firepower_and_mechanized_assault",
        terrain_importance: "medium",
        morale_factor: "low"
    }
};

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ancientUnits,
        medievalUnits,
        modernUnits,
        unitEnums,
        battleConfigurations
    };
}

// 浏览器环境
if (typeof window !== 'undefined') {
    window.UnitSystem = {
        ancientUnits,
        medievalUnits,
        modernUnits,
        unitEnums,
        battleConfigurations
    };
}