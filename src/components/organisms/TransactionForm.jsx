import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { transactionService } from "@/services/api/transactionService";
import { categoryService } from "@/services/api/categoryService";
import { formatDateInput } from "@/utils/date";
import ApperIcon from "@/components/ApperIcon";
import CategoryIcon from "@/components/molecules/CategoryIcon";
import FormField from "@/components/molecules/FormField";
import Button from "@/components/atoms/Button";

const TransactionForm = ({ transaction, onSave, onCancel }) => {
const [formData, setFormData] = useState({
    type: "expense",
    name: "",
    amount: "",
    category: "",
    date: formatDateInput(new Date()),
    description: ""
  })
  const [categories, setCategories] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    if (transaction) {
setFormData({
        type: transaction.type,
        name: transaction.name || "",
        amount: transaction.amount.toString(),
        category: transaction.category,
        date: formatDateInput(transaction.date),
        description: transaction.description
      })
    }
  }, [transaction])

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAll()
      setCategories(data)
    } catch (error) {
      console.error("Failed to load categories:", error)
    }
  }

  const validateForm = () => {
const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = "Please enter a transaction name"
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Please enter a valid amount"
    }
    
    if (!formData.category) {
      newErrors.category = "Please select a category"
    }
    
    if (!formData.date) {
      newErrors.date = "Please select a date"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    
try {
      // Find category ID for lookup field
      const selectedCategory = categories.find(cat => cat.name === formData.category)
const transactionData = {
        name: formData.name.trim(),
        type: formData.type,
        amount: parseFloat(formData.amount),
        date: formData.date,
        description: formData.description,
        category_c: selectedCategory?.Id || null
      }
      if (transaction) {
        await transactionService.update(transaction.Id, transactionData)
        toast.success("Transaction updated successfully!")
      } else {
        await transactionService.create(transactionData)
        toast.success("Transaction added successfully!")
      }

      onSave && onSave()
    } catch (error) {
      console.error("Failed to save transaction:", error)
      toast.error("Failed to save transaction. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const filteredCategories = categories.filter(cat => cat.type === formData.type)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">
          {transaction ? "Edit Transaction" : "Add Transaction"}
        </h3>
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ApperIcon name="X" className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Transaction Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 block">Transaction Type</label>
          <div className="flex gap-3">
            {["income", "expense"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleInputChange("type", type)}
                className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                  formData.type === type
                    ? "border-primary-500 bg-primary-50 text-primary-700"
                    : "border-gray-200 hover:border-gray-300 text-gray-700"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <ApperIcon 
                    name={type === "income" ? "TrendingUp" : "TrendingDown"} 
                    className="h-4 w-4" 
                  />
                  <span className="font-medium capitalize">{type}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

{/* Transaction Name */}
        <FormField
          label="Transaction Name"
          type="input"
          placeholder="e.g., Grocery Shopping, Monthly Salary, Gas Station"
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          error={errors.name}
          className="mb-6"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Amount */}
          <FormField
            label="Amount"
            type="input"
            inputType="number"
            step="0.01"
            placeholder="0.00"
            value={formData.amount}
            onChange={(e) => handleInputChange("amount", e.target.value)}
            error={errors.amount}
          />

          {/* Date */}
          <FormField
            label="Date"
            type="input"
            inputType="date"
            value={formData.date}
            onChange={(e) => handleInputChange("date", e.target.value)}
            error={errors.date}
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 block">Category</label>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {filteredCategories.map((category) => (
              <button
key={category.Id}
                type="button"
                onClick={() => handleInputChange("category", category.name)}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                  formData.category === category.name
                    ? "border-primary-500 bg-primary-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <CategoryIcon category={category.name} size="md" />
                <span className="text-xs font-medium text-center">{category.name}</span>
              </button>
            ))}
          </div>
          {errors.category && (
            <p className="text-sm text-error font-medium">{errors.category}</p>
          )}
        </div>

        {/* Description */}
        <FormField
          label="Description (Optional)"
          type="textarea"
          placeholder="Add a note about this transaction..."
          rows="3"
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
        />

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? (
              <>
                <ApperIcon name="Loader2" className="h-4 w-4 mr-2 animate-spin" />
                {transaction ? "Updating..." : "Adding..."}
              </>
            ) : (
              <>
                <ApperIcon name="Check" className="h-4 w-4 mr-2" />
                {transaction ? "Update Transaction" : "Add Transaction"}
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </motion.div>
  )
}

export default TransactionForm