/**
 * 教学演示模式
 * 提供互动式军事历史教学和战术分析功能
 */

class EducationalSystem {
    constructor(viewer, battleSystem) {
        this.viewer = viewer;
        this.battleSystem = battleSystem;
        this.currentLesson = null;
        this.studentProgress = new Map();
        this.learningModules = new Map();
        this.interactiveElements = new Map();
        this.quizSystem = new QuizSystem();
        this.assessmentSystem = new AssessmentSystem();
        
        this.setupLearningModules();
        this.initializeStudentProfile();
    }
    
    setupLearningModules() {
        this.learningModules = {
            // 古代军事战术模块
            ancient_tactics: {
                id: "ancient_tactics",
                title: "古代军事战术",
                description: "学习古代文明的经典战术和军事思想",
                difficulty: "beginner",
                estimatedTime: 30, // 分钟
                prerequisites: [],
                objectives: [
                    "理解希腊方阵的战术原理",
                    "掌握罗马军团战术特点",
                    "了解古代火攻战术的运用"
                ],
                lessons: [
                    {
                        id: "phalanx_formation",
                        title: "希腊方阵战术",
                        content: {
                            introduction: "希腊方阵是古代最著名的步兵战术之一...",
                            theory: "方阵由重装步兵组成，使用长矛和盾牌...",
                            practical: "让我们在赤壁之战中观察方阵的应用..."
                        },
                        interactive: {
                            type: "formation_demo",
                            parameters: {
                                battle: "chibi_208",
                                focus: "hoplite_formation",
                                timeRange: [0, 5000]
                            }
                        },
                        assessment: {
                            questions: [
                                {
                                    type: "multiple_choice",
                                    question: "希腊方阵的主要优势是什么？",
                                    options: ["机动性强", "防御力强", "射程远", "成本低"],
                                    correct: 1,
                                    explanation: "希腊方阵的主要优势是强大的防御能力。"
                                }
                            ]
                        }
                    },
                    {
                        id: "roman_tactics",
                        title: "罗马军团战术",
                        content: {
                            introduction: "罗马军团代表了古代军事组织的巅峰...",
                            theory: "罗马军团的成功在于其纪律性和适应性...",
                            practical: "观察罗马军团在各种地形中的表现..."
                        },
                        interactive: {
                            type: "terrain_analysis",
                            parameters: {
                                scenarios: ["hastings_1066", "medieval_battles"]
                            }
                        }
                    }
                ]
            },
            
            // 中世纪战争模块
            medieval_warfare: {
                id: "medieval_warfare",
                title: "中世纪战争艺术",
                description: "探索中世纪的骑士精神和攻城战术",
                difficulty: "intermediate",
                estimatedTime: 45,
                prerequisites: ["ancient_tactics"],
                objectives: [
                    "理解骑士冲锋的战术价值",
                    "掌握攻城战的策略要素",
                    "分析地形对中世纪战争的影响"
                ],
                lessons: [
                    {
                        id: "knight_tactics",
                        title: "骑士战术与冲锋",
                        content: {
                            introduction: "中世纪骑士代表了贵族军事阶层...",
                            theory: "重装骑兵的冲击力是战场决定性因素...",
                            practical: "在黑斯廷斯战役中观察诺曼骑士的冲锋..."
                        },
                        interactive: {
                            type: "cavalry_charge_sim",
                            parameters: {
                                battle: "hastings_1066",
                                focus: "norman_charge",
                                allowIntervention: true
                            }
                        }
                    },
                    {
                        id: "siege_warfare",
                        title: "攻城战艺术",
                        content: {
                            introduction: "攻城战是中世纪最具挑战性的军事行动...",
                            theory: "成功的攻城需要耐心、技巧和资源...",
                            practical: "模拟一场完整的攻城战..."
                        }
                    }
                ]
            },
            
            // 现代战争模块
            modern_warfare: {
                id: "modern_warfare",
                title: "现代战争演进",
                description: "了解从拿破仑时代到现代的军事变革",
                difficulty: "advanced",
                estimatedTime: 60,
                prerequisites: ["ancient_tactics", "medieval_warfare"],
                objectives: [
                    "分析线列步兵战术的发展",
                    "理解炮兵在现代战争中的作用",
                    "掌握机械化战争的特征"
                ],
                lessons: [
                    {
                        id: "napoleonic_tactics",
                        title: "拿破仑战争艺术",
                        content: {
                            introduction: "拿破仑代表了军事天才和战略创新的巅峰...",
                            theory: "线列步兵和火炮的结合创造了新的战术可能性...",
                            practical: "在滑铁卢战役中分析拿破仑的战术决策..."
                        },
                        interactive: {
                            type: "battle_simulation",
                            parameters: {
                                battle: "waterloo_1815",
                                allowTacticalChanges: true,
                                aiOpponent: "historical_accurate"
                            }
                        }
                    }
                ]
            },
            
            // 战术分析模块
            tactical_analysis: {
                id: "tactical_analysis",
                title: "战术分析技巧",
                description: "学习如何分析和评估军事战术",
                difficulty: "expert",
                estimatedTime: 90,
                prerequisites: ["ancient_tactics", "medieval_warfare", "modern_warfare"],
                objectives: [
                    "掌握战术分析的基本方法",
                    "学会识别战术优势和劣势",
                    "能够预测战术结果"
                ],
                lessons: [
                    {
                        id: "terrain_analysis",
                        title: "地形分析",
                        content: {
                            introduction: "地形是影响战术选择的关键因素...",
                            theory: "不同的地形提供不同的战术机会和限制...",
                            practical: "分析多个历史战役的地形影响..."
                        },
                        interactive: {
                            type: "terrain_comparison",
                            parameters: {
                                battles: ["chibi_208", "hastings_1066", "waterloo_1815"],
                                analysisType: "comprehensive"
                            }
                        }
                    }
                ]
            }
        };
    }
    
