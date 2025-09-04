import React from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const CategoryIcon = ({ category, size = "md", className }) => {
  const iconMap = {
    "Food": "UtensilsCrossed",
    "Transport": "Car",
    "Housing": "Home",
    "Entertainment": "Gamepad2",
    "Healthcare": "Heart",
    "Shopping": "ShoppingBag",
    "Education": "GraduationCap",
    "Travel": "Plane",
    "Utilities": "Zap",
    "Insurance": "Shield",
    "Investment": "TrendingUp",
    "Other": "MoreHorizontal",
    "Salary": "Briefcase",
    "Freelance": "Laptop",
    "Business": "Building2",
    "Rental": "KeyRound",
    "Interest": "Percent",
    "Gift": "Gift",
    "Bonus": "Star"
  }

  const colorMap = {
    "Food": "text-orange-600 bg-orange-50",
    "Transport": "text-blue-600 bg-blue-50",
    "Housing": "text-purple-600 bg-purple-50",
    "Entertainment": "text-pink-600 bg-pink-50",
    "Healthcare": "text-red-600 bg-red-50",
    "Shopping": "text-green-600 bg-green-50",
    "Education": "text-indigo-600 bg-indigo-50",
    "Travel": "text-cyan-600 bg-cyan-50",
    "Utilities": "text-yellow-600 bg-yellow-50",
    "Insurance": "text-gray-600 bg-gray-50",
    "Investment": "text-emerald-600 bg-emerald-50",
    "Other": "text-slate-600 bg-slate-50",
    "Salary": "text-primary-600 bg-primary-50",
    "Freelance": "text-violet-600 bg-violet-50",
    "Business": "text-amber-600 bg-amber-50",
    "Rental": "text-teal-600 bg-teal-50",
    "Interest": "text-lime-600 bg-lime-50",
    "Gift": "text-rose-600 bg-rose-50",
    "Bonus": "text-yellow-600 bg-yellow-50"
  }

  const sizes = {
    sm: "p-1.5",
    md: "p-2",
    lg: "p-3"
  }

const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  }

  // Handle both string category names and category objects
  // This prevents "Objects are not valid as a React child" errors
  const categoryName = typeof category === 'string' 
    ? category 
    : category?.name || category?.Name || 'Other'

  const iconName = iconMap[categoryName] || "MoreHorizontal"
  const colorClass = colorMap[categoryName] || "text-gray-600 bg-gray-50"

  return (
    <div className={cn(
      "rounded-lg flex items-center justify-center",
      sizes[size],
      colorClass,
      className
    )}>
      <ApperIcon name={iconName} className={iconSizes[size]} />
    </div>
  )
}

export default CategoryIcon