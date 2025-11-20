"use client";

interface CategoryToggleProps {
    categories: string[];
    activeCategory: string;
    onCategoryChange: (category: string) => void;
}

const categoryConfig: Record<string, { gradient: string; icon: string }> = {
    All: { gradient: "from-slate-500 to-slate-600", icon: "🗺️" },
    Home: { gradient: "from-blue-500 to-blue-600", icon: "🏠" },
    Work: { gradient: "from-purple-500 to-purple-600", icon: "💼" },
    Restaurant: { gradient: "from-orange-500 to-orange-600", icon: "🍽️" },
    Park: { gradient: "from-green-500 to-green-600", icon: "🌳" },
    Other: { gradient: "from-gray-500 to-gray-600", icon: "📍" }
};

export default function CategoryToggle({ categories, activeCategory, onCategoryChange }: CategoryToggleProps) {
    return (
        <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
                const config = categoryConfig[category] || categoryConfig.Other;
                const isActive = activeCategory === category;

                return (
                    <button
                        key={category}
                        onClick={() => onCategoryChange(category)}
                        className={`
                            px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300
                            ${isActive
                                ? `bg-linear-to-r ${config.gradient} text-white shadow-lg scale-105 ring-2 ring-offset-2 ring-offset-background ring-primary/20`
                                : 'bg-accent hover:bg-accent/80 text-accent-foreground hover:scale-105'
                            }
                        `} >
                        <span className="mr-1">{config.icon}</span>
                        {category}
                    </button>
                );
            })}
        </div>
    );
}