    initializeStudentProfile() {
        this.studentProfile = {
            id: "student_" + Date.now(),
            name: "学员",
            level: "beginner",
            completedModules: [],
            currentProgress: {
                currentModule: null,
                currentLesson: null,
                timeSpent: 0,
                score: 0
            },
            achievements: [],
            preferences: {
                difficulty: "adaptive",
                learningStyle: "visual",
                pace: "normal"
            }
        };
    }
    
    // 开始学习模块
    async startLearningModule(moduleId) {
        const module = this.learningModules.get(moduleId);
        if (!module) {
            console.error(`学习模块不存在: ${moduleId}`);
            return false;
        }
        
        // 检查先决条件
        if (!this.checkPrerequisites(module)) {
            console.warn("先决条件未满足");
            return false;
        }
        
        console.log(`开始学习模块: ${module.title}`);
        
        this.currentModule = module;
        this.studentProfile.currentProgress.currentModule = moduleId;
        
        // 显示模块介绍
        await this.showModuleIntroduction(module);
        
        // 开始第一课
        await this.startLesson(module.lessons[0].id);
        
        return true;
    }
    
    // 检查先决条件
    checkPrerequisites(module) {
        const prerequisites = module.prerequisites || [];
        
        for (const prereq of prerequisites) {
            if (!this.studentProfile.completedModules.includes(prereq)) {
                return false;
            }
        }
        
        return true;
    }
    
    // 显示模块介绍
    async showModuleIntroduction(module) {
        const introDialog = this.createIntroDialog(module);
        this.viewer.container.appendChild(introDialog);
        
        return new Promise(resolve => {
            introDialog.querySelector('.start-button').addEventListener('click', () => {
                introDialog.remove();
                resolve();
            });
        });
    }
    
    // 创建介绍对话框
    createIntroDialog(module) {
        const dialog = document.createElement('div');
        dialog.className = 'educational-dialog';
        dialog.innerHTML = `
            <div class="dialog-content">
                <h2>${module.title}</h2>
                <p class="description">${module.description}</p>
                <div class="module-info">
                    <div class="info-item">
                        <span class="label">难度:</span>
                        <span class="value">${this.getDifficultyLabel(module.difficulty)}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">预计时间:</span>
                        <span class="value">${module.estimatedTime} 分钟</span>
                    </div>
                    <div class="info-item">
                        <span class="label">课程数量:</span>
                        <span class="value">${module.lessons.length} 课</span>
                    </div>
                </div>
                <div class="objectives">
                    <h3>学习目标:</h3>
                    <ul>
                        ${module.objectives.map(obj => `<li>${obj}</li>`).join('')}
                    </ul>
                </div>
                <button class="start-button">开始学习</button>
            </div>
        `;
        
        return dialog;
    }
    
    // 开始课程
    async startLesson(lessonId) {
        const lesson = this.currentModule.lessons.find(l => l.id === lessonId);
        if (!lesson) {
            console.error(`课程不存在: ${lessonId}`);
            return false;
        }
        
        console.log(`开始课程: ${lesson.title}`);
        
        this.currentLesson = lesson;
        this.studentProfile.currentProgress.currentLesson = lessonId;
        
        // 显示课程内容
        await this.showLessonContent(lesson);
        
        // 开始互动环节
        if (lesson.interactive) {
            await this.startInteractiveElement(lesson.interactive);
        }
        
        return true;
    }
    
    // 获取难度标签
    getDifficultyLabel(difficulty) {
        const labels = {
            beginner: "初级",
            intermediate: "中级",
            advanced: "高级",
            expert: "专家级"
        };
        return labels[difficulty] || difficulty;
    }
    
    // 评估系统
    assessStudentPerformance(lessonId, results) {
        const assessment = this.assessmentSystem.evaluate(results);
        
        // 更新学习进度
        this.updateStudentProgress(lessonId, assessment);
        
        // 显示评估结果
        this.showAssessmentResults(assessment);
        
        return assessment;
    }
    
    // 更新学习进度
    updateStudentProgress(lessonId, assessment) {
        const progress = this.studentProfile.currentProgress;
        
        // 更新分数
        progress.score = (progress.score + assessment.score) / 2;
        
        // 记录完成时间
        if (assessment.completed) {
            if (!progress.completedLessons) {
                progress.completedLessons = [];
            }
            progress.completedLessons.push(lessonId);
            
            // 检查模块是否完成
            if (this.isModuleComplete()) {
                this.completeCurrentModule();
            }
        }
    }
    
    // 检查模块是否完成
    isModuleComplete() {
        if (!this.currentModule) return false;
        
        const progress = this.studentProfile.currentProgress;
        const completedLessons = progress.completedLessons || [];
        
        return completedLessons.length >= this.currentModule.lessons.length;
    }
    
    // 完成当前模块
    completeCurrentModule() {
        const moduleId = this.studentProfile.currentProgress.currentModule;
        
        if (!this.studentProfile.completedModules.includes(moduleId)) {
            this.studentProfile.completedModules.push(moduleId);
        }
        
        // 显示完成庆祝
        this.showModuleCompletionCelebration();
        
        // 建议下一个模块
        this.suggestNextModule();
    }
    
    // 清理所有互动元素
    cleanup() {
        for (const [key, element] of this.interactiveElements) {
            if (element && element.remove) {
                element.remove();
            }
        }
        this.interactiveElements.clear();
        
        console.log("教学系统清理完成");
    }
}

// 问答系统
class QuizSystem {
    constructor() {
        this.currentQuestion = null;
        this.questions = [];
        this.score = 0;
        this.attempts = 0;
    }
}

// 评估系统
class AssessmentSystem {
    evaluate(results) {
        const score = this.calculateScore(results);
        const grade = this.getGrade(score);
        const feedback = this.generateFeedback(results, grade);
        
        return {
            score: score,
            grade: grade,
            feedback: feedback,
            completed: score >= 70, // 70分及格
            recommendations: this.generateRecommendations(results)
        };
    }
    
    calculateScore(results) {
        const correct = results.filter(r => r.correct).length;
        const total = results.length;
        return (correct / total) * 100;
    }
    
    getGrade(score) {
        if (score >= 90) return 'A';
        if (score >= 80) return 'B';
        if (score >= 70) return 'C';
        if (score >= 60) return 'D';
        return 'F';
    }
    
    generateFeedback(results, grade) {
        return {
            summary: `您本次评估获得了 ${grade} 等级。`,
            strengths: [],
            improvements: [],
            nextSteps: []
        };
    }
    
    generateRecommendations(results) {
        return ["继续学习", "加强练习"];
    }
}

// 全局导出
if (typeof window !== 'undefined') {
    window.EducationalSystem = EducationalSystem;
    window.QuizSystem = QuizSystem;
    window.AssessmentSystem = AssessmentSystem;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EducationalSystem, QuizSystem, AssessmentSystem };
}